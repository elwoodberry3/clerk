import { compare, formatLong, parts, type CivilDate } from "@/lib/dates/civil-date";
import type { DemoMeeting } from "@/lib/demo/scenario";
import { approvedMinutesDueOn } from "@/lib/rules/michigan/minutes";
import { MI_CITATIONS } from "@/lib/rules/michigan/citations";
import type { Tenant } from "@/lib/tenants/schema";
import { Panel, SourceLink, UrgencyBadge } from "@/features/demo/ui";

interface Motion {
  item: string;
  moved: string;
  supported: string;
  result: string;
}

/** Illustrative business only; votes are attributed by office, never to named individuals. */
function sampleMotions(meetingOn: CivilDate): Motion[] {
  const nextYear = parts(meetingOn).year + 1;
  return [
    {
      item: "Approve the agenda as presented",
      moved: "Treasurer",
      supported: "Trustee",
      result: "Carried 7–0",
    },
    {
      item: "Approve the consent agenda: minutes of the prior regular meeting and payment of bills",
      moved: "Trustee",
      supported: "Clerk",
      result: "Carried 7–0 (roll call)",
    },
    {
      item: `Adopt the ${nextYear} regular meeting schedule`,
      moved: "Clerk",
      supported: "Trustee",
      result: "Carried 7–0",
    },
    { item: "Adjourn", moved: "Trustee", supported: "Treasurer", result: "Carried 7–0" },
  ];
}

export function MinutesStudio({
  tenant,
  meeting,
  today,
}: {
  tenant: Tenant;
  meeting: DemoMeeting;
  today: CivilDate;
}) {
  const motions = sampleMotions(meeting.meetingOn);
  const open = compare(today, meeting.proposedDueOn) <= 0;
  const approvalDue = approvedMinutesDueOn(meeting.nextMeetingOn);
  const members = tenant.board;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <Panel
        title="Draft minutes"
        action={
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Sample content
          </span>
        }
      >
        <div className="bg-paper px-4 py-6 sm:px-8">
          <article className="mx-auto max-w-[44rem] space-y-5 rounded-sm bg-white px-6 py-8 text-[15px] leading-relaxed shadow-[0_1px_3px_rgba(26,75,124,0.12)] sm:px-12 sm:py-12">
            <header className="text-center">
              <p className="font-bold tracking-wide text-navy-700">{tenant.minutes.heading}</p>
              <p className="font-semibold text-navy-700">Regular {tenant.meetings.body} Meeting</p>
              <p>{formatLong(meeting.meetingOn)}</p>
              <p className="mt-3 rounded bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                Sample draft. Agenda items, attendance, and votes are illustrative and are not a
                record of this meeting.
              </p>
            </header>
            <p>
              The regular meeting of the {tenant.meetings.body} of {tenant.name} was held on{" "}
              {formatLong(meeting.meetingOn)}, at {tenant.meetings.location}. The meeting was called
              to order at {tenant.meetings.time} by the Supervisor, followed by the Pledge of
              Allegiance.
            </p>
            <div>
              <p className="font-semibold text-navy-700">Members present:</p>
              <p>{members.map((m) => `${m.role} ${m.name}`).join(", ")}.</p>
              <p className="mt-1">
                <span className="font-semibold text-navy-700">Members absent:</span> [From roll
                call.]
              </p>
            </div>
            <ol className="list-decimal space-y-3 pl-5">
              {motions.map((m) => (
                <li key={m.item}>
                  {m.item}. Motion by {m.moved}, supported by {m.supported}. {m.result}.
                </li>
              ))}
            </ol>
            <p>
              <span className="font-semibold text-navy-700">Public comment:</span> [Summarized from
              the recording: speaker, topic, and any request for follow-up.]
            </p>
            <p>There being no further business, the meeting was adjourned.</p>
            <div className="grid gap-8 pt-6 sm:grid-cols-2">
              {(["Clerk", "Supervisor"] as const).map((role) => {
                const person = members.find((m) => m.role === role);
                return (
                  <div key={role}>
                    <div className="border-b border-slate-ink/60 pb-6" />
                    <p className="mt-1 text-sm">
                      {role === "Supervisor" ? "Attested: " : ""}
                      {person?.name}, {role}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-slate-soft">{tenant.minutes.certificationLine}</p>
          </article>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel title="Open Meetings Act clock">
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-navy-700">Proposed minutes</span>
              {open ? (
                <UrgencyBadge urgency={meeting.urgency} daysLeft={meeting.businessDaysLeft} />
              ) : (
                <UrgencyBadge urgency="responded" daysLeft={0} />
              )}
            </div>
            <p>
              Available to the public by <strong>{formatLong(meeting.proposedDueOn)}</strong>, 8
              business days after the meeting.
            </p>
            <p>
              If approved at the {formatLong(meeting.nextMeetingOn)} meeting, approved minutes are
              due by <strong>{formatLong(approvalDue)}</strong>.
            </p>
            <p className="text-xs text-slate-soft">
              <SourceLink href={MI_CITATIONS.minutes.url}>{MI_CITATIONS.minutes.cite}</SourceLink>
            </p>
          </div>
        </Panel>

        <Panel title="Motions and votes">
          <table className="w-full text-sm">
            <caption className="sr-only">Motions and votes extracted from the recording</caption>
            <thead>
              <tr className="border-b border-rule text-left text-xs text-slate-soft">
                <th scope="col" className="px-5 py-2 font-medium">
                  Motion
                </th>
                <th scope="col" className="px-5 py-2 font-medium">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {motions.map((m) => (
                <tr key={m.item}>
                  <td className="px-5 py-2.5 text-navy-700">{m.item}</td>
                  <td className="whitespace-nowrap px-5 py-2.5 text-green-700">
                    {m.result.replace(" (roll call)", "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="How this draft was made">
          <ol className="list-decimal space-y-2 py-4 pl-10 pr-5 text-sm">
            <li>The meeting recording is uploaded the night of the meeting.</li>
            <li>The agent transcribes it and identifies speakers, motions, and votes.</li>
            <li>The draft is written in your township&rsquo;s existing minutes format.</li>
            <li>You edit, approve, and post. The agent never posts minutes on its own.</li>
          </ol>
        </Panel>
      </div>
    </div>
  );
}
