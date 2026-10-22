"use client";

import { useState } from "react";
import { formatLong, formatMedium } from "@/lib/dates/civil-date";
import type { DemoFoiaRequest } from "@/lib/demo/scenario";
import { MI_CITATIONS } from "@/lib/rules/michigan/citations";
import type { FoiaChannel } from "@/lib/rules/michigan/foia";
import { track } from "@/lib/analytics/track";
import { Panel, SourceLink, UrgencyBadge } from "@/features/demo/ui";

const CHANNEL_LABEL: Record<FoiaChannel, string> = {
  email: "Email",
  fax: "Fax",
  "web-form": "Website form",
  "in-person": "In person",
  mail: "Mail",
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function FoiaDesk({
  requests,
  selected,
  onSelect,
  tenantSlug,
  tenantName,
}: {
  requests: DemoFoiaRequest[];
  selected: string;
  onSelect: (number: string) => void;
  tenantSlug: string;
  tenantName: string;
}) {
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const current = requests.find((r) => r.number === selected) ?? requests[0]!;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Panel title="Requests" className="self-start">
        <ul className="divide-y divide-rule" aria-label="FOIA requests">
          {requests.map((r) => {
            const active = r.number === current.number;
            return (
              <li key={r.number}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    onSelect(r.number);
                    track({
                      name: "foia_request_opened",
                      tenant: tenantSlug,
                      detail: r.number.replace(/\D/g, ""),
                    });
                  }}
                  className={[
                    "block w-full border-l-[3px] px-4 py-3.5 text-left",
                    active ? "border-ocean-600 bg-ocean-50" : "border-transparent hover:bg-paper",
                  ].join(" ")}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-navy-700">{r.number}</span>
                    {r.status === "responded" || approved[r.number] ? (
                      <UrgencyBadge urgency="responded" daysLeft={0} />
                    ) : (
                      <UrgencyBadge urgency={r.urgency} daysLeft={r.businessDaysLeft} />
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-slate-ink">{r.requester}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-slate-soft">
                    {r.records}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <RequestDetail
        key={current.number}
        request={current}
        approved={Boolean(approved[current.number])}
        tenantName={tenantName}
        onApprove={() => {
          setApproved((a) => ({ ...a, [current.number]: true }));
          track({
            name: "foia_letter_approved",
            tenant: tenantSlug,
            detail: current.recommendation.kind,
          });
        }}
      />
    </div>
  );
}

function RequestDetail({
  request: r,
  approved,
  onApprove,
  tenantName,
}: {
  request: DemoFoiaRequest;
  approved: boolean;
  onApprove: () => void;
  tenantName: string;
}) {
  const done = r.status === "responded";
  const actionLabel =
    r.recommendation.kind === "extension"
      ? "Approve and send extension notice"
      : r.recommendation.kind === "partial-denial"
        ? "Approve and send partial grant"
        : "Approve and send";

  return (
    <div className="space-y-6">
      <Panel>
        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{r.number}</h1>
              <p className="text-slate-soft">
                {r.requester}. {r.requesterType}.
              </p>
            </div>
            {done ? (
              <UrgencyBadge urgency="responded" daysLeft={0} />
            ) : (
              <UrgencyBadge urgency={r.urgency} daysLeft={r.businessDaysLeft} />
            )}
          </div>
          <p className="max-w-3xl">
            <span className="font-semibold text-navy-700">Requested: </span>
            {r.records}.
          </p>

          <dl className="grid gap-x-8 gap-y-3 border-t border-rule pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-soft">Arrived by</dt>
              <dd className="font-medium text-navy-700">
                {CHANNEL_LABEL[r.channel]}, {formatMedium(r.submittedOn)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-soft">Legally received</dt>
              <dd className="font-medium text-navy-700">{formatLong(r.deadlines.receivedOn)}</dd>
              <dd className="text-xs text-slate-soft">{r.deadlines.receiptRule}</dd>
            </div>
            <div>
              <dt className="text-slate-soft">Response due</dt>
              <dd className="font-semibold text-ocean-700">
                {formatLong(r.deadlines.responseDueOn)}
              </dd>
              <dd className="text-xs text-slate-soft">
                5 business days after receipt.{" "}
                <SourceLink href={MI_CITATIONS.foiaResponse.url}>
                  {MI_CITATIONS.foiaResponse.cite}
                </SourceLink>
              </dd>
            </div>
            <div>
              <dt className="text-slate-soft">With the one allowed extension</dt>
              <dd className="font-medium text-navy-700">{formatLong(r.deadlines.extendedDueOn)}</dd>
              <dd className="text-xs text-slate-soft">
                Notice must go out by the response due date.{" "}
                <SourceLink href={MI_CITATIONS.foiaExtension.url}>
                  {MI_CITATIONS.foiaExtension.cite}
                </SourceLink>
              </dd>
            </div>
          </dl>

          {r.flags.length ? (
            <ul className="space-y-1.5 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {r.flags.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden>!</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="rounded-md border border-ocean-100 bg-ocean-50 px-4 py-3 text-sm">
            <p className="font-semibold text-navy-700">
              Agent recommendation: {r.recommendation.label}
            </p>
            <p className="mt-0.5">{r.recommendation.why}</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <Panel
          title={done ? "Response sent" : "Draft response"}
          action={<span className="text-xs text-slate-soft">On {tenantName} letterhead</span>}
        >
          <article className="space-y-3 px-6 py-6 text-[15px] leading-relaxed text-slate-ink">
            <p className="font-semibold text-navy-700">{r.letter.subject}</p>
            {r.letter.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
          {!done ? (
            <div className="flex flex-wrap items-center gap-3 border-t border-rule px-6 py-4">
              {approved ? (
                <p role="status" className="text-sm font-semibold text-green-700">
                  Approved. In the live system this sends from your FOIA inbox and is added to the
                  FOIA log with your name and the time.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onApprove}
                    className="rounded-md bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
                  >
                    {actionLabel}
                  </button>
                  <span className="text-sm text-slate-soft">
                    Nothing is sent without your approval.
                  </span>
                </>
              )}
            </div>
          ) : null}
        </Panel>

        <div className="space-y-6">
          <Panel title="Fee estimate">
            <div className="px-5 py-4 text-sm">
              {r.fee.lines.length === 0 ? (
                <p>No charge.</p>
              ) : (
                <table className="w-full">
                  <caption className="sr-only">Itemized fee estimate</caption>
                  <tbody className="divide-y divide-rule">
                    {r.fee.lines.map((l) => (
                      <tr key={l.code}>
                        <th scope="row" className="py-2 pr-3 text-left font-normal">
                          <span className="block text-navy-700">{l.label}</span>
                          <span className="block text-xs text-slate-soft">{l.detail}</span>
                        </th>
                        <td className="py-2 text-right font-medium text-navy-700">
                          {usd(l.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row" className="pt-3 text-left font-semibold text-navy-700">
                        Total
                      </th>
                      <td className="pt-3 text-right font-semibold text-navy-700">
                        {usd(r.fee.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              <p className="mt-3 text-xs text-slate-soft">
                {r.fee.depositAllowed
                  ? `Over $50, so a deposit of up to ${usd(r.fee.maxDeposit)} may be requested.`
                  : "Under $50, so no deposit may be required."}{" "}
                Wage and fringe rates are placeholders until we confirm yours.{" "}
                <SourceLink href={MI_CITATIONS.foiaFees.url}>
                  {MI_CITATIONS.foiaFees.cite}
                </SourceLink>
              </p>
            </div>
          </Panel>

          <Panel title="Required elements included">
            <ul className="space-y-2 px-5 py-4 text-sm">
              {r.letter.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                    aria-hidden
                  >
                    <path fill="currentColor" d="M8.2 13.6 4.6 10l-1.2 1.2 4.8 4.8 9-9-1.2-1.2z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
