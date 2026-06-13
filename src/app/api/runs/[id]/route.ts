import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const runtime = "nodejs";

// GET /api/runs/:id — returns a stored run (best-effort; warm instance only).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = store.getRun(id);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  return NextResponse.json({ run, feedback: store.getFeedback(id) });
}
