"use client";

import { useState } from "react";
import type { CaseResult, Run, Suite } from "@/lib/types";
import { track } from "@/lib/analytics";

function Score({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  const low = value < 3;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-fg">{value.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full ${low ? "bg-muted" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function GateBanner({ run }: { run: Run }) {
  const ok = run.gate.passed;
  return (
    <div
      className={`rounded-xl border p-5 ${
        ok ? "border-accent/50 bg-accent/5" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 items-center rounded-full px-2.5 font-mono text-xs ${
            ok ? "bg-accent text-accent-fg" : "border border-line text-muted"
          }`}
        >
          {ok ? "RELEASE: PASS" : "RELEASE: HOLD"}
        </span>
        <span className="font-mono text-xs text-muted">
          gate ≥ {run.gate.threshold.toFixed(1)} · best {run.gate.bestAvgQuality.toFixed(1)}
        </span>
      </div>
      <p className="mt-3 leading-relaxed">{run.gate.recommendation}</p>
    </div>
  );
}

function VariantCard({ run, variantId }: { run: Run; variantId: string }) {
  const s = run.summaries.find((x) => x.variantId === variantId)!;
  const isBest = run.gate.bestVariantId === variantId;
  return (
    <div className={`rounded-xl border bg-surface p-5 ${isBest ? "border-accent/50" : "border-line"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{s.variantName}</div>
        {isBest ? (
          <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-accent-fg">BEST</span>
        ) : null}
      </div>
      <div className="mt-1 font-mono text-xs text-muted">{s.model}</div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight">{s.avgQuality.toFixed(1)}</span>
        <span className="text-xs text-muted">avg quality / 5</span>
      </div>

      <div className="mt-4 space-y-2.5">
        <Score label="Relevance" value={s.avgRelevance} />
        <Score label="Faithfulness" value={s.avgFaithfulness} />
        <Score label="Safety" value={s.avgSafety} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted">Checks passed</dt>
          <dd className="font-mono">{s.passRate}%</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Avg latency</dt>
          <dd className="font-mono">{s.avgLatencyMs} ms</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Est. cost</dt>
          <dd className="font-mono">${s.totalCostUsd.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Unsafe cases</dt>
          <dd className={`font-mono ${s.unsafeCount ? "text-fg" : "text-muted"}`}>{s.unsafeCount}</dd>
        </div>
      </dl>
    </div>
  );
}

function CaseRow({ suite, run, caseId }: { suite: Suite; run: Run; caseId: string }) {
  const [open, setOpen] = useState(false);
  const tc = suite.cases.find((c) => c.id === caseId)!;
  const rows = run.results.filter((r) => r.caseId === caseId);
  return (
    <div className="rounded-xl border border-line bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="truncate text-sm text-muted">{tc.input}</span>
        <span className="flex flex-none items-center gap-2 font-mono text-xs">
          {rows.map((r) => (
            <span key={r.variantId} className={r.judge.relevance < 3 ? "text-muted" : "text-fg"}>
              {r.quality.toFixed(1)}
            </span>
          ))}
          <span className="text-muted">{open ? "−" : "+"}</span>
        </span>
      </button>
      {open ? (
        <div className="grid gap-4 border-t border-line p-5 md:grid-cols-2">
          {rows.map((r) => (
            <CaseVariant key={r.variantId} suite={suite} r={r} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CaseVariant({ suite, r }: { suite: Suite; r: CaseResult }) {
  const variant = suite.variants.find((v) => v.id === r.variantId)!;
  return (
    <div className="rounded-lg border border-line bg-bg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{variant.name}</span>
        <span className="font-mono text-xs text-muted">{r.latencyMs}ms · ${r.estCostUsd.toFixed(4)}</span>
      </div>
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-elevated p-3 font-mono text-xs text-fg">
        {r.output}
      </pre>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {r.deterministic.results.map((c, i) => (
          <span
            key={i}
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
              c.passed ? "border-accent/50 text-fg" : "border-line text-muted line-through"
            }`}
          >
            {c.passed ? "✓" : "✗"} {c.label}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Mini label="Rel" v={r.judge.relevance} />
        <Mini label="Faith" v={r.judge.faithfulness} />
        <Mini label="Safe" v={r.judge.safety} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Judge ({r.judge.confidence} confidence): {r.judge.rationale}
      </p>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded border border-line px-2 py-1 text-center">
      <div className="text-[10px] text-muted">{label}</div>
      <div className="font-mono">{v.toFixed(1)}</div>
    </div>
  );
}

export function RunView({ suite }: { suite: Suite }) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fbRating, setFbRating] = useState(0);
  const [fbNotes, setFbNotes] = useState("");
  const [fbSent, setFbSent] = useState(false);

  async function run_() {
    setLoading(true);
    setError(null);
    setRun(null);
    setFbSent(false);
    track("demo_started", { suiteId: suite.id });
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ suite, mode: "mock" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Run failed");
      setRun(data.run);
      track("eval_completed", { suiteId: suite.id, gate: data.run.gate.passed });
      track("ai_output_generated", { suiteId: suite.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Run failed";
      setError(msg);
      track("error_seen", { where: "run", msg });
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback() {
    if (!run || fbRating < 1) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ runId: run.id, rating: fbRating, notes: fbNotes }),
    });
    setFbSent(true);
    track("feedback_submitted", { runId: run.id, rating: fbRating });
  }

  function exportJson() {
    if (!run) return;
    const blob = new Blob([JSON.stringify(run, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${suite.id}-eval-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    track("export_clicked", { suiteId: suite.id });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={run_}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Running eval…" : run ? "Re-run eval" : "Run eval"}
        </button>
        {run ? (
          <button
            onClick={exportJson}
            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm hover:bg-elevated"
          >
            Export report (JSON)
          </button>
        ) : null}
        <span className="font-mono text-xs text-muted">
          {suite.variants.length} variants · {suite.cases.length} cases · mock mode (no API key)
        </span>
      </div>

      {error ? (
        <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">⚠ {error}</div>
      ) : null}

      {run ? (
        <>
          <GateBanner run={run} />

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted">Variant comparison</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {suite.variants.map((v) => (
                <VariantCard key={v.id} run={run} variantId={v.id} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted">Per-case detail (click to expand)</h3>
            <div className="space-y-3">
              {suite.cases.map((c) => (
                <CaseRow key={c.id} suite={suite} run={run} caseId={c.id} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="text-sm font-medium">Was this eval useful?</h3>
            {fbSent ? (
              <p className="mt-2 text-sm text-muted">Thanks — feedback recorded.</p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFbRating(n)}
                      className={`h-9 w-9 rounded-full border text-sm ${
                        fbRating >= n ? "border-accent bg-accent/10 text-fg" : "border-line text-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  value={fbNotes}
                  onChange={(e) => setFbNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="h-9 flex-1 rounded-full border border-line bg-bg px-4 text-sm outline-none focus:border-accent/50"
                />
                <button
                  onClick={sendFeedback}
                  disabled={fbRating < 1}
                  className="h-9 rounded-full border border-line px-4 text-sm hover:bg-elevated disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        !loading && (
          <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Click <span className="text-fg">Run eval</span> to score every variant against every case and get a
            release-gate recommendation.
          </div>
        )
      )}
    </div>
  );
}
