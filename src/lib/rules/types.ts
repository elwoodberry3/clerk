import type { CivilDate } from "@/lib/dates/civil-date";

/** A statute or authority a computed result relies on. Shown to the clerk next to every deadline. */
export interface LegalCitation {
  /** Short cite, e.g. "MCL 15.235(2)". */
  cite: string;
  /** Plain-English description of what the provision requires. */
  summary: string;
  /** Primary source URL (legislature.mi.gov, AG opinion, etc.). */
  url: string;
}

export interface Holiday {
  date: CivilDate;
  name: string;
}

/**
 * A state rules pack: everything that changes when Adbyrd enters a new state.
 * The application never hard-codes a deadline; it always asks the active rules pack.
 * See docs/rules-packs.md.
 */
export interface RulesPack {
  /** Two-letter state code. */
  state: string;
  /** Human-readable version. Bump on any change and record it in CHANGELOG.md. */
  version: string;
  /** Date the pack was last reviewed against primary sources. */
  reviewedOn: CivilDate;
  /** Whether a licensed municipal attorney has signed off. Production go-live requires true. */
  attorneyReviewed: boolean;
  timeZone: string;
  holidaysFor(year: number): Holiday[];
  citations: Record<string, LegalCitation>;
}
