import type { Metadata } from "next";
import { Section, SectionHeader, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "How it works",
  description: "The AgentEval Studio evaluation pipeline and the thinking behind it.",
};

const steps = [
  { n: "1", t: "Suite", d: "A task, a set of test cases (each with deterministic checks), and the prompt/model variants under test." },
  { n: "2", t: "Generate", d: "Each variant produces an output for each case. Mock mode returns deterministic synthetic outputs; live mode runs the real model." },
  { n: "3", t: "Deterministic checks", d: "Schema validity, must-include / exclude, regex, max-length — run first because they're free and catch the obvious failures." },
  { n: "4", t: "LLM-as-judge", d: "claude-haiku-4-5 scores relevance, faithfulness, and safety (1–5) against the task rubric, with a one-line rationale and a confidence label." },
  { n: "5", t: "Aggregate", d: "Per-variant averages for quality, check pass-rate, latency, cost, and unsafe-case count." },
  { n: "6", t: "Release gate", d: "The best variant's average quality is compared to the suite threshold to produce a ship / hold recommendation." },
];

export default function HowPage() {
  return (
    <Section>
      <SectionHeader
        eyebrow="How it works"
        title="From a suite to a release decision"
        intro="The pipeline pairs deterministic checks with an LLM judge so the score is both cheap and defensible — and frames the result as a release gate, not a leaderboard."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 rounded-xl border border-line bg-surface p-5">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line bg-elevated font-mono text-sm text-accent">
              {s.n}
            </span>
            <div>
              <div className="font-medium">{s.t}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-2xl">
        <Eyebrow>Why mock-first</Eyebrow>
        <p className="mt-3 leading-relaxed text-muted">
          The default mode needs no API key and no database, so the demo always works and CI never
          depends on a paid model call. The runner exposes one interface; live mode swaps in the
          Anthropic adapter when <span className="font-mono text-fg">ANTHROPIC_API_KEY</span> is set.
        </p>
        <Eyebrow>Why a judge needs guardrails</Eyebrow>
        <p className="mt-3 leading-relaxed text-muted">
          An LLM judge alone is noisy. Pairing it with deterministic checks, an explicit rubric, and
          confidence labels — and surfacing disagreement rather than hiding it — is what makes the
          eval trustworthy enough to gate a release on.
        </p>
      </div>
    </Section>
  );
}
