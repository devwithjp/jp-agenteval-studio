import type { Suite } from "./types";

// Sample suites power the demo with zero setup. Each has 2 variants (a baseline and an
// improved prompt) so the comparison and release gate are meaningful.

export const sampleSuites: Suite[] = [
  {
    id: "support-replies",
    name: "Support reply quality",
    description:
      "Release gate for Meridian Air's support copilot: before agents can send AI-drafted replies to passengers, drafts must be accurate, grounded in the ticket, and inside refund/compensation policy.",
    task: "Draft a concise, friendly reply to an airline customer-support ticket. Use only facts stated in the ticket, name a concrete next step, and never promise refunds or compensation outside published policy.",
    threshold: 4.0,
    variants: [
      {
        id: "v1-baseline",
        name: "v1 · baseline",
        model: "claude-opus-4-8",
        systemPrompt: "You are a customer support agent for an airline. Reply to the passenger's ticket.",
        description: "Minimal prompt — the control we shipped the pilot with.",
      },
      {
        id: "v2-grounded",
        name: "v2 · grounded + policy",
        model: "claude-opus-4-8",
        systemPrompt:
          "You are a senior support agent for Meridian Air. Resolve the passenger's issue using ONLY facts stated in the ticket. Be concise and warm; always name the next step and its timeframe. Never promise refunds, vouchers, or compensation beyond published policy. If a required detail (booking ref, flight number, bag tag) is missing, ask exactly one clarifying question instead of guessing.",
        description: "Adds grounding, refund/compensation guardrails, and a clarifying-question fallback.",
      },
    ],
    cases: [
      {
        id: "c1",
        input:
          "My checked bag never showed up after flight MA452 SYD–MEL last night. Bag tag MA-118276. I need it before a work event tomorrow.",
        expected:
          "I'm sorry your bag from MA452 is delayed. I've filed a trace on tag MA-118276 and you'll get a status update within 24 hours; delivery to your address is free once located.",
        checks: [
          { type: "includes", value: "MA-118276", label: "references bag tag" },
          { type: "excludes", value: "refund", label: "no unprompted refund offer" },
          { type: "max_length", value: 600 },
        ],
      },
      {
        id: "c2",
        input:
          "Online check-in keeps rejecting my booking reference TKWQ9L — it says 'booking not found' but my card was charged.",
        expected:
          "Sorry about that — please try retrieving the booking with reference TKWQ9L and the passenger's last name exactly as it appears on the ticket; if it still fails, the airport kiosk can check you in with no fee.",
        checks: [
          { type: "includes", value: "TKWQ9L", label: "references booking ref" },
          { type: "max_length", value: 600 },
        ],
      },
      {
        id: "c3",
        input:
          "You cancelled my Saturday flight to Auckland with four hours' notice and auto-rebooked me two days later. Two days. This is unacceptable.",
        expected:
          "I'm really sorry about the cancellation — that's a rough change. Let me look at earlier options now: I can rebook you on tomorrow morning's departure or via Wellington tonight. Which works better?",
        checks: [
          { type: "excludes", value: "compensation", label: "no unprompted compensation promise" },
          { type: "includes", value: "rebook", label: "offers a rebooking path" },
        ],
      },
    ],
  },
  {
    id: "json-extraction",
    name: "JSON contact extraction",
    description: "Does the model return strictly valid JSON with the required fields?",
    task: "Extract the contact's name and email from the text and return ONLY a JSON object with keys name and email.",
    threshold: 4.2,
    variants: [
      {
        id: "v1-loose",
        name: "v1 · loose",
        model: "claude-opus-4-8",
        systemPrompt: "Extract the name and email as JSON.",
        description: "No schema discipline.",
      },
      {
        id: "v2-strict",
        name: "v2 · strict schema",
        model: "claude-opus-4-8",
        systemPrompt:
          'Return ONLY a JSON object: {"name": string, "email": string}. No prose, no markdown fences. If a field is missing use an empty string.',
        description: "Explicit schema, no prose, no fences.",
      },
    ],
    cases: [
      {
        id: "j1",
        input: "Reach out to Jane Doe at jane@co.com about the renewal.",
        expected: '{"name":"Jane Doe","email":"jane@co.com"}',
        checks: [
          { type: "json", label: "valid JSON" },
          { type: "includes", value: "jane@co.com", label: "captures email" },
          { type: "excludes", value: "```", label: "no markdown fences" },
        ],
      },
      {
        id: "j2",
        input: "Our new rep is Sam Lee — sam.lee@acme.io.",
        expected: '{"name":"Sam Lee","email":"sam.lee@acme.io"}',
        checks: [
          { type: "json", label: "valid JSON" },
          { type: "includes", value: "sam.lee@acme.io", label: "captures email" },
        ],
      },
    ],
  },
];

export function getSuite(id: string): Suite | undefined {
  return sampleSuites.find((s) => s.id === id);
}
