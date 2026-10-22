import { addBusinessDays, businessDaysUntil } from "@/lib/dates/business-days";
import { addDays, compare, type CivilDate } from "@/lib/dates/civil-date";
import { michiganHolidayName } from "@/lib/rules/michigan/holidays";

export const FOIA_RESPONSE_BUSINESS_DAYS = 5;
export const FOIA_EXTENSION_BUSINESS_DAYS = 10;

export type FoiaChannel = "email" | "fax" | "web-form" | "in-person" | "mail";

export const ELECTRONIC_CHANNELS: ReadonlySet<FoiaChannel> = new Set(["email", "fax", "web-form"]);

export interface FoiaReceiptInput {
  /** The date the request was sent (electronic) or physically delivered. */
  submittedOn: CivilDate;
  channel: FoiaChannel;
  /**
   * For email that landed in spam/junk: the date the township first became aware of it.
   * Ignored for other channels.
   */
  discoveredInSpamOn?: CivilDate | undefined;
}

export interface FoiaDeadlines {
  /** The legal date of receipt by the FOIA coordinator. */
  receivedOn: CivilDate;
  /** Last day to grant, deny, grant in part, or issue an extension notice. */
  responseDueOn: CivilDate;
  /** Last day to respond if the single 10-business-day extension notice is issued in time. */
  extendedDueOn: CivilDate;
  /** Explanation of how `receivedOn` was derived, for display and audit. */
  receiptRule: string;
}

/**
 * Compute FOIA receipt and response deadlines under MCL 15.235(1)–(2).
 *
 * Electronic requests are received 1 business day after transmission. Email delivered to
 * spam is received 1 (calendar) day after the township first becomes aware of it; the
 * statute says "1 day", not "1 business day", and the code follows the text exactly.
 */
export function computeFoiaDeadlines(input: FoiaReceiptInput): FoiaDeadlines {
  const { submittedOn, channel, discoveredInSpamOn } = input;
  let receivedOn: CivilDate;
  let receiptRule: string;

  if (channel === "email" && discoveredInSpamOn) {
    if (compare(discoveredInSpamOn, submittedOn) < 0) {
      throw new RangeError("discoveredInSpamOn cannot be before submittedOn");
    }
    receivedOn = addDays(discoveredInSpamOn, 1);
    receiptRule = "Email found in spam: received 1 day after the township became aware of it.";
  } else if (ELECTRONIC_CHANNELS.has(channel)) {
    receivedOn = addBusinessDays(submittedOn, 1, michiganHolidayName);
    receiptRule = "Electronic request: received 1 business day after it was sent.";
  } else {
    receivedOn = submittedOn;
    receiptRule = "Delivered in person or by mail: received the day it arrived.";
  }

  const responseDueOn = addBusinessDays(
    receivedOn,
    FOIA_RESPONSE_BUSINESS_DAYS,
    michiganHolidayName,
  );
  const extendedDueOn = addBusinessDays(
    responseDueOn,
    FOIA_EXTENSION_BUSINESS_DAYS,
    michiganHolidayName,
  );

  return { receivedOn, responseDueOn, extendedDueOn, receiptRule };
}

export type DeadlineUrgency = "overdue" | "due-today" | "due-soon" | "on-track";

export function deadlineUrgency(today: CivilDate, dueOn: CivilDate): DeadlineUrgency {
  const remaining = businessDaysUntil(today, dueOn, michiganHolidayName);
  if (compare(today, dueOn) > 0) return "overdue";
  if (remaining === 0) return "due-today";
  if (remaining <= 2) return "due-soon";
  return "on-track";
}

export function businessDaysLeft(today: CivilDate, dueOn: CivilDate): number {
  return businessDaysUntil(today, dueOn, michiganHolidayName);
}
