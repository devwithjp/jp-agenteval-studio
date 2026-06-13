import type { Feedback, Run } from "./types";

// Best-effort in-memory store. On serverless this persists only within a warm instance;
// the primary flow returns the Run synchronously from POST /api/run, so durability here
// is a convenience, not a dependency. Swap for Supabase (projects/runs/feedback) in
// real mode without changing the API surface.

const runs = new Map<string, Run>();
const feedback = new Map<string, Feedback[]>();

export const store = {
  saveRun(run: Run) {
    runs.set(run.id, run);
  },
  getRun(id: string): Run | undefined {
    return runs.get(id);
  },
  addFeedback(fb: Feedback) {
    const list = feedback.get(fb.runId) ?? [];
    list.push(fb);
    feedback.set(fb.runId, list);
  },
  getFeedback(runId: string): Feedback[] {
    return feedback.get(runId) ?? [];
  },
};
