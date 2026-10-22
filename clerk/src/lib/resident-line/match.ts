import type { Faq } from "@/lib/tenants/schema";

export interface MatchResult {
  faq: Faq | undefined;
  score: number;
}

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

/**
 * Deterministic keyword matcher used by the demo resident line.
 *
 * Production uses an LLM voice agent grounded on the same FAQ records (docs/architecture.md),
 * but the demo stays deterministic so a prospect never sees an invented answer: every reply
 * is a verbatim FAQ answer with a source URL, or a "take a message" fallback.
 */
export function matchFaq(question: string, faqs: readonly Faq[]): MatchResult {
  const tokens = new Set(tokenize(question));
  let best: MatchResult = { faq: undefined, score: 0 };
  for (const faq of faqs) {
    const score = faq.keywords.reduce((sum, kw) => sum + (tokens.has(kw) ? 1 : 0), 0);
    if (score > best.score) best = { faq, score };
  }
  return best.score > 0 ? best : { faq: undefined, score: 0 };
}

export const FALLBACK_ANSWER =
  "I don't want to guess on that one. I'll take your name and number and have the right person in the office call you back. Is this the best number to reach you?";
