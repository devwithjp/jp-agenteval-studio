# AgentEval Studio

**Know whether your AI is good enough to ship.** An evaluation and observability workbench that compares prompt / model variants on quality, cost, latency, and safety — and turns the result into a **release-gate recommendation**.

Part of [JP's AI portfolio](../jp-ai-portfolio). Built mock-first: the demo runs with **zero API keys**.

> One-line pitch: *LLMOps + evals workbench for prompts, RAG, and agents.*

## Live demo

- _(deploying to Vercel — URL added at launch)_

## What it does

- Create eval **suites** from test cases (each with deterministic checks).
- Register prompt / model **variants** under test.
- **Run batch evals**: deterministic checks → LLM-as-judge → aggregate.
- Score on **relevance, faithfulness, safety**, plus **latency** and **estimated cost**.
- **Compare** variants side by side.
- Get a **release-gate** recommendation (ship / hold) against a threshold.
- **Export** the report as JSON; submit feedback on usefulness.

## How it works

```
suite → generate (per variant × case) → deterministic checks → LLM-as-judge
      → aggregate (quality / cost / latency / safety) → release gate
```

- **Deterministic checks run first** (schema, must-include/exclude, regex, max-length) — free and fast.
- **LLM-as-judge** (`claude-haiku-4-5`) scores the rest against a rubric with confidence labels.
- **Mock mode (default):** a deterministic engine returns synthetic-but-realistic outputs and scores seeded by `(case, variant)` — no key, no DB, stable results.
- **Live mode:** set `ANTHROPIC_API_KEY` and the same interface swaps in the real model (generation by the variant's model, judging by Haiku).

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Anthropic SDK (live mode) · Vercel. Shared design system + UI primitives from the portfolio golden core.

## Architecture

- `src/lib` — `types`, `evaluators` (deterministic checks), `mock` (seeded engine), `anthropic` (live adapter), `runner` (orchestrator), `store` (in-memory; Supabase-ready), `analytics`, `sample-data`.
- `src/app/api` — `POST /api/run`, `GET /api/runs/[id]`, `POST /api/feedback`.
- `src/app` — dashboard, suite detail (run + scorecard + gate + compare + feedback + export), suite builder, how-it-works.
- `src/components` — `run-view` (the interactive eval), `app-nav`, shared `ui` + `theme-toggle`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000 — runs in mock mode, no key needed
npm run lint
npm run build
```

## Environment variables

See `.env.example`. All optional — the app runs fully in mock mode without any.

- `ANTHROPIC_API_KEY` — enables live mode (real generation + judge).

No secrets are committed; `.env.local` is git-ignored.

## Test commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

Import into Vercel (framework preset: Next.js). Optionally add `ANTHROPIC_API_KEY` in Vercel env to enable live mode. Mock mode works with no configuration.

## AI engineering skills demonstrated

LLM evaluation harness, LLM-as-judge with deterministic guardrails, structured-output judging contract, cost/latency observability, mock-first architecture, Next.js API routes.

## AI PM skills demonstrated

Release-gate metric framing, ICP/MVP scoping, a north-star + guardrail metric framework, and an experiment-ready product surface. See `AI_PM_CASE_STUDY.md`.
