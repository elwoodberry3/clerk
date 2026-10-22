import { DeadlineRail, type RailMarker } from "@/components/DeadlineRail";
import { addDays, compare, formatLong, formatMedium, type CivilDate } from "@/lib/dates/civil-date";
import type { DemoScenario } from "@/lib/demo/scenario";
import { Panel, UrgencyBadge } from "@/features/demo/ui";

export function MondayBrief({
  scenario,
  onOpenRequest,
  onOpenMinutes,
}: {
  scenario: DemoScenario;
  onOpenRequest: (number: string) => void;
  onOpenMinutes: () => void;
}) {
  const open = scenario.requests.filter((r) => r.status === "needs-signature");
  const done = scenario.requests.filter((r) => r.status === "responded");
  const { meeting } = scenario;
  const earliest = open[0];
  const minutesStillOpen = compare(scenario.today, meeting.proposedDueOn) <= 0;

  const markers: RailMarker[] = open.map((r) => ({
    date: r.deadlines.responseDueOn,
    label: `${r.number.replace("FOIA ", "")} due`,
    tone: "due",
  }));
  if (minutesStillOpen) {
    markers.push({ date: meeting.proposedDueOn, label: "Minutes due", tone: "meeting" });
  }
  const lastDate = markers.reduce<CivilDate>(
    (max, m) => (compare(m.date, max) > 0 ? m.date : max),
    scenario.today,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[2.1rem]">
          Good morning, {scenario.clerkFirstName}.
        </h1>
        <p className="mt-1 text-slate-soft">{formatLong(scenario.today)}</p>
      </div>

      <Panel>
        <ul className="divide-y divide-rule text-[15px]">
          <li className="px-5 py-4">
            <strong className="text-navy-700">
              {open.length} FOIA {open.length === 1 ? "request needs" : "requests need"} your
              signature.
            </strong>{" "}
            {earliest
              ? `The earliest is due ${formatLong(earliest.deadlines.responseDueOn)}. Each one has a drafted response and fee estimate ready.`
              : null}
          </li>
          <li className="px-5 py-4">
            <strong className="text-navy-700">
              Minutes for the {formatMedium(meeting.meetingOn)} board meeting are drafted.
            </strong>{" "}
            {minutesStillOpen
              ? `Proposed minutes must be available by ${formatLong(meeting.proposedDueOn)}.`
              : `Proposed minutes were posted on time. Next regular meeting: ${formatLong(meeting.nextMeetingOn)}.`}
          </li>
          <li className="px-5 py-4">
            <strong className="text-navy-700">
              The phone line answered {scenario.stats.callsHandled} resident calls last week.
            </strong>{" "}
            {scenario.stats.callsTransferred} were sent to the office with a summary. The rest were
            tax, recycling, cemetery, and voting questions.
          </li>
        </ul>
      </Panel>

      <Panel title="The next two weeks">
        <div className="p-5">
          <DeadlineRail
            start={scenario.today}
            end={addDays(lastDate, 2)}
            markers={markers}
            today={scenario.today}
            caption="Weekends are narrowed and Michigan legal holidays are hatched; neither counts toward a deadline."
          />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Waiting for your signature">
          <ul className="divide-y divide-rule">
            {open.map((r) => (
              <li key={r.number}>
                <button
                  type="button"
                  onClick={() => onOpenRequest(r.number)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-ocean-50/60"
                >
                  <span>
                    <span className="block font-semibold text-navy-700">
                      {r.number}: {r.recommendation.label}
                    </span>
                    <span className="block text-sm text-slate-soft">{r.requester}</span>
                  </span>
                  <UrgencyBadge urgency={r.urgency} daysLeft={r.businessDaysLeft} />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onOpenMinutes}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-ocean-50/60"
              >
                <span>
                  <span className="block font-semibold text-navy-700">Review draft minutes</span>
                  <span className="block text-sm text-slate-soft">
                    Regular Township Board meeting, {formatMedium(meeting.meetingOn)}
                  </span>
                </span>
                {minutesStillOpen ? (
                  <UrgencyBadge urgency={meeting.urgency} daysLeft={meeting.businessDaysLeft} />
                ) : (
                  <UrgencyBadge urgency="responded" daysLeft={0} />
                )}
              </button>
            </li>
          </ul>
        </Panel>

        <Panel title="Done since last Monday">
          <ul className="divide-y divide-rule text-sm">
            {done.map((r) => (
              <li key={r.number} className="px-5 py-3.5">
                <span className="font-semibold text-navy-700">{r.number}</span> answered{" "}
                {r.respondedOn ? formatMedium(r.respondedOn) : ""}, before its{" "}
                {formatMedium(r.deadlines.responseDueOn)} deadline.
              </li>
            ))}
            <li className="px-5 py-3.5">
              Resident line: {scenario.stats.callsHandled - scenario.stats.callsTransferred} calls
              resolved without staff time.
            </li>
            <li className="px-5 py-3.5">FOIA log updated and backed up automatically.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
