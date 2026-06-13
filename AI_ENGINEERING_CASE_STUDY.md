# AI Engineering Case Study — AgentEval Studio

**Problem.** Teams ship LLM features without a cheap, repeatable way to tell whether quality is improving or regressing after a prompt/model change.

**Architecture.** Next.js + API routes (no separate backend). A `runner` orchestrates, per variant × case: generate → deterministic checks → LLM-as-judge → aggregate. Runs persist to a minimal `projects/runs/feedback` schema (in-memory in mock mode; Supabase-ready for live).

**AI pipeline.**
- Deterministic checks (`evaluators.ts`): schema validity, must-include/exclude, regex, max-length — free, run first.
- LLM-as-judge (`anthropic.ts`): `claude-haiku-4-5` with a strict JSON output contract (`relevance`, `faithfulness`, `safety`, `rationale`, `confidence`).
- Mock engine (`mock.ts`): seeded PRNG so a suite always evaluates the same way; later variants get a small quality bias so comparisons are meaningful.

**Reliability & trade-offs.**
- Judge noise mitigated with deterministic checks, a rubric, confidence labels, and by surfacing judge/deterministic disagreement.
- Mock-first so the demo and CI never depend on a paid call.
- Best-effort in-memory store on serverless; the run is returned synchronously so durability isn't a dependency.

**What I'd improve next.** Persist runs in Supabase for trend lines over time; add human-label spot-checks to calibrate the judge; add pairwise preference judging; wire live production tracing.

**Interview talking points.** Why deterministic checks precede the judge; how to validate judge quality; framing pass-rate as a release gate.
