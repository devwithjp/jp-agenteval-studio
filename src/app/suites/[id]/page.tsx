import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sampleSuites, getSuite } from "@/lib/sample-data";
import { Container, Section, Eyebrow, Tag } from "@/components/ui";
import { RunView } from "@/components/run-view";

export function generateStaticParams() {
  return sampleSuites.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const suite = getSuite(id);
  return suite ? { title: suite.name, description: suite.description } : { title: "Suite" };
}

export default async function SuitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const suite = getSuite(id);
  if (!suite) notFound();

  return (
    <>
      <div className="border-b border-line">
        <Container className="py-12">
          <Link href="/" className="text-sm text-muted hover:text-fg">
            ← Dashboard
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <Eyebrow>Eval suite</Eyebrow>
            <span className="font-mono text-xs text-muted">release gate ≥ {suite.threshold.toFixed(1)}</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{suite.name}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">{suite.description}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            <span className="text-fg">Task:</span> {suite.task}
          </p>
        </Container>
      </div>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr]">
          <aside>
            <h2 className="text-sm font-medium text-muted">Variants under test</h2>
            <div className="mt-3 space-y-3">
              {suite.variants.map((v) => (
                <div key={v.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="font-medium">{v.name}</div>
                  <div className="mt-1">
                    <Tag>{v.model}</Tag>
                  </div>
                  {v.description ? <p className="mt-2 text-sm text-muted">{v.description}</p> : null}
                </div>
              ))}
            </div>
            <h2 className="mt-6 text-sm font-medium text-muted">Test cases</h2>
            <div className="mt-3 space-y-2">
              {suite.cases.map((c) => (
                <div key={c.id} className="rounded-lg border border-line bg-surface p-3 text-sm">
                  <div className="text-muted">{c.input}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.checks.map((ch, i) => (
                      <span key={i} className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        {ch.type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div>
            <RunView suite={suite} />
          </div>
        </div>
      </Section>
    </>
  );
}
