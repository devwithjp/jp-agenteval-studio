import { NextResponse } from "next/server";
import type { Suite } from "@/lib/types";
import { runEval } from "@/lib/runner";
import { store } from "@/lib/store";

export const runtime = "nodejs";

// POST /api/run — body: { suite: Suite, mode?: "mock" | "live" }
export async function POST(req: Request) {
  let body: { suite?: Suite; mode?: "mock" | "live" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const suite = body.suite;
  if (!suite || !Array.isArray(suite.variants) || !Array.isArray(suite.cases)) {
    return NextResponse.json({ error: "Missing or malformed suite" }, { status: 400 });
  }
  if (suite.variants.length === 0 || suite.cases.length === 0) {
    return NextResponse.json({ error: "Suite needs at least one variant and one case" }, { status: 400 });
  }

  try {
    const run = await runEval(suite, { mode: body.mode ?? "mock" });
    store.saveRun(run);
    return NextResponse.json({ run });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eval failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
