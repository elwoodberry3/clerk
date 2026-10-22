import { addDays, compare, dayOfWeek, type CivilDate } from "@/lib/dates/civil-date";

/** Returns the holiday name if `date` is a legal holiday, otherwise undefined. */
export type HolidayLookup = (date: CivilDate) => string | undefined;

export function isWeekend(date: CivilDate): boolean {
  const dow = dayOfWeek(date);
  return dow === 0 || dow === 6;
}

export function isBusinessDay(date: CivilDate, holidayName: HolidayLookup): boolean {
  return !isWeekend(date) && holidayName(date) === undefined;
}

/**
 * Count `n` business days forward from `start`, excluding the start day and including
 * the last day (MCL 8.6). `addBusinessDays(fri, 1)` is the following Monday when Monday
 * is not a holiday.
 */
export function addBusinessDays(
  start: CivilDate,
  n: number,
  holidayName: HolidayLookup,
): CivilDate {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("n must be a non-negative integer");
  let cursor = start;
  let counted = 0;
  while (counted < n) {
    cursor = addDays(cursor, 1);
    if (isBusinessDay(cursor, holidayName)) counted += 1;
  }
  return cursor;
}

/** Count `n` business days backward from `start` (used to build relative demo scenarios). */
export function subtractBusinessDays(
  start: CivilDate,
  n: number,
  holidayName: HolidayLookup,
): CivilDate {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("n must be a non-negative integer");
  let cursor = start;
  let counted = 0;
  while (counted < n) {
    cursor = addDays(cursor, -1);
    if (isBusinessDay(cursor, holidayName)) counted += 1;
  }
  return cursor;
}

/**
 * Business days remaining from `from` until `to`.
 * 0 means the deadline is `from` itself; negative means it has passed.
 */
export function businessDaysUntil(
  from: CivilDate,
  to: CivilDate,
  holidayName: HolidayLookup,
): number {
  const direction = compare(from, to);
  if (direction === 0) return 0;
  let count = 0;
  let cursor = from;
  if (direction < 0) {
    while (cursor < to) {
      cursor = addDays(cursor, 1);
      if (isBusinessDay(cursor, holidayName)) count += 1;
    }
    return count;
  }
  while (cursor > to) {
    if (isBusinessDay(cursor, holidayName)) count -= 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

/** The given date if it is a business day, otherwise the next one. */
export function nextBusinessDayOnOrAfter(date: CivilDate, holidayName: HolidayLookup): CivilDate {
  let cursor = date;
  while (!isBusinessDay(cursor, holidayName)) cursor = addDays(cursor, 1);
  return cursor;
}
