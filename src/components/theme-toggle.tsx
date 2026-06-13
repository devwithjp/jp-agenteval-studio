"use client";

import { useState } from "react";

// Toggles the `light` class on <html>. Default (no class) is the dark brand theme.
// Initial state is read lazily from the DOM (the pre-hydration script in layout.tsx
// already applied the saved theme); the icon span suppresses hydration warnings since
// its value depends on client-only state.
export function ThemeToggle() {
  const [light, setLight] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("light")
  );

  function toggle() {
    const next = !light;
    setLight(next);
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
      <span aria-hidden suppressHydrationWarning className="text-sm">
        {light ? "☾" : "☀"}
      </span>
    </button>
  );
}
