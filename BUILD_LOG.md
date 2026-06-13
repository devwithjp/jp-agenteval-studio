# BUILD_LOG — jp-agenteval-studio

## 2026-06-13

### Completed
- Scaffolded Next.js 16 + TS + Tailwind v4. Ported the golden design system (`globals.css`), `next.config.ts`, and shared `ui` + `theme-toggle` from the portfolio.
- Domain (`src/lib`): `types`, `evaluators` (deterministic checks), `mock` (seeded engine + cost/latency), `anthropic` (live adapter: variant-model generation + Haiku structured-output judge), `runner` (orchestrator → summaries + release gate), `store` (in-memory, Supabase-ready), `analytics`, `sample-data` (2 suites).
- API routes: `POST /api/run`, `GET /api/runs/[id]`, `POST /api/feedback`.
- UI: dashboard, suite detail with interactive `RunView` (run → gate banner → variant comparison → per-case detail → feedback → JSON export), suite builder (`/suites/new`), how-it-works.
- Docs: README, `.env.example` (all optional), CI (lint + tsc + build), SECURITY, AI engineering + AI PM case studies.

### Decisions
- **Mock-first engine** seeded by `(case, variant)` so results are stable and later variants get a small quality bias — makes the comparison + gate demo-meaningful with zero keys. Verified via `POST /api/run`: v2 (3.8) > v1 (3.4), gate correctly HOLD at threshold 4.0.
- **Single-page run flow** (configure → run → report inline) instead of a separate report route — robust on serverless (no cross-request persistence needed); the run is returned synchronously.
- **Live mode is a swappable boundary**: `runner` calls `mock*` or `anthropic.live*` behind one interface; gated on `ANTHROPIC_API_KEY`. Judge uses a strict JSON output contract.
- Cost shown to 4 decimals (real per-case LLM cost is fractions of a cent — honest, not $0.00).

### Status
- `npm run lint` clean; `npx tsc` clean; `npm run build` passes (10 routes, 3 API). Engine verified end-to-end via API.

### Next actions
- Mirror the shared scaffold (`ui`, `theme-toggle`, design system) into the portfolio `_golden/`.
- Clone this structure for SignalDesk (Milestone 2): swap the AI pipeline for RAG (ingest → embed → cluster → retrieve → generate).
- After deploy: capture screenshots, fill live URL + GitHub link in `src/lib/site.ts` and the portfolio.

### Human-only / blocked
- `gh` not authenticated → GitHub push pending.
- Vercel deploy pending JP approval.
