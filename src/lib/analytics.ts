// Minimal analytics event logger with a PostHog-ready shape. In mock/dev it logs to the
// console; wire a real sink (PostHog) by setting NEXT_PUBLIC_POSTHOG_KEY and extending
// `send`. Events match the portfolio's ANALYTICS_EVENTS contract.

export type AnalyticsEvent =
  | "page_view"
  | "demo_started"
  | "core_action_completed"
  | "ai_output_generated"
  | "eval_completed"
  | "export_clicked"
  | "feedback_submitted"
  | "error_seen";

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  const payload = { event, props, ts: new Date().toISOString() };
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", payload);
  }
  // Real sink (PostHog) would go here when configured.
}
