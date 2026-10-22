import { isBusinessDay, isWeekend } from "@/lib/dates/business-days";
import {
  addDays,
  compare,
  dayOfWeek,
  formatMedium,
  parts,
  WEEKDAYS,
  type CivilDate,
} from "@/lib/dates/civil-date";
import { michiganHolidayName } from "@/lib/rules/michigan/holidays";

export type RailTone = "start" | "due" | "extended" | "done" | "meeting";

export interface RailMarker {
  date: CivilDate;
  label: string;
  tone: RailTone;
}

const TONE: Record<RailTone, { dot: string; text: string }> = {
  start: { dot: "bg-navy-700", text: "text-navy-700" },
  due: { dot: "bg-ocean-600", text: "text-ocean-700" },
  extended: { dot: "bg-slate-soft", text: "text-slate-soft" },
  done: { dot: "bg-green-600", text: "text-green-700" },
  meeting: { dot: "bg-navy-700", text: "text-navy-700" },
};

/**
 * A calendar strip that makes legal business-day counting visible: weekends collapse,
 * Michigan legal holidays are hatched and named, and every business day after `countFrom`
 * is numbered. This is the product's signature visual.
 */
export function DeadlineRail({
  start,
  end,
  countFrom,
  markers,
  today,
  caption,
}: {
  start: CivilDate;
  end: CivilDate;
  /** Business days are numbered starting the day after this date. */
  countFrom?: CivilDate;
  markers: RailMarker[];
  today?: CivilDate;
  caption: string;
}) {
  const days: CivilDate[] = [];
  for (let d = start; compare(d, end) <= 0; d = addDays(d, 1)) days.push(d);

  let count = 0;
  const cells = days.map((date) => {
    const holiday = michiganHolidayName(date);
    const business = isBusinessDay(date, michiganHolidayName);
    if (countFrom && compare(date, countFrom) > 0 && business) count += 1;
    return {
      date,
      holiday,
      weekend: isWeekend(date),
      business,
      n: countFrom && compare(date, countFrom) > 0 && business ? count : undefined,
      markers: markers.filter((m) => m.date === date),
    };
  });

  const columns = cells.map((c) => (c.weekend && !c.markers.length ? "0.45fr" : "1fr")).join(" ");

  return (
    <figure className="w-full">
      <div className="overflow-x-auto pb-2">
        <ol
          className="grid min-w-[640px] gap-px rounded-md border border-rule bg-rule"
          style={{ gridTemplateColumns: columns }}
          aria-label={caption}
        >
          {cells.map((c) => {
            const isToday = today === c.date;
            const { day } = parts(c.date);
            return (
              <li
                key={c.date}
                className={[
                  "relative flex min-h-[112px] flex-col justify-between px-1.5 pb-2 pt-1.5",
                  c.holiday ? "rail-holiday" : c.weekend ? "bg-closed" : "bg-white",
                ].join(" ")}
                aria-label={`${formatMedium(c.date)}${c.holiday ? `, ${c.holiday}` : ""}${c.weekend ? ", weekend" : ""}${c.markers.map((m) => `, ${m.label}`).join("")}`}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span
                    className={`text-[11px] leading-none ${c.business ? "text-slate-soft" : "text-slate-soft/70"}`}
                  >
                    {c.weekend
                      ? WEEKDAYS[dayOfWeek(c.date)]!.slice(0, 1)
                      : WEEKDAYS[dayOfWeek(c.date)]!.slice(0, 3)}
                  </span>
                  <span
                    className={[
                      "text-[13px] font-semibold leading-none",
                      isToday
                        ? "rounded-sm bg-navy-700 px-1 py-0.5 text-white"
                        : c.business
                          ? "text-navy-700"
                          : "text-slate-soft/70",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                </div>

                {c.holiday ? (
                  <span className="mt-2 text-[11px] font-medium leading-tight text-slate-ink">
                    {c.holiday}
                  </span>
                ) : null}

                <div className="mt-auto flex flex-col gap-1">
                  {c.markers.map((m) => (
                    <span
                      key={m.label}
                      className={`flex items-start gap-1 text-[11px] font-semibold leading-tight ${TONE[m.tone].text}`}
                    >
                      <span
                        className={`mt-[3px] h-2 w-2 shrink-0 rounded-full ${TONE[m.tone].dot}`}
                        aria-hidden
                      />
                      {m.label}
                    </span>
                  ))}
                  {c.n !== undefined ? (
                    <span className="text-[11px] text-slate-soft">Day {c.n}</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <figcaption className="mt-2 text-sm text-slate-soft">{caption}</figcaption>
    </figure>
  );
}
