"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { app } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

export function AppNav({ liveAvailable }: { liveAvailable: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent font-mono text-xs text-accent-fg">
              AE
            </span>
            {app.name}
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted sm:inline-flex">
            <span className={`h-1.5 w-1.5 rounded-full ${liveAvailable ? "bg-accent" : "bg-muted"}`} />
            {liveAvailable ? "live mode ready" : "mock mode"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {app.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden rounded-full px-3 py-1.5 text-sm transition-colors sm:block ${
                isActive(item.href) ? "bg-elevated text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={app.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full px-3 py-1.5 text-sm text-muted hover:text-fg sm:block"
          >
            GitHub
          </a>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
