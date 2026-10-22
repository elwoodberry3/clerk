import { addBusinessDays } from "@/lib/dates/business-days";
import type { CivilDate } from "@/lib/dates/civil-date";
import { michiganHolidayName } from "@/lib/rules/michigan/holidays";

export const PROPOSED_MINUTES_BUSINESS_DAYS = 8;
export const APPROVED_MINUTES_BUSINESS_DAYS = 5;

/** MCL 15.269(3): proposed minutes available within 8 business days after the meeting. */
export function proposedMinutesDueOn(meetingOn: CivilDate): CivilDate {
  return addBusinessDays(meetingOn, PROPOSED_MINUTES_BUSINESS_DAYS, michiganHolidayName);
}

/** MCL 15.269(3): approved minutes available within 5 business days after approval. */
export function approvedMinutesDueOn(approvedOn: CivilDate): CivilDate {
  return addBusinessDays(approvedOn, APPROVED_MINUTES_BUSINESS_DAYS, michiganHolidayName);
}
