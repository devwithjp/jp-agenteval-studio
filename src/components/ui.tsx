import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{children}</span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {intro ? <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <As
      className={`rounded-xl border border-line bg-surface p-6 transition-colors ${className}`}
    >
      {children}
    </As>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-elevated px-2.5 py-1 font-mono text-xs text-muted">
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "live" | "mock-demo" | "planned" }) {
  const map = {
    live: { label: "Live", dot: "bg-accent" },
    "mock-demo": { label: "Mock demo", dot: "bg-accent" },
    planned: { label: "Planned", dot: "bg-muted" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-xs text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

type CTAProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  className?: string;
};

export function CTA({ href, children, variant = "primary", external, className = "" }: CTAProps) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-fg hover:opacity-90"
      : "border border-line bg-transparent text-fg hover:bg-elevated";
  const cls = `${base} ${styles} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

// Renders markdown-lite paragraphs: a string array where lines beginning with
// "- " become a bulleted list. Keeps content data plain without an MDX toolchain.
export function Prose({ blocks }: { blocks: string[] }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      out.push(
        <ul key={key} className="my-3 ml-1 space-y-2">
          {list.map((li, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
              <span className="leading-relaxed">{li}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  blocks.forEach((b, i) => {
    if (b.startsWith("- ")) {
      list.push(b.slice(2));
    } else {
      flush(`l-${i}`);
      out.push(
        <p key={`p-${i}`} className="leading-relaxed text-muted">
          {b}
        </p>
      );
    }
  });
  flush("l-end");
  return <div className="space-y-3">{out}</div>;
}
