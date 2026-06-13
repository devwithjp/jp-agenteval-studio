"use client";

import { useState } from "react";
import Link from "next/link";
import type { Check, Suite, TestCase, Variant } from "@/lib/types";
import { Container, Section, Eyebrow } from "@/components/ui";
import { RunView } from "@/components/run-view";

const blankCase = (i: number): TestCase => ({
  id: `c${i}`,
  input: "",
  expected: "",
  checks: [],
});

function defaultSuite(): Suite {
  return {
    id: "custom",
    name: "My eval suite",
    description: "A custom suite built in the browser.",
    task: "Answer the user's question accurately and concisely.",
    threshold: 4.0,
    variants: [
      { id: "v1", name: "v1 · baseline", model: "claude-opus-4-8", systemPrompt: "Answer the question." },
      {
        id: "v2",
        name: "v2 · improved",
        model: "claude-opus-4-8",
        systemPrompt: "Answer the question accurately and concisely, using only verifiable facts.",
      },
    ],
    cases: [
      {
        id: "c1",
        input: "What is the capital of France?",
        expected: "Paris",
        checks: [{ type: "includes", value: "Paris", label: 'includes "Paris"' }],
      },
    ],
  };
}

export default function NewSuitePage() {
  const [suite, setSuite] = useState<Suite>(defaultSuite);
  const [built, setBuilt] = useState<Suite | null>(null);

  const update = (patch: Partial<Suite>) => setSuite((s) => ({ ...s, ...patch }));
  const updateVariant = (i: number, patch: Partial<Variant>) =>
    setSuite((s) => ({ ...s, variants: s.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));
  const updateCase = (i: number, patch: Partial<TestCase>) =>
    setSuite((s) => ({ ...s, cases: s.cases.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  function addCase() {
    setSuite((s) => ({ ...s, cases: [...s.cases, blankCase(s.cases.length + 1)] }));
  }
  function removeCase(i: number) {
    setSuite((s) => ({ ...s, cases: s.cases.filter((_, j) => j !== i) }));
  }

  function toggleIncludesCheck(i: number) {
    setSuite((s) => ({
      ...s,
      cases: s.cases.map((c, j) => {
        if (j !== i) return c;
        const has = c.checks.some((ck) => ck.type === "includes");
        if (has) return { ...c, checks: c.checks.filter((ck) => ck.type !== "includes") };
        const term = (c.expected ?? "").split(" ")[0] || c.input.split(" ")[0] || "answer";
        const chk: Check = { type: "includes", value: term, label: `includes "${term}"` };
        return { ...c, checks: [...c.checks, chk] };
      }),
    }));
  }
  function toggleJsonCheck(i: number) {
    setSuite((s) => ({
      ...s,
      cases: s.cases.map((c, j) => {
        if (j !== i) return c;
        const has = c.checks.some((ck) => ck.type === "json");
        return has
          ? { ...c, checks: c.checks.filter((ck) => ck.type !== "json") }
          : { ...c, checks: [...c.checks, { type: "json", label: "valid JSON" } as Check] };
      }),
    }));
  }

  const canRun = suite.cases.length > 0 && suite.cases.every((c) => c.input.trim().length > 0);

  if (built) {
    return (
      <Section>
        <button onClick={() => setBuilt(null)} className="text-sm text-muted hover:text-fg">
          ← Edit suite
        </button>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{built.name}</h1>
        <p className="mt-2 text-muted">{built.description}</p>
        <div className="mt-8">
          <RunView suite={built} />
        </div>
      </Section>
    );
  }

  return (
    <>
      <div className="border-b border-line">
        <Container className="py-10">
          <Link href="/" className="text-sm text-muted hover:text-fg">
            ← Dashboard
          </Link>
          <div className="mt-4">
            <Eyebrow>Create</Eyebrow>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build an eval suite</h1>
            <p className="mt-2 max-w-2xl text-muted">
              Define the task, two variants, and a few test cases with deterministic checks, then run
              it in mock mode.
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <div className="space-y-8">
          {/* Suite meta */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Suite name">
              <input className={inputCls} value={suite.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Release gate (min avg quality)">
              <input
                type="number"
                step="0.1"
                min={1}
                max={5}
                className={inputCls}
                value={suite.threshold}
                onChange={(e) => update({ threshold: Number(e.target.value) })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Task (drives the judge rubric)">
                <input className={inputCls} value={suite.task} onChange={(e) => update({ task: e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Variants */}
          <div>
            <h2 className="text-sm font-medium text-muted">Variants</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {suite.variants.map((v, i) => (
                <div key={v.id} className="rounded-xl border border-line bg-surface p-4">
                  <Field label="Name">
                    <input className={inputCls} value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} />
                  </Field>
                  <div className="mt-3">
                    <Field label="System prompt">
                      <textarea
                        rows={3}
                        className={`${inputCls} resize-y`}
                        value={v.systemPrompt}
                        onChange={(e) => updateVariant(i, { systemPrompt: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="mt-2 font-mono text-xs text-muted">{v.model}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cases */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted">Test cases</h2>
              <button onClick={addCase} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-elevated">
                + Add case
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {suite.cases.map((c, i) => (
                <div key={c.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Input">
                      <input className={inputCls} value={c.input} onChange={(e) => updateCase(i, { input: e.target.value })} />
                    </Field>
                    <Field label="Expected (optional)">
                      <input className={inputCls} value={c.expected ?? ""} onChange={(e) => updateCase(i, { expected: e.target.value })} />
                    </Field>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">Checks:</span>
                    <ChipToggle on={c.checks.some((ck) => ck.type === "includes")} onClick={() => toggleIncludesCheck(i)}>
                      includes expected term
                    </ChipToggle>
                    <ChipToggle on={c.checks.some((ck) => ck.type === "json")} onClick={() => toggleJsonCheck(i)}>
                      valid JSON
                    </ChipToggle>
                    {suite.cases.length > 1 ? (
                      <button onClick={() => removeCase(i)} className="ml-auto text-xs text-muted hover:text-fg">
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBuilt(suite)}
              disabled={!canRun}
              className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              Build &amp; run →
            </button>
            {!canRun ? <span className="text-xs text-muted">Every case needs an input.</span> : null}
          </div>
        </div>
      </Section>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function ChipToggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${
        on ? "border-accent bg-accent/10 text-fg" : "border-line text-muted"
      }`}
    >
      {on ? "✓ " : "+ "}
      {children}
    </button>
  );
}
