import type { CaseResult, ReleaseGate, Run, Suite, VariantSummary } from "./types";
import { runChecks } from "./evaluators";
import { mockGenerate, mockJudge, mockLatencyMs, estimateCost } from "./mock";
import { liveModeAvailable, liveGenerate, liveJudge } from "./anthropic";

const round1 = (n: number) => Math.round(n * 10) / 10;
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;
const quality = (relevance: number, faithfulness: number, safety: number) =>
  round1((relevance + faithfulness + safety) / 3);

// Orchestrates a full evaluation: for each variant × case, generate → deterministic
// checks → judge → aggregate. Mock mode (default) needs no API key.
export async function runEval(
  suite: Suite,
  opts: { mode?: "mock" | "live" } = {}
): Promise<Run> {
  const live = opts.mode === "live" && liveModeAvailable();
  const mode: Run["mode"] = live ? "live" : "mock";
  const results: CaseResult[] = [];

  for (let vi = 0; vi < suite.variants.length; vi++) {
    const variant = suite.variants[vi];
    for (const tc of suite.cases) {
      const t0 = Date.now();
      let output: string;
      if (live) {
        output = await liveGenerate(tc, variant);
      } else {
        output = mockGenerate(tc, variant, vi);
      }

      const deterministic = runChecks(output, tc.checks);

      const judge = live
        ? await liveJudge(suite, tc, output)
        : mockJudge(tc, variant, vi, deterministic.passed);

      const latencyMs = live ? Date.now() - t0 : mockLatencyMs(tc, variant);
      const estCostUsd = estimateCost(variant.model, tc.input.length + (variant.systemPrompt?.length ?? 0), output.length);

      results.push({
        caseId: tc.id,
        variantId: variant.id,
        output,
        deterministic,
        judge,
        quality: quality(judge.relevance, judge.faithfulness, judge.safety),
        latencyMs,
        estCostUsd,
      });
    }
  }

  const summaries = summarize(suite, results);
  const gate = computeGate(suite, summaries);

  return {
    id: `run_${stableId(suite, mode)}`,
    suiteId: suite.id,
    suiteName: suite.name,
    mode,
    createdAt: new Date().toISOString(),
    results,
    summaries,
    gate,
  };
}

function summarize(suite: Suite, results: CaseResult[]): VariantSummary[] {
  return suite.variants.map((v) => {
    const rs = results.filter((r) => r.variantId === v.id);
    const n = rs.length || 1;
    const avg = (sel: (r: CaseResult) => number) => round1(rs.reduce((a, r) => a + sel(r), 0) / n);
    return {
      variantId: v.id,
      variantName: v.name,
      model: v.model,
      avgQuality: avg((r) => r.quality),
      passRate: Math.round((rs.filter((r) => r.deterministic.passed).length / n) * 100),
      avgRelevance: avg((r) => r.judge.relevance),
      avgFaithfulness: avg((r) => r.judge.faithfulness),
      avgSafety: avg((r) => r.judge.safety),
      avgLatencyMs: Math.round(rs.reduce((a, r) => a + r.latencyMs, 0) / n),
      totalCostUsd: round4(rs.reduce((a, r) => a + r.estCostUsd, 0)),
      unsafeCount: rs.filter((r) => r.judge.safety < 3).length,
    };
  });
}

function computeGate(suite: Suite, summaries: VariantSummary[]): ReleaseGate {
  const best = [...summaries].sort((a, b) => b.avgQuality - a.avgQuality)[0];
  const passed = best ? best.avgQuality >= suite.threshold : false;
  return {
    threshold: suite.threshold,
    bestVariantId: best?.variantId ?? "",
    bestAvgQuality: best?.avgQuality ?? 0,
    passed,
    recommendation: passed
      ? `Ship ${best.variantName}: average quality ${best.avgQuality} clears the ${suite.threshold} release gate${best.unsafeCount > 0 ? ", but review the unsafe cases first" : "."}`
      : `Hold the release: best variant (${best?.variantName ?? "—"}) scores ${best?.avgQuality ?? 0}, below the ${suite.threshold} gate. Iterate on the prompt or model.`,
  };
}

// Stable-ish id without Date.now()/random so the same suite+mode reproduces.
function stableId(suite: Suite, mode: string): string {
  let h = 5381;
  const s = `${suite.id}:${mode}:${suite.variants.map((v) => v.id).join(",")}`;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
