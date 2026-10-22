/**
 * Civil (calendar) dates with no time zone.
 *
 * Legal deadlines under Michigan FOIA and the Open Meetings Act are counted in
 * calendar days, not instants. Representing them as `YYYY-MM-DD` strings removes
 * an entire class of daylight-saving and server-time-zone bugs. All arithmetic is
 * done in UTC on noon timestamps, which can never cross a date boundary.
 */

export type CivilDate = string & { readonly __brand: "CivilDate" };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Parse and validate a `YYYY-MM-DD` string. Throws on impossible dates such as 2026-02-30. */
export function civilDate(value: string): CivilDate {
  const match = ISO_DATE.exec(value);
  if (!match) throw new RangeError(`Invalid civil date "${value}" (expected YYYY-MM-DD)`);
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12));
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    throw new RangeError(`Invalid civil date "${value}"`);
  }
  return value as CivilDate;
}

export function isCivilDate(value: string): value is CivilDate {
  try {
    civilDate(value);
    return true;
  } catch {
    return false;
  }
}

/** Build a civil date from parts (month is 1-based). */
export function fromParts(year: number, month: number, day: number): CivilDate {
  return civilDate(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
}

function toUtcNoon(date: CivilDate): Date {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function fromUtc(date: Date): CivilDate {
  return fromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function parts(date: CivilDate): { year: number; month: number; day: number } {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  return { year, month, day };
}

/** 0 = Sunday … 6 = Saturday */
export function dayOfWeek(date: CivilDate): number {
  return toUtcNoon(date).getUTCDay();
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const next = toUtcNoon(date);
  next.setUTCDate(next.getUTCDate() + days);
  return fromUtc(next);
}

export function compare(a: CivilDate, b: CivilDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function diffCalendarDays(from: CivilDate, to: CivilDate): number {
  return Math.round((toUtcNoon(to).getTime() - toUtcNoon(from).getTime()) / 86_400_000);
}

/** The nth (1-based) occurrence of a weekday in a month, e.g. the 2nd Monday. */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): CivilDate {
  const first = fromParts(year, month, 1);
  const offset = (weekday - dayOfWeek(first) + 7) % 7;
  return addDays(first, offset + (n - 1) * 7);
}

/** The last occurrence of a weekday in a month, e.g. the last Monday of May. */
export function lastWeekdayOfMonth(year: number, month: number, weekday: number): CivilDate {
  const nextMonthFirst = month === 12 ? fromParts(year + 1, 1, 1) : fromParts(year, month + 1, 1);
  const last = addDays(nextMonthFirst, -1);
  const offset = (dayOfWeek(last) - weekday + 7) % 7;
  return addDays(last, -offset);
}

/** Today's civil date in an IANA time zone (Michigan townships use America/Detroit). */
export function todayIn(timeZone: string, now: Date = new Date()): CivilDate {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return civilDate(formatted);
}

const LONG = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const MEDIUM = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatLong(date: CivilDate): string {
  return LONG.format(toUtcNoon(date));
}

export function formatMedium(date: CivilDate): string {
  return MEDIUM.format(toUtcNoon(date));
}

export function formatShort(date: CivilDate): string {
  return SHORT.format(toUtcNoon(date));
}
