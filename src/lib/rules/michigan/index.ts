import { civilDate } from "@/lib/dates/civil-date";
import { MI_CITATIONS } from "@/lib/rules/michigan/citations";
import { michiganLegalHolidays } from "@/lib/rules/michigan/holidays";
import type { RulesPack } from "@/lib/rules/types";

export * from "@/lib/rules/michigan/citations";
export * from "@/lib/rules/michigan/fees";
export * from "@/lib/rules/michigan/foia";
export * from "@/lib/rules/michigan/holidays";
export * from "@/lib/rules/michigan/minutes";

/**
 * Michigan rules pack metadata. `attorneyReviewed` must be flipped to true (with the
 * reviewer recorded in CHANGELOG.md) before any township goes live in production.
 */
export const MICHIGAN_RULES_PACK: RulesPack = {
  state: "MI",
  version: "2026.10.0",
  reviewedOn: civilDate("2026-10-22"),
  attorneyReviewed: false,
  timeZone: "America/Detroit",
  holidaysFor: michiganLegalHolidays,
  citations: MI_CITATIONS,
};
