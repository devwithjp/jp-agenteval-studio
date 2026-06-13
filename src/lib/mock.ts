import type { JudgeScore, TestCase, Variant } from "./types";

// Deterministic mock engine: stable pseudo-random output and scores seeded by
// (caseId, variantId) so a given suite always evaluates the same way. Later variants
// in a suite get a small quality bias to simulate prompt/model improvements — this
// makes the side-by-side comparison and release gate meaningful in the demo.

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 PRNG seeded from a string.
function rng(seed: string): () => number {
  let a = hashStr(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function mockGenerate(tc: TestCase, variant: Variant, variantIndex: number): string {
  const r = rng(`${tc.id}:${variant.id}:gen`);
  const strong = variantIndex >= 1 || r() > 0.4; // later variants answer more completely
  if (tc.expected && strong) {
    return `${tc.expected}`;
  }
  if (tc.expected) {
    // Weaker variant: partial / hedged answer that may miss a required term.
    return `Based on the input, a reasonable response is: ${tc.expected.split(" ").slice(0, Math.ceil(tc.expected.split(" ").length * 0.6)).join(" ")}…`;
  }
  return `Mock response for "${tc.input.slice(0, 60)}" from ${variant.name}.`;
}

export function mockJudge(
  tc: TestCase,
  variant: Variant,
  variantIndex: number,
  deterministicPassed: boolean
): JudgeScore {
  const r = rng(`${tc.id}:${variant.id}:judge`);
  const bias = Math.min(variantIndex * 0.45, 1.1); // improvement curve across variants
  const base = 3.1 + bias;
  const noise = () => (r() - 0.5) * 0.9;

  let relevance = clamp(base + noise(), 1, 5);
  let faithfulness = clamp(base - 0.1 + noise(), 1, 5);
  const safety = clamp(4.2 + (r() - 0.5) * 0.6, 1, 5);

  // A deterministic failure drags faithfulness/relevance down — the checks and the
  // judge should broadly agree.
  if (!deterministicPassed) {
    relevance = clamp(relevance - 1.0, 1, 5);
    faithfulness = clamp(faithfulness - 1.2, 1, 5);
  }

  const confidence: JudgeScore["confidence"] =
    Math.abs(relevance - faithfulness) > 1.2 ? "low" : r() > 0.5 ? "high" : "medium";

  return {
    relevance: round1(relevance),
    faithfulness: round1(faithfulness),
    safety: round1(safety),
    confidence,
    rationale: deterministicPassed
      ? "Output addresses the task and is grounded in the input; no policy issues detected."
      : "Output misses a required element from the deterministic checks, lowering faithfulness.",
  };
}

export function mockLatencyMs(tc: TestCase, variant: Variant): number {
  const r = rng(`${tc.id}:${variant.id}:lat`);
  return Math.round(700 + r() * 1400);
}

// Rough cost estimate from a tiny price table (USD per 1M tokens). Mock only.
const PRICE: Record<string, { in: number; out: number }> = {
  "claude-opus-4-8": { in: 5, out: 25 },
  "claude-haiku-4-5": { in: 1, out: 5 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
};

export function estimateCost(model: string, inputChars: number, outputChars: number): number {
  const p = PRICE[model] ?? { in: 3, out: 15 };
  const inTok = inputChars / 4;
  const outTok = outputChars / 4;
  const usd = (inTok * p.in + outTok * p.out) / 1_000_000;
  return Math.round(usd * 1e6) / 1e6;
}
