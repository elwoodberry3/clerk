import { describe, expect, it } from "vitest";
import {
  addDays,
  civilDate,
  dayOfWeek,
  diffCalendarDays,
  isCivilDate,
  lastWeekdayOfMonth,
  nthWeekdayOfMonth,
  todayIn,
} from "@/lib/dates/civil-date";

describe("civilDate", () => {
  it("accepts valid ISO dates", () => {
    expect(civilDate("2026-10-22")).toBe("2026-10-22");
  });

  it.each(["2026-02-30", "2026-13-01", "2026-1-5", "not-a-date", "2026-10-22T00:00"])(
    "rejects %s",
    (value) => {
      expect(isCivilDate(value)).toBe(false);
    },
  );

  it("handles month and year rollover", () => {
    expect(addDays(civilDate("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addDays(civilDate("2028-03-01"), -1)).toBe("2028-02-29");
  });

  it("is immune to daylight-saving transitions", () => {
    // US DST ends Sunday, November 1, 2026.
    expect(addDays(civilDate("2026-10-31"), 2)).toBe("2026-11-02");
    expect(diffCalendarDays(civilDate("2026-10-31"), civilDate("2026-11-02"))).toBe(2);
  });

  it("computes weekdays", () => {
    expect(dayOfWeek(civilDate("2026-10-22"))).toBe(4); // Thursday
  });

  it("finds nth and last weekdays", () => {
    expect(nthWeekdayOfMonth(2026, 10, 1, 2)).toBe("2026-10-12");
    expect(nthWeekdayOfMonth(2026, 11, 4, 4)).toBe("2026-11-26");
    expect(lastWeekdayOfMonth(2026, 5, 1)).toBe("2026-05-25");
  });

  it("returns today's date in Michigan regardless of server time zone", () => {
    // 03:30 UTC on Oct 23 is still Oct 22 in Detroit (UTC-4).
    expect(todayIn("America/Detroit", new Date("2026-10-23T03:30:00Z"))).toBe("2026-10-22");
  });
});
