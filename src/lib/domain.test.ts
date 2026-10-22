import { describe, expect, it } from "vitest";
import { civilDate as d } from "@/lib/dates/civil-date";
import { buildDemoScenario, regularMeetings, SAMPLE_TODAY } from "@/lib/demo/scenario";
import { draftLetter } from "@/lib/foia/letters";
import { matchFaq } from "@/lib/resident-line/match";
import { estimateFoiaFee } from "@/lib/rules/michigan";
import { allTenantSlugs, getTenant } from "@/lib/tenants/registry";
import { tenantSchema } from "@/lib/tenants/schema";

const cooper = getTenant("cooper-charter-township")!;

describe("tenant registry", () => {
  it("validates every configured tenant", () => {
    for (const slug of allTenantSlugs()) {
      expect(() => tenantSchema.parse(getTenant(slug))).not.toThrow();
    }
  });

  it("returns undefined for unknown slugs", () => {
    expect(getTenant("not-a-township")).toBeUndefined();
  });

  it("every FAQ cites an https source", () => {
    for (const faq of cooper.residentLine.faqs) {
      expect(faq.provenance.sourceUrl.startsWith("https://")).toBe(true);
    }
  });
});

describe("regular meetings", () => {
  it("finds the last and next 2nd-Monday meetings", () => {
    expect(regularMeetings(cooper, d("2026-10-22"))).toEqual({
      last: "2026-10-12",
      next: "2026-11-09",
    });
    expect(regularMeetings(cooper, d("2026-11-09"))).toEqual({
      last: "2026-11-09",
      next: "2026-12-14",
    });
  });
});

describe("demo scenario", () => {
  const scenario = buildDemoScenario(cooper, SAMPLE_TODAY);

  it("greets the clerk by first name", () => {
    expect(scenario.clerkFirstName).toBe("DeAnna");
  });

  it("has open requests that are never overdue on any day", () => {
    for (const offset of [0, 1, 2, 3, 4, 5, 6, 7, 30, 45, 90]) {
      const day = d(new Date(Date.UTC(2026, 10, 16 + offset, 12)).toISOString().slice(0, 10));
      const s = buildDemoScenario(cooper, day);
      for (const r of s.requests.filter((x) => x.status === "needs-signature")) {
        expect(r.urgency).not.toBe("overdue");
      }
    }
  });

  it("orders requests by response deadline", () => {
    const dues = scenario.requests.map((r) => r.deadlines.responseDueOn);
    expect([...dues].sort()).toEqual(dues);
  });

  it("closed requests were answered on or before their deadline", () => {
    for (const r of scenario.requests.filter((x) => x.status === "responded")) {
      expect(r.respondedOn! <= r.deadlines.responseDueOn).toBe(true);
    }
  });
});

describe("draft letters", () => {
  const fee = estimateFoiaFee({ hourlyWage: 18.5, fringePercent: 35, paperSheets: 10 });
  const ctx = {
    tenant: cooper,
    requestNumber: "FOIA 2026-001",
    requesterName: "Jane Doe",
    receivedOn: d("2026-11-23"),
    responseDueOn: d("2026-12-01"),
    extendedDueOn: d("2026-12-15"),
    recordsDescription: "sample records",
    fee,
  };

  it("extension notice states the new response date", () => {
    const letter = draftLetter("extension", ctx);
    expect(letter.paragraphs.join(" ")).toContain("Tuesday, December 15, 2026");
  });

  it("partial denial includes every element MCL 15.235(5) requires", () => {
    const letter = draftLetter("partial-denial", {
      ...ctx,
      exemptions: [{ cite: "MCL 15.243(1)(g)", basis: "privilege", withheld: "one email" }],
    });
    const text = letter.paragraphs.join(" ");
    expect(text).toContain("MCL 15.243(1)(g)");
    expect(text).toContain("does not exist");
    expect(text).toContain("appeal");
    expect(text).toContain("180 days");
    expect(text).toContain("attorneys' fees");
    expect(letter.includes).toHaveLength(6);
  });
});

describe("resident line matcher", () => {
  it.each([
    ["when is my winter tax bill due", "winter-taxes"],
    ["can I buy a cemetery plot", "cemetery-lots"],
    ["what day is my recycling picked up?", "recycling"],
    ["where do I vote early", "voting"],
    ["do I need a permit to burn leaves", "burn-permit"],
  ])("%s → %s", (question, id) => {
    expect(matchFaq(question, cooper.residentLine.faqs).faq?.id).toBe(id);
  });

  it("falls back instead of guessing", () => {
    expect(
      matchFaq("my neighbor's dog keeps barking", cooper.residentLine.faqs).faq,
    ).toBeUndefined();
  });
});
