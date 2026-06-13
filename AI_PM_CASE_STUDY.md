# AI PM Case Study — AgentEval Studio

**Product problem.** "Is this good enough to ship?" is usually answered with vibes. AgentEval turns it into a measured, repeatable release gate.

**ICP & personas.** A small AI product team or solo builder deploying LLM features without enterprise eval tooling. Jobs: catch regressions before shipping; justify a ship/hold decision to stakeholders.

**MVP scope.**
- In: suite creation, batch eval, deterministic + judge scoring, side-by-side comparison, release-gate recommendation, export, feedback.
- Out (V2): org RBAC, dataset labelling workflows, live production tracing, trend dashboards.

**Metrics.**
- **North star:** % of eval suites passing the release threshold.
- **Activation:** first eval run completed.
- **Retention:** weekly repeated eval runs.
- **Quality:** judge agreement + deterministic pass rate.
- **Guardrail:** unsafe / hallucinated output rate.

**Experiment plan.** Hypothesis: surfacing a release-gate *recommendation* (vs raw scores) increases the rate at which users act on a failing eval. Variant A: scores only. Variant B: scores + recommendation. Success: higher "iterate after fail" rate, no drop in trust rating.

**Roadmap.** MVP (this) → V1: Supabase persistence + trend lines + custom rubrics → V2: production tracing, pairwise judging, team workflows.

**GTM.** Reach solo builders and small AI teams via developer communities and the portfolio; the wedge is "your eval that gates a release, runnable in 30 seconds with no signup."

**Trade-offs.** LLM-judge noise (mitigated by deterministic checks + confidence); chose a release-gate framing over a leaderboard because a decision is more useful than a ranking.
