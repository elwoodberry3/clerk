import Link from "next/link";
import { DeadlineRail } from "@/components/DeadlineRail";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { civilDate, formatLong } from "@/lib/dates/civil-date";
import { SALES_EMAIL_HREF, SALES_PHONE_HREF, publicEnv } from "@/lib/env";
import { computeFoiaDeadlines, MI_CITATIONS, proposedMinutesDueOn } from "@/lib/rules/michigan";

// A fixed, real-world example so the hero is identical for every visitor and every build.
const EXAMPLE_SENT = civilDate("2026-11-20");
const example = computeFoiaDeadlines({ submittedOn: EXAMPLE_SENT, channel: "email" });
const MINUTES_EXAMPLE = civilDate("2026-10-12");
const minutesDue = proposedMinutesDueOn(MINUTES_EXAMPLE);

const capabilities = [
  {
    title: "FOIA requests, answered on time",
    body: "Every emailed or walk-in request is logged with its legal receipt date. The agent computes the 5-business-day deadline, drafts the response letter and itemized fee on your letterhead, and flags possible exemptions. You read it and sign.",
    cite: MI_CITATIONS.foiaResponse,
  },
  {
    title: "Board minutes, drafted the next morning",
    body: "Upload the meeting recording. You get draft minutes in your township's format, with motions and roll-call votes laid out, well inside the 8-business-day window for proposed minutes.",
    cite: MI_CITATIONS.minutes,
  },
  {
    title: "Resident calls, handled",
    body: "Tax due dates, cemetery lots, recycling days, early voting hours, hall rentals. The phone line answers from your own website, texts residents the right form, and sends anything unusual to you with a summary.",
    cite: undefined,
  },
  {
    title: "A Monday brief instead of a pile",
    body: "One screen each week: what got done, what is due, and what is waiting for your signature. The same numbers become a monthly report for the board.",
    cite: undefined,
  },
] as const;

const guardrails = [
  "The agent drafts. A named township official approves anything that leaves the office.",
  "Every action is logged with who, what, and when. Your FOIA log becomes a complete record.",
  "Your township owns its data and can export all of it at any time.",
  "Deadline rules are written from the statutes and cited on every screen.",
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-rule bg-white">
          <div className="mx-auto max-w-6xl px-5 pb-14 pt-14 sm:px-8 sm:pt-20">
            <p className="text-sm font-semibold text-ocean-700">For Michigan township clerks</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.02em] sm:text-[3.4rem] sm:leading-[1.05]">
              Every FOIA and minutes deadline, counted the way Michigan law counts it.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-ink">
              The Township Clerk Agent keeps your office inside Michigan&rsquo;s legal deadlines. It
              logs and drafts FOIA responses, writes first-draft board minutes, and answers the
              resident phone line. You approve and sign.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SALES_EMAIL_HREF}
                className="rounded-md bg-ocean-600 px-5 py-3 font-semibold text-white hover:bg-ocean-700"
              >
                Request your township&rsquo;s demo
              </a>
              <Link
                href="/tools/foia-deadline-calculator"
                className="rounded-md border border-rule-strong bg-white px-5 py-3 font-semibold text-navy-700 hover:border-navy-700"
              >
                Calculate a FOIA deadline
              </Link>
            </div>

            <div className="mt-14">
              <h2 className="text-base font-semibold text-navy-700">
                One emailed request, the Friday before Thanksgiving
              </h2>
              <p className="mb-4 mt-1 max-w-2xl text-sm text-slate-soft">
                Email counts as received the next business day. Then five business days, skipping
                the weekend and the holiday. The agent does this math for every request and reminds
                you before it matters.
              </p>
              <DeadlineRail
                start={EXAMPLE_SENT}
                end={civilDate("2026-12-02")}
                countFrom={example.receivedOn}
                markers={[
                  { date: EXAMPLE_SENT, label: "Email sent", tone: "start" },
                  { date: example.receivedOn, label: "Legally received", tone: "start" },
                  { date: example.responseDueOn, label: "Response due", tone: "due" },
                ]}
                caption={`Sent ${formatLong(EXAMPLE_SENT)}. Response due ${formatLong(example.responseDueOn)}. Source: ${MI_CITATIONS.foiaReceipt.cite} and ${MI_CITATIONS.foiaResponse.cite}.`}
              />
            </div>
          </div>
        </section>

        <section id="what-it-does" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight">
            Four jobs taken off the clerk&rsquo;s desk
          </h2>
          <div className="mt-10 divide-y divide-rule border-y border-rule">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="grid gap-3 py-7 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-10"
              >
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <div>
                  <p className="max-w-2xl">{c.body}</p>
                  {c.cite ? (
                    <p className="mt-2 text-sm text-slate-soft">
                      Follows{" "}
                      <a
                        href={c.cite.url}
                        className="text-ocean-700 underline underline-offset-2"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.cite.cite}
                      </a>
                      .
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-rule bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Built for public records, not for hype
              </h2>
              <p className="mt-4 max-w-md">
                Your township answers to residents, the board, and the law. The agent is designed
                around that, starting with who has the final word.
              </p>
            </div>
            <ul className="space-y-4">
              {guardrails.map((g) => (
                <li key={g} className="flex gap-3">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-1 h-5 w-5 shrink-0 text-green-600"
                    aria-hidden
                  >
                    <path fill="currentColor" d="M8.2 13.6 4.6 10l-1.2 1.2 4.8 4.8 9-9-1.2-1.2z" />
                  </svg>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight">How a township gets started</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              [
                "See it with your own township",
                "We build a private demo from your public website, FOIA policy, and meeting schedule. It takes us a day; it takes you three minutes to look at.",
              ],
              [
                "A 20-minute walkthrough",
                "We go through your week together: where requests arrive, how minutes get written, which calls take the most time.",
              ],
              [
                "One board vote",
                "A fixed-price agreement goes on your next board agenda. Setup takes about three weeks, including training.",
              ],
            ].map(([title, body], i) => (
              <li key={title} className="border-t-2 border-navy-700 pt-4">
                <p className="text-sm font-semibold text-slate-soft">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                <p className="mt-2">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-sm text-slate-soft">
            Proposed minutes from a board meeting held on Monday, October 12, 2026 (Columbus Day, a
            Michigan legal holiday) were due {formatLong(minutesDue)}. The agent counts holidays
            your office may work through but the statute does not.
          </p>
        </section>

        <section id="pricing" className="border-t border-rule bg-navy-700 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                A fixed price your board can vote on
              </h2>
              <p className="mt-4 max-w-lg text-navy-50">
                No per-user fees and no long contract. The setup covers configuration for your
                township, your phone line, your letter templates, and staff training.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/20">
              <div className="bg-navy-700 p-5">
                <dt className="text-sm text-navy-50">Setup</dt>
                <dd className="mt-1 text-3xl font-bold">$4,500</dd>
                <dd className="mt-1 text-sm text-navy-50">one time</dd>
              </div>
              <div className="bg-navy-700 p-5">
                <dt className="text-sm text-navy-50">Care plan</dt>
                <dd className="mt-1 text-3xl font-bold">$495</dd>
                <dd className="mt-1 text-sm text-navy-50">per month</dd>
              </div>
              <div className="col-span-2 bg-navy-900 p-5 text-sm text-navy-50">
                The first three Michigan townships join as design partners at $2,500 setup, in
                exchange for feedback and a reference call.
              </div>
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            See it with your township&rsquo;s name on it
          </h2>
          <p className="mt-4 max-w-2xl">
            Call or email and we&rsquo;ll send a private demo built from your township&rsquo;s own
            website. If an election is on, we&rsquo;ll wait until after the canvass.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={SALES_EMAIL_HREF}
              className="rounded-md bg-ocean-600 px-5 py-3 font-semibold text-white hover:bg-ocean-700"
            >
              Email {publicEnv.NEXT_PUBLIC_SALES_EMAIL}
            </a>
            <a
              href={SALES_PHONE_HREF}
              className="rounded-md border border-rule-strong bg-white px-5 py-3 font-semibold text-navy-700 hover:border-navy-700"
            >
              Call {publicEnv.NEXT_PUBLIC_SALES_PHONE}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
