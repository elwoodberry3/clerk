"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics/track";
import { FALLBACK_ANSWER, matchFaq } from "@/lib/resident-line/match";
import type { Faq, Tenant } from "@/lib/tenants/schema";
import { Panel, SourceLink } from "@/features/demo/ui";

type Turn = { who: "caller"; text: string } | { who: "agent"; text: string; faq?: Faq };

const FOLLOW_UP: Record<Faq["followUp"], string | undefined> = {
  "text-link": "Texted the caller a link to the page",
  transfer: "Offered to transfer to the Clerk's office",
  "take-message": "Took a message for the Clerk's office",
  none: undefined,
};

export function ResidentLine({ tenant }: { tenant: Tenant }) {
  const [turns, setTurns] = useState<Turn[]>([
    { who: "agent", text: tenant.residentLine.greeting },
  ]);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const logRef = useRef<HTMLOListElement>(null);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text) return;
    const { faq } = matchFaq(text, tenant.residentLine.faqs);
    setTurns((t) => [
      ...t,
      { who: "caller", text },
      { who: "agent", text: faq ? faq.answer : FALLBACK_ANSWER, faq },
    ]);
    setDraft("");
    track({ name: "resident_question_asked", tenant: tenant.slug, detail: faq?.id ?? "fallback" });
    requestAnimationFrame(() => {
      logRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <Panel
        title="Try the resident line"
        action={<span className="text-xs text-slate-soft">Type as a resident would</span>}
      >
        <ol
          ref={logRef}
          className="max-h-[32rem] space-y-4 overflow-y-auto px-5 py-5"
          aria-live="polite"
        >
          {turns.map((turn, i) =>
            turn.who === "caller" ? (
              <li
                key={i}
                className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-navy-700 px-4 py-2.5 text-white"
              >
                <span className="sr-only">Caller: </span>
                {turn.text}
              </li>
            ) : (
              <li key={i} className="max-w-[90%]">
                <div className="rounded-lg rounded-bl-sm border border-rule bg-paper px-4 py-3">
                  <span className="mb-1 block text-xs font-semibold text-ocean-700">
                    {tenant.shortName} virtual assistant
                  </span>
                  {turn.text}
                </div>
                {turn.faq ? (
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-slate-soft">
                    <span>
                      Answer from{" "}
                      <SourceLink href={turn.faq.provenance.sourceUrl}>
                        {new URL(turn.faq.provenance.sourceUrl).hostname.replace("www.", "")}
                        {new URL(turn.faq.provenance.sourceUrl).pathname}
                      </SourceLink>
                    </span>
                    {FOLLOW_UP[turn.faq.followUp] ? (
                      <span className="text-green-700">{FOLLOW_UP[turn.faq.followUp]}</span>
                    ) : null}
                  </p>
                ) : i > 0 ? (
                  <p className="mt-1.5 px-1 text-xs text-green-700">
                    Message logged and summarized for the Clerk&rsquo;s office
                  </p>
                ) : null}
              </li>
            ),
          )}
        </ol>
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-rule px-5 py-4">
          <label htmlFor={inputId} className="sr-only">
            Your question
          </label>
          <input
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="When are winter taxes due?"
            maxLength={200}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-md border border-rule-strong bg-white px-3 py-2.5 text-[15px] placeholder:text-slate-soft/70 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/30"
          />
          <button
            type="submit"
            className="rounded-md bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
          >
            Ask
          </button>
        </form>
      </Panel>

      <div className="space-y-6">
        <Panel title="Common questions">
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {tenant.residentLine.faqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                onClick={() => ask(faq.sampleQuestion)}
                className="rounded-full border border-rule-strong bg-white px-3 py-1.5 text-sm text-navy-700 hover:border-ocean-600 hover:bg-ocean-50"
              >
                {faq.sampleQuestion}
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="On your real phone line">
          <ul className="space-y-2 px-5 py-4 text-sm">
            <li>Answers {tenant.phone} after hours, or when every line is busy.</li>
            <li>Speaks naturally; this demo uses text so you can try it here.</li>
            <li>
              Only answers from your website and the facts you approve. Anything else becomes a
              message for the office.
            </li>
            <li>Each answer is logged with its source for your monthly report.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
