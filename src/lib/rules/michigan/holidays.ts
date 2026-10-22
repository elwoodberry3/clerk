import {
  fromParts,
  lastWeekdayOfMonth,
  nthWeekdayOfMonth,
  type CivilDate,
} from "@/lib/dates/civil-date";
import type { Holiday } from "@/lib/rules/types";

const MONDAY = 1;
const THURSDAY = 4;

/**
 * Michigan legal holidays under MCL 435.101.
 *
 * Notes for reviewers:
 * - The statute lists fixed-date holidays without a weekend "observed" rule, so a
 *   holiday that falls on a weekend does not move. Weekends are already excluded from
 *   FOIA business-day counts (Michigan Attorney General opinion op10248), so this has no effect on deadlines.
 * - The Saturday afternoon half-holiday is irrelevant because Saturday is never a
 *   business day for FOIA counting.
 * - Lincoln's Birthday (Feb 12) and Columbus Day are Michigan legal holidays even though
 *   many township offices stay open. FOIA counts "business days", which the Attorney
 *   General reads as excluding legal holidays regardless of office hours.
 */
export function michiganLegalHolidays(year: number): Holiday[] {
  const list: Holiday[] = [
    { date: fromParts(year, 1, 1), name: "New Year's Day" },
    { date: nthWeekdayOfMonth(year, 1, MONDAY, 3), name: "Martin Luther King, Jr. Day" },
    { date: fromParts(year, 2, 12), name: "Lincoln's Birthday" },
    { date: nthWeekdayOfMonth(year, 2, MONDAY, 3), name: "Washington's Birthday" },
    { date: lastWeekdayOfMonth(year, 5, MONDAY), name: "Memorial Day" },
    { date: fromParts(year, 6, 19), name: "Juneteenth" },
    { date: fromParts(year, 7, 4), name: "Independence Day" },
    { date: nthWeekdayOfMonth(year, 9, MONDAY, 1), name: "Labor Day" },
    { date: nthWeekdayOfMonth(year, 10, MONDAY, 2), name: "Columbus Day" },
    { date: fromParts(year, 11, 11), name: "Veterans Day" },
    { date: nthWeekdayOfMonth(year, 11, THURSDAY, 4), name: "Thanksgiving Day" },
    { date: fromParts(year, 12, 25), name: "Christmas Day" },
  ];
  return list.sort((a, b) => (a.date < b.date ? -1 : 1));
}

const cache = new Map<number, Map<CivilDate, string>>();

export function michiganHolidayName(date: CivilDate): string | undefined {
  const year = Number(date.slice(0, 4));
  let byDate = cache.get(year);
  if (!byDate) {
    byDate = new Map(michiganLegalHolidays(year).map((h) => [h.date, h.name]));
    cache.set(year, byDate);
  }
  return byDate.get(date);
}
