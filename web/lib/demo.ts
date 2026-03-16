export type RichType = "prs" | "alerts" | "metric" | "ticket" | "deploy" | null;

export interface DemoResult {
  text: string;
  richType: RichType;
}

const DEMO_PATTERNS: Array<{ patterns: RegExp[]; result: DemoResult }> = [
  {
    patterns: [/pull request/i, /open pr/i, /my prs/i, /show.*pr/i, /list.*pr/i],
    result: {
      text: "Here are your open pull requests:",
      richType: "prs",
    },
  },
  {
    patterns: [/failed overnight/i, /what.*fail/i, /overnight.*issue/i, /any.*error/i, /alerts?/i, /incident/i],
    result: {
      text: "Here's what happened overnight:",
      richType: "alerts",
    },
  },
  {
    patterns: [/deploy.*staging/i, /staging.*deploy/i, /push.*staging/i, /release.*staging/i],
    result: {
      text: "Ready to deploy:",
      richType: "deploy",
    },
  },
  {
    patterns: [/signup/i, /sign.?up/i, /how many.*today/i, /user.*today/i, /metric/i, /growth/i],
    result: {
      text: "Here's your signup metric:",
      richType: "metric",
    },
  },
  {
    patterns: [/ticket/i, /jira/i, /bug.*create/i, /create.*bug/i, /login.*bug/i, /bug.*login/i, /file.*issue/i, /create.*issue/i],
    result: {
      text: "On it!",
      richType: "ticket",
    },
  },
];

const FALLBACK_RESPONSES = [
  "Got it! Let me look into that for you.",
  "Sure, I can help with that. Give me a moment.",
  "On it! Checking now...",
  "I'm on it. What else do you need?",
];

export function matchDemo(input: string): DemoResult | null {
  const lower = input.toLowerCase();
  for (const { patterns, result } of DEMO_PATTERNS) {
    if (patterns.some((p) => p.test(lower))) {
      return result;
    }
  }
  return null;
}

export function getFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}
