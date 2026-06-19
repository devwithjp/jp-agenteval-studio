"use client";

// Toggles the `light` class on <html>. Default (no class) is the dark brand theme.
// Renders BOTH glyphs and lets CSS show the right one based on the html.light class
// (set pre-hydration by the inline script in layout). This keeps server and client
// initial render identical — no hydration mismatch, no setState-in-effect.
export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("light");
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-elevated hover:text-fg"
    >
      <span aria-hidden className="theme-icon-dark text-sm">☀</span>
      <span aria-hidden className="theme-icon-light text-sm">☾</span>
    </button>
  );
}
