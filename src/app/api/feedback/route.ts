import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/types";
import { store } from "@/lib/store";

export const runtime = "nodejs";

// POST /api/feedback — body: { runId, rating (1–5), notes? }
export async function POST(req: Request) {
  let body: { runId?: string; rating?: number; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.runId || typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "runId and rating (1–5) are required" }, { status: 400 });
  }

  const fb: Feedback = {
    id: `fb_${body.runId}_${store.getFeedback(body.runId).length + 1}`,
    runId: body.runId,
    rating: body.rating,
    notes: body.notes?.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  store.addFeedback(fb);
  return NextResponse.json({ ok: true, feedback: fb });
}
