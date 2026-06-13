# Security & privacy — AgentEval Studio

## Secrets
- No secrets in source. `ANTHROPIC_API_KEY` is read only server-side (API routes / server modules) and only in live mode.
- `.env.example` ships with blank placeholders; `.env.local` is git-ignored; production secrets live in Vercel env vars.
- The client never receives the API key — generation and judging run in Node API routes (`runtime = "nodejs"`).

## Input validation
- `POST /api/run` rejects malformed JSON and suites without at least one variant and one case.
- `POST /api/feedback` validates `runId` and a 1–5 `rating`; notes are length-capped (2000 chars).

## Data & privacy
- Default mock mode stores nothing externally; runs are computed and returned synchronously.
- The in-memory store is best-effort (warm instance only) and holds no personal data — sample suites only.
- No user uploads in this app; demo data is bundled.

## Rate limiting & cost
- Mock mode makes no model calls (zero cost).
- Live mode uses small `max_tokens` (1024 generation, 512 judge) and the cheap Haiku judge; deterministic checks run first to avoid unnecessary model calls. Add a platform rate limit before exposing live mode publicly.

## Threat model (MVP)
- **Prompt injection** in test inputs: outputs are scored, never executed; the judge is instructed to score, not follow, the content.
- **Leaked keys:** mitigated by server-only access + env management.
- **Excessive token spend:** mock-first default; capped `max_tokens`; deterministic pre-filter.
- **Unsupported claims:** confidence labels + deterministic checks surface low-trust results rather than hiding them.
