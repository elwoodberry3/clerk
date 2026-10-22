"use client";

import { useMemo, useState } from "react";
import { DeadlineRail } from "@/components/DeadlineRail";
import { addDays, formatLong, isCivilDate, type CivilDate } from "@/lib/dates/civil-date";
import { track } from "@/lib/analytics/track";
import { computeFoiaDeadlines, type FoiaChannel } from "@/lib/rules/michigan/foia";
import { MI_CITATIONS } from "@/lib/rules/michigan/citations";

const CHANNELS: { value: FoiaChannel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "web-form", label: "Website form" },
  { value: "fax", label: "Fax" },
  { value: "in-person", label: "In person" },
  { value: "mail", label: "Mail" },
];

export function FoiaCalculator({ initialDate }: { initialDate: CivilDate }) {
  const [sent, setSent] = useState<string>(initialDate);
  const [channel, setChannel] = useState<FoiaChannel>("email");
  const [inSpam, setInSpam] = useState(false);
  const [found, setFound] = useState<string>(initialDate);

  const result = useMemo(() => {
    if (!isCivilDate(sent)) return { error: "Enter the date the request was sent or delivered." };
    if (channel === "email" && inSpam && (!isCivilDate(found) || found < sent)) {
      return { error: "The date you found it in spam can't be before the date it was sent." };
    }
    return {
      value: computeFoiaDeadlines({
        submittedOn: sent as CivilDate,
        channel,
        discoveredInSpamOn: channel === "email" && inSpam ? (found as CivilDate) : undefined,
      }),
    };
  }, [sent, channel, inSpam, found]);

  const field =
    "mt-1 block w-full rounded-md border border-rule-strong bg-white px-3 py-2.5 text-[15px] text-navy-700 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/30";

  return (
    <div className="space-y-8">
      <form
        className="grid gap-5 rounded-lg border border-rule bg-white p-5 sm:grid-cols-3"
        onSubmit={(e) => e.preventDefault()}
        onChange={() => track({ name: "calculator_used" })}
      >
        <label className="block text-sm font-medium text-navy-700">
          Date sent or delivered
          <input
            type="date"
            value={sent}
            onChange={(e) => setSent(e.target.value)}
            className={field}
            required
          />
        </label>
        <label className="block text-sm font-medium text-navy-700">
          How it arrived
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as FoiaChannel)}
            className={field}
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        {channel === "email" ? (
          <div className="text-sm font-medium text-navy-700">
            <label className="mt-6 flex items-center gap-2">
              <input
                type="checkbox"
                checked={inSpam}
                onChange={(e) => setInSpam(e.target.checked)}
                className="h-4 w-4 accent-ocean-600"
              />
              It landed in spam or junk mail
            </label>
            {inSpam ? (
              <label className="mt-3 block">
                Date you found it
                <input
                  type="date"
                  value={found}
                  onChange={(e) => setFound(e.target.value)}
                  className={field}
                />
              </label>
            ) : null}
          </div>
        ) : null}
      </form>

      <div aria-live="polite">
        {"error" in result ? (
          <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-red-700">
            {result.error}
          </p>
        ) : result.value ? (
          <div className="space-y-6">
            <dl className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-3">
              <div className="bg-white p-5">
                <dt className="text-sm text-slate-soft">Legally received</dt>
                <dd className="mt-1 text-xl font-semibold text-navy-700">
                  {formatLong(result.value.receivedOn)}
                </dd>
                <dd className="mt-1 text-sm text-slate-soft">{result.value.receiptRule}</dd>
              </div>
              <div className="bg-white p-5">
                <dt className="text-sm text-slate-soft">Response due</dt>
                <dd className="mt-1 text-xl font-semibold text-ocean-700">
                  {formatLong(result.value.responseDueOn)}
                </dd>
                <dd className="mt-1 text-sm text-slate-soft">
                  Grant, deny, grant in part, or send an extension notice.
                </dd>
              </div>
              <div className="bg-white p-5">
                <dt className="text-sm text-slate-soft">With the one allowed extension</dt>
                <dd className="mt-1 text-xl font-semibold text-navy-700">
                  {formatLong(result.value.extendedDueOn)}
                </dd>
                <dd className="mt-1 text-sm text-slate-soft">Up to 10 more business days.</dd>
              </div>
            </dl>
            <DeadlineRail
              start={sent as CivilDate}
              end={addDays(result.value.responseDueOn, 1)}
              countFrom={result.value.receivedOn}
              markers={[
                { date: sent as CivilDate, label: "Sent", tone: "start" },
                ...(result.value.receivedOn !== sent
                  ? [{ date: result.value.receivedOn, label: "Received", tone: "start" as const }]
                  : []),
                { date: result.value.responseDueOn, label: "Due", tone: "due" },
              ]}
              caption={`Based on ${MI_CITATIONS.foiaReceipt.cite}, ${MI_CITATIONS.foiaResponse.cite}, and Michigan legal holidays under ${MI_CITATIONS.legalHolidays.cite}.`}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
