import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { FoiaCalculator } from "@/features/calculator/FoiaCalculator";
import { todayIn } from "@/lib/dates/civil-date";
import { MI_CITATIONS } from "@/lib/rules/michigan/citations";

export const metadata: Metadata = {
  title: "Michigan FOIA deadline calculator",
  description:
    "Free tool for Michigan clerks and FOIA coordinators: when a request is legally received, when the response is due, and the extension deadline, with Michigan legal holidays.",
  alternates: { canonical: "/tools/foia-deadline-calculator" },
};

const sources = [
  MI_CITATIONS.foiaReceipt,
  MI_CITATIONS.foiaResponse,
  MI_CITATIONS.foiaExtension,
  MI_CITATIONS.businessDay,
  MI_CITATIONS.legalHolidays,
];

export default async function CalculatorPage() {
  await connection();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight">
          Michigan FOIA deadline calculator
        </h1>
        <p className="mt-4 max-w-2xl text-lg">
          Enter when a request arrived. You&rsquo;ll see when it was legally received, when your
          response is due, and how far the one allowed extension reaches. Weekends and Michigan
          legal holidays, including Lincoln&rsquo;s Birthday and Columbus Day, are skipped.
        </p>
        <div className="mt-10">
          <FoiaCalculator initialDate={todayIn("America/Detroit")} />
        </div>
        <section className="mt-14 max-w-3xl border-t border-rule pt-8">
          <h2 className="text-xl font-semibold">The rules this calculator follows</h2>
          <ul className="mt-4 space-y-3">
            {sources.map((s) => (
              <li key={s.cite}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-ocean-700 underline underline-offset-2"
                >
                  {s.cite}
                </a>
                <span className="block">{s.summary}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-soft">
            This tool is provided for convenience and is not legal advice. Confirm deadlines with
            your township attorney when a request is unusual.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
