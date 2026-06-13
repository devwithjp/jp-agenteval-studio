import type { Check, CheckResult } from "./types";

// Deterministic checks run first — they're free, fast, and catch obvious failures
// before any (paid) model judge call.
export function runChecks(output: string, checks: Check[]): { passed: boolean; results: CheckResult[] } {
  const results: CheckResult[] = checks.map((c) => evalCheck(output, c));
  return { passed: results.every((r) => r.passed), results };
}

function evalCheck(output: string, c: Check): CheckResult {
  switch (c.type) {
    case "includes": {
      const passed = output.toLowerCase().includes(c.value.toLowerCase());
      return { label: c.label ?? `includes "${c.value}"`, passed };
    }
    case "excludes": {
      const passed = !output.toLowerCase().includes(c.value.toLowerCase());
      return { label: c.label ?? `excludes "${c.value}"`, passed };
    }
    case "regex": {
      let passed = false;
      let detail: string | undefined;
      try {
        passed = new RegExp(c.value).test(output);
      } catch {
        detail = "invalid regex";
      }
      return { label: c.label ?? `matches /${c.value}/`, passed, detail };
    }
    case "json": {
      let passed = true;
      try {
        JSON.parse(output);
      } catch {
        passed = false;
      }
      return { label: c.label ?? "valid JSON", passed };
    }
    case "max_length": {
      const passed = output.length <= c.value;
      return { label: c.label ?? `≤ ${c.value} chars`, passed, detail: `${output.length} chars` };
    }
    default:
      return { label: "unknown check", passed: false };
  }
}
