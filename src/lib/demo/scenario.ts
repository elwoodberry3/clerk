import { addBusinessDays, isBusinessDay, subtractBusinessDays } from "@/lib/dates/business-days";
import {
  addDays,
  compare,
  fromParts,
  nthWeekdayOfMonth,
  parts,
  type CivilDate,
} from "@/lib/dates/civil-date";
import { draftLetter, type DraftLetter, type LetterKind } from "@/lib/foia/letters";
import {
  businessDaysLeft,
  computeFoiaDeadlines,
  deadlineUrgency,
  estimateFoiaFee,
  michiganHolidayName,
  proposedMinutesDueOn,
  type DeadlineUrgency,
  type FeeEstimate,
  type FeeInput,
  type FoiaChannel,
  type FoiaDeadlines,
} from "@/lib/rules/michigan";
import { firstName, tenantClerk } from "@/lib/tenants/registry";
import type { Tenant } from "@/lib/tenants/schema";

/**
 * Builds the demo's sample data relative to "today", so a demo link opened any day looks
 * current: requests are always a few business days old and deadlines always upcoming.
 * Requesters and request contents are fictional and labeled as samples in the UI.
 */

export interface DemoFoiaRequest {
  number: string;
  requester: string;
  requesterType: string;
  channel: FoiaChannel;
  submittedOn: CivilDate;
  records: string;
  deadlines: FoiaDeadlines;
  urgency: DeadlineUrgency;
  businessDaysLeft: number;
  status: "needs-signature" | "responded";
  respondedOn?: CivilDate;
  recommendation: { kind: LetterKind; label: string; why: string };
  flags: string[];
  fee: FeeEstimate;
  letter: DraftLetter;
}

export interface DemoMeeting {
  meetingOn: CivilDate;
  proposedDueOn: CivilDate;
  businessDaysLeft: number;
  urgency: DeadlineUrgency;
  nextMeetingOn: CivilDate;
}

export interface DemoScenario {
  today: CivilDate;
  clerkFirstName: string;
  requests: DemoFoiaRequest[];
  meeting: DemoMeeting;
  stats: {
    openRequests: number;
    dueThisWeek: number;
    awaitingSignature: number;
    answeredOnTime: number;
    callsHandled: number;
    callsTransferred: number;
  };
}

function lastBusinessDayOnOrBefore(date: CivilDate): CivilDate {
  let cursor = date;
  while (!isBusinessDay(cursor, michiganHolidayName)) cursor = addDays(cursor, -1);
  return cursor;
}

/** Most recent regular meeting on or before `today`, and the next one after it. */
export function regularMeetings(tenant: Tenant, today: CivilDate) {
  const { weekOfMonth, weekday } = tenant.meetings;
  const { year, month } = parts(today);
  const inMonth = (y: number, m: number) => nthWeekdayOfMonth(y, m, weekday, weekOfMonth);
  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  const thisMonth = inMonth(year, month);
  const last = compare(thisMonth, today) <= 0 ? thisMonth : inMonth(prevMonth.y, prevMonth.m);
  const next = compare(thisMonth, today) > 0 ? thisMonth : inMonth(nextMonth.y, nextMonth.m);
  return { last, next };
}

interface Seed {
  seq: number;
  requester: string;
  requesterType: string;
  channel: FoiaChannel;
  /** Business days before the reference day that the request was submitted. */
  submittedBusinessDaysAgo: number;
  records: string;
  recommendation: { kind: LetterKind; label: string; why: string };
  flags: string[];
  fee: Omit<FeeInput, "hourlyWage" | "fringePercent" | "copyCostPerSheet">;
  respondedBusinessDaysAgo?: number;
  extensionReason?: string;
  exemptions?: { cite: string; basis: string; withheld: string }[];
}

const SEEDS: Seed[] = [
  {
    seq: 41,
    requester: "Northgate Bid Intelligence LLC",
    requesterType: "Out-of-state data company (bulk request sent to many municipalities)",
    channel: "email",
    submittedBusinessDaysAgo: 3,
    records:
      "all bid tabulations, contractor proposals, and award letters for public works and construction projects from January 1, 2020 to the present",
    recommendation: {
      kind: "extension",
      label: "Send extension notice",
      why: "Six years of bid files across several departments. Use the one allowed extension now while there is time.",
    },
    flags: [
      "Same wording received by other Michigan municipalities this month",
      "Large scope: fee estimate may justify a deposit",
    ],
    fee: { searchMinutes: 0, duplicationMinutes: 45 },
    extensionReason:
      "the request covers six years of bid and contract files that must be located across multiple departments and reviewed before release",
  },
  {
    seq: 40,
    requester: "Resident, Riverview Drive",
    requesterType: "Township resident (walked in)",
    channel: "in-person",
    submittedBusinessDaysAgo: 4,
    records: "the East Cooper Cemetery plot map and lot ownership records for Section C",
    recommendation: {
      kind: "grant",
      label: "Approve and send",
      why: "Routine public records already on file. Draft letter and fee are ready.",
    },
    flags: [],
    fee: { paperSheets: 34, duplicationMinutes: 10 },
  },
  {
    seq: 42,
    requester: "Staff reporter, regional news outlet",
    requesterType: "Media",
    channel: "email",
    submittedBusinessDaysAgo: 0,
    records:
      "emails between Township Board members and staff regarding a proposed rezoning, over a two-month period",
    recommendation: {
      kind: "partial-denial",
      label: "Review exemptions",
      why: "Two messages appear to involve the township attorney. Agent drafted a partial grant for your review.",
    },
    flags: [
      "Possible attorney-client communications: confirm with township attorney",
      "Personal phone numbers in signatures will be redacted",
    ],
    fee: { duplicationMinutes: 30 },
    exemptions: [
      {
        cite: "MCL 15.243(1)(g)",
        basis: "information or records subject to the attorney-client privilege",
        withheld: "two emails from the township attorney",
      },
      {
        cite: "MCL 15.243(1)(a)",
        basis:
          "information of a personal nature whose disclosure would be a clearly unwarranted invasion of privacy",
        withheld: "personal mobile phone numbers in email signatures",
      },
    ],
  },
  {
    seq: 37,
    requester: "Licensed real estate agent",
    requesterType: "Business",
    channel: "web-form",
    submittedBusinessDaysAgo: 9,
    respondedBusinessDaysAgo: 4,
    records: "building permit history for a parcel on West D Avenue",
    recommendation: {
      kind: "grant",
      label: "Sent",
      why: "Granted and sent on time.",
    },
    flags: [],
    fee: { duplicationMinutes: 15 },
  },
];

export function buildDemoScenario(tenant: Tenant, today: CivilDate): DemoScenario {
  const ref = lastBusinessDayOnOrBefore(today);
  const year = parts(today).year;
  const clerk = tenantClerk(tenant);
  const feeDefaults = {
    hourlyWage: tenant.foia.fees.lowestPaidCapableHourlyWage,
    fringePercent: tenant.foia.fees.fringePercent,
    copyCostPerSheet: tenant.foia.fees.copyCostPerSheet,
  };

  const requests: DemoFoiaRequest[] = SEEDS.map((seed): DemoFoiaRequest => {
    const submittedOn = subtractBusinessDays(
      ref,
      seed.submittedBusinessDaysAgo,
      michiganHolidayName,
    );
    const deadlines = computeFoiaDeadlines({ submittedOn, channel: seed.channel });
    const fee = estimateFoiaFee({ ...feeDefaults, ...seed.fee });
    const number = `FOIA ${year}-${String(seed.seq).padStart(3, "0")}`;
    const respondedOn =
      seed.respondedBusinessDaysAgo === undefined
        ? undefined
        : subtractBusinessDays(ref, seed.respondedBusinessDaysAgo, michiganHolidayName);
    const letter = draftLetter(seed.recommendation.kind, {
      tenant,
      requestNumber: number,
      requesterName: seed.requester,
      receivedOn: deadlines.receivedOn,
      responseDueOn: deadlines.responseDueOn,
      extendedDueOn: deadlines.extendedDueOn,
      recordsDescription: seed.records,
      fee,
      extensionReason: seed.extensionReason,
      exemptions: seed.exemptions,
      signerName: clerk?.name,
    });
    return {
      number,
      requester: seed.requester,
      requesterType: seed.requesterType,
      channel: seed.channel,
      submittedOn,
      records: seed.records,
      deadlines,
      urgency: respondedOn ? "on-track" : deadlineUrgency(today, deadlines.responseDueOn),
      businessDaysLeft: businessDaysLeft(today, deadlines.responseDueOn),
      status: respondedOn ? "responded" : "needs-signature",
      respondedOn,
      recommendation: seed.recommendation,
      flags: seed.flags,
      fee,
      letter,
    };
  }).sort((a, b) => compare(a.deadlines.responseDueOn, b.deadlines.responseDueOn));

  const { last, next } = regularMeetings(tenant, today);
  const proposedDueOn = proposedMinutesDueOn(last);
  const weekEnd = addBusinessDays(ref, 4, michiganHolidayName);
  const open = requests.filter((r) => r.status === "needs-signature");

  return {
    today,
    clerkFirstName: clerk ? firstName(clerk.name) : "Clerk",
    requests,
    meeting: {
      meetingOn: last,
      proposedDueOn,
      businessDaysLeft: businessDaysLeft(today, proposedDueOn),
      urgency: deadlineUrgency(today, proposedDueOn),
      nextMeetingOn: next,
    },
    stats: {
      openRequests: open.length,
      dueThisWeek: open.filter((r) => compare(r.deadlines.responseDueOn, weekEnd) <= 0).length,
      awaitingSignature: open.length,
      answeredOnTime: requests.filter((r) => r.status === "responded").length,
      callsHandled: 37,
      callsTransferred: 4,
    },
  };
}

/** Exposed for tests: a fixed reference date for deterministic snapshots. */
export const SAMPLE_TODAY = fromParts(2026, 11, 16);
