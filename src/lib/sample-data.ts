import type { Suite } from "./types";

// Sample suites power the demo with zero setup. Each has 2 variants (a baseline and an
// improved prompt) so the comparison and release gate are meaningful.

export const sampleSuites: Suite[] = [
  {
    id: "support-replies",
    name: "Support reply quality",
    description: "Are auto-drafted support replies accurate, on-policy, and grounded in the ticket?",
    task: "Draft a concise, friendly support reply that resolves the customer's issue using only the facts in the ticket.",
    threshold: 4.0,
    variants: [
      {
        id: "v1-baseline",
        name: "v1 · baseline",
        model: "claude-opus-4-8",
        systemPrompt: "You are a support agent. Reply to the customer.",
        description: "Minimal prompt — the control.",
      },
      {
        id: "v2-grounded",
        name: "v2 · grounded + policy",
        model: "claude-opus-4-8",
        systemPrompt:
          "You are a senior support agent. Resolve the issue using ONLY facts in the ticket. Be concise and friendly. Never promise refunds outside policy. If information is missing, ask one clarifying question.",
        description: "Adds grounding, policy guardrails, and a clarifying-question fallback.",
      },
    ],
    cases: [
      {
        id: "c1",
        input: "My order #4821 hasn't arrived and the tracking hasn't moved in 5 days.",
        expected: "I'm sorry order #4821 is delayed — I've escalated it to the carrier and will follow up within 24 hours.",
        checks: [
          { type: "includes", value: "4821", label: "references order number" },
          { type: "excludes", value: "refund", label: "no unprompted refund offer" },
          { type: "max_length", value: 600 },
        ],
      },
      {
        id: "c2",
        input: "How do I reset my password? I didn't get the email.",
        expected: "Check your spam folder, then use the 'Resend reset email' link on the login page; the email can take up to 10 minutes.",
        checks: [
          { type: "includes", value: "reset", label: "mentions reset flow" },
          { type: "max_length", value: 600 },
        ],
      },
      {
        id: "c3",
        input: "Your product broke after one day. This is unacceptable.",
        expected: "I'm sorry to hear that — let's get this fixed. Can you tell me what happened so I can arrange a replacement or repair?",
        checks: [
          { type: "excludes", value: "refund", label: "no unprompted refund offer" },
          { type: "includes", value: "replacement", label: "offers a path forward" },
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
