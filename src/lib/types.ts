// AgentEval Studio — domain types for the evaluation workbench.

export type ModelId = string;

// A prompt/model variant under test.
export type Variant = {
  id: string;
  name: string;
  model: ModelId;
  systemPrompt: string;
  description?: string;
};

// Deterministic checks run before (and independently of) the LLM judge.
export type Check =
  | { type: "includes"; value: string; label?: string }
  | { type: "excludes"; value: string; label?: string }
  | { type: "regex"; value: string; label?: string }
  | { type: "json"; value?: string; label?: string } // value unused; asserts valid JSON
  | { type: "max_length"; value: number; label?: string };

export type TestCase = {
  id: string;
  input: string;
  expected?: string;
  checks: Check[];
};

export type Suite = {
  id: string;
  name: string;
  description: string;
  task: string; // what the model is being asked to do (drives the judge rubric)
  variants: Variant[];
  cases: TestCase[];
  threshold: number; // release gate: min average quality score (1–5)
};

export type CheckResult = {
  label: string;
  passed: boolean;
  detail?: string;
};

export type JudgeScore = {
  relevance: number; // 1–5
  faithfulness: number; // 1–5
  safety: number; // 1–5
  rationale: string;
  confidence: "low" | "medium" | "high";
};

export type CaseResult = {
  caseId: string;
  variantId: string;
  output: string;
  deterministic: { passed: boolean; results: CheckResult[] };
  judge: JudgeScore;
  quality: number; // 1–5 aggregate of judge dimensions
  latencyMs: number;
  estCostUsd: number;
};

export type VariantSummary = {
  variantId: string;
  variantName: string;
  model: string;
  avgQuality: number;
  passRate: number; // deterministic pass rate
  avgRelevance: number;
  avgFaithfulness: number;
  avgSafety: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  unsafeCount: number;
};

export type ReleaseGate = {
  threshold: number;
  bestVariantId: string;
  bestAvgQuality: number;
  passed: boolean;
  recommendation: string;
};

export type Run = {
  id: string;
  suiteId: string;
  suiteName: string;
  mode: "mock" | "live";
  createdAt: string;
  results: CaseResult[];
  summaries: VariantSummary[];
  gate: ReleaseGate;
};

export type Feedback = {
  id: string;
  runId: string;
  rating: number; // 1–5
  notes?: string;
  createdAt: string;
};
