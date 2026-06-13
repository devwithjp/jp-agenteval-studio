import Link from "next/link";
import { app } from "@/lib/site";
import { sampleSuites } from "@/lib/sample-data";
import { Container, Section, SectionHeader, CTA, Eyebrow } from "@/components/ui";

export default function Dashboard() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-line">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="accent-glow absolute inset-0 -z-10" aria-hidden />
        <Container className="py-20 sm:py-28">
          <div className="max-w-3xl">
            <Eyebrow>Evaluation · LLMOps</Eyebrow>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {app.tagline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{app.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <CTA href={`/suites/${sampleSuites[0].id}`}>Try a sample eval</CTA>
              <CTA href="/suites/new" variant="secondary">Build a suite</CTA>
              <CTA href="/how" variant="secondary">How it works</CTA>
            </div>
            <p className="mt-4 font-mono text-xs text-muted">
              Runs in mock mode — no API key required. Add ANTHROPIC_API_KEY to score with real models.
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <SectionHeader
          eyebrow="Sample suites"
          title="Pick a suite and run an eval"
          intro="Each suite compares a baseline variant against an improved one, scores every case on quality, cost, latency, and safety, and recommends whether to ship."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {sampleSuites.map((s) => (
            <Link
              key={s.id}
              href={`/suites/${s.id}`}
              className="group rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent/50"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight group-hover:text-link">{s.name}</h3>
                <span className="font-mono text-xs text-muted">gate ≥ {s.threshold.toFixed(1)}</span>
              </div>
              <p className="mt-2 leading-relaxed text-muted">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[11px] text-muted">
                <span className="rounded-full border border-line px-2 py-0.5">{s.variants.length} variants</span>
                <span className="rounded-full border border-line px-2 py-0.5">{s.cases.length} cases</span>
                <span className="rounded-full border border-line px-2 py-0.5">{s.variants[0].model}</span>
              </div>
              <div className="mt-5 text-sm font-medium text-link group-hover:underline">Open suite →</div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="border-t border-line">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { t: "Deterministic checks first", d: "Schema, must-include/exclude, and regex run before any model call — free and fast." },
            { t: "LLM-as-judge", d: "claude-haiku-4-5 scores relevance, faithfulness, and safety against a rubric with confidence labels." },
            { t: "Release gate", d: "Average quality vs a threshold yields a ship / hold recommendation — not just a wall of scores." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-line bg-surface p-6">
              <div className="font-medium">{c.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
