import { describe, expect, it } from "vitest";
import { addBusinessDays, businessDaysUntil, isBusinessDay } from "@/lib/dates/business-days";
import { civilDate as d } from "@/lib/dates/civil-date";
import {
  approvedMinutesDueOn,
  billableHours,
  computeFoiaDeadlines,
  deadlineUrgency,
  estimateFoiaFee,
  michiganHolidayName,
  michiganLegalHolidays,
  proposedMinutesDueOn,
} from "@/lib/rules/michigan";

describe("Michigan legal holidays (MCL 435.101)", () => {
  it("lists twelve holidays for 2026 including Michigan-specific ones", () => {
    const names = michiganLegalHolidays(2026).map((h) => h.name);
    expect(names).toHaveLength(12);
    expect(names).toContain("Lincoln's Birthday");
    expect(names).toContain("Columbus Day");
    expect(names).toContain("Juneteenth");
  });

  it.each([
    ["2026-01-19", "Martin Luther King, Jr. Day"],
    ["2026-02-16", "Washington's Birthday"],
    ["2026-05-25", "Memorial Day"],
    ["2026-09-07", "Labor Day"],
    ["2026-10-12", "Columbus Day"],
    ["2026-11-26", "Thanksgiving Day"],
    ["2027-02-12", "Lincoln's Birthday"],
  ])("%s is %s", (date, name) => {
    expect(michiganHolidayName(d(date))).toBe(name);
  });

  it("treats holidays and weekends as non-business days", () => {
    expect(isBusinessDay(d("2026-11-11"), michiganHolidayName)).toBe(false); // Veterans Day (Wed)
    expect(isBusinessDay(d("2026-11-14"), michiganHolidayName)).toBe(false); // Saturday
    expect(isBusinessDay(d("2026-11-12"), michiganHolidayName)).toBe(true);
  });
});

describe("business-day arithmetic (MCL 8.6: first day excluded)", () => {
  it("skips weekends", () => {
    expect(addBusinessDays(d("2026-10-23"), 1, michiganHolidayName)).toBe("2026-10-26");
  });

  it("counts remaining business days, including negatives", () => {
    expect(businessDaysUntil(d("2026-11-23"), d("2026-12-01"), michiganHolidayName)).toBe(5);
    expect(businessDaysUntil(d("2026-12-01"), d("2026-11-30"), michiganHolidayName)).toBe(-1);
    expect(businessDaysUntil(d("2026-12-01"), d("2026-12-01"), michiganHolidayName)).toBe(0);
  });
});

describe("FOIA deadlines (MCL 15.235)", () => {
  it("in-person request across Veterans Day", () => {
    const r = computeFoiaDeadlines({ submittedOn: d("2026-11-09"), channel: "in-person" });
    expect(r.receivedOn).toBe("2026-11-09");
    expect(r.responseDueOn).toBe("2026-11-17");
  });

  it("email sent Friday before Thanksgiving week", () => {
    const r = computeFoiaDeadlines({ submittedOn: d("2026-11-20"), channel: "email" });
    expect(r.receivedOn).toBe("2026-11-23");
    expect(r.responseDueOn).toBe("2026-12-01");
    expect(r.extendedDueOn).toBe("2026-12-15");
  });

  it("email sent on a Saturday is received the next business day", () => {
    const r = computeFoiaDeadlines({ submittedOn: d("2026-10-24"), channel: "email" });
    expect(r.receivedOn).toBe("2026-10-26");
  });

  it("email found in spam is received 1 calendar day after discovery", () => {
    const r = computeFoiaDeadlines({
      submittedOn: d("2026-10-16"),
      channel: "email",
      discoveredInSpamOn: d("2026-10-23"),
    });
    expect(r.receivedOn).toBe("2026-10-24"); // a Saturday, exactly as the statute reads
    expect(r.responseDueOn).toBe("2026-10-30");
  });

  it("rejects a spam discovery date before submission", () => {
    expect(() =>
      computeFoiaDeadlines({
        submittedOn: d("2026-10-16"),
        channel: "email",
        discoveredInSpamOn: d("2026-10-15"),
      }),
    ).toThrow(RangeError);
  });

  it("classifies urgency", () => {
    expect(deadlineUrgency(d("2026-12-02"), d("2026-12-01"))).toBe("overdue");
    expect(deadlineUrgency(d("2026-12-01"), d("2026-12-01"))).toBe("due-today");
    expect(deadlineUrgency(d("2026-11-27"), d("2026-12-01"))).toBe("due-soon");
    expect(deadlineUrgency(d("2026-11-20"), d("2026-12-01"))).toBe("on-track");
  });
});

describe("Open Meetings Act minutes (MCL 15.269)", () => {
  it("proposed minutes: 8 business days, skipping Columbus Day", () => {
    // Meeting held on Columbus Day itself (Cooper meets the 2nd Monday).
    expect(proposedMinutesDueOn(d("2026-10-12"))).toBe("2026-10-22");
  });

  it("proposed minutes: across Veterans Day", () => {
    expect(proposedMinutesDueOn(d("2026-11-09"))).toBe("2026-11-20");
  });

  it("approved minutes: 5 business days after approval", () => {
    expect(approvedMinutesDueOn(d("2026-11-09"))).toBe("2026-11-17");
  });
});

describe("FOIA fees (MCL 15.234)", () => {
  const base = { hourlyWage: 20, fringePercent: 50, copyCostPerSheet: 0.1 };

  it("rounds partial 15-minute increments down", () => {
    expect(billableHours(44, 15)).toBe(0.5);
    expect(billableHours(14, 15)).toBe(0);
  });

  it("does not charge search labor unless unreasonably high cost applies", () => {
    const est = estimateFoiaFee({ ...base, searchMinutes: 120 });
    expect(est.total).toBe(0);
  });

  it("itemizes labor, fringe, and copies", () => {
    const est = estimateFoiaFee({
      ...base,
      unreasonablyHighCost: true,
      searchMinutes: 120,
      separationMinutes: 60,
      paperSheets: 100,
    });
    // labor 3h × $20 = $60, fringe 50% = $30, paper $10
    expect(est.total).toBe(100);
    expect(est.depositAllowed).toBe(true);
    expect(est.maxDeposit).toBe(50);
  });

  it("allows a deposit only above $50", () => {
    const est = estimateFoiaFee({ ...base, fringePercent: 0, paperSheets: 500 });
    expect(est.total).toBe(50);
    expect(est.depositAllowed).toBe(false);
    expect(est.maxDeposit).toBe(0);
  });

  it("rejects inputs that exceed statutory caps", () => {
    expect(() => estimateFoiaFee({ ...base, fringePercent: 60 })).toThrow();
    expect(() => estimateFoiaFee({ ...base, copyCostPerSheet: 0.25 })).toThrow();
  });
});
