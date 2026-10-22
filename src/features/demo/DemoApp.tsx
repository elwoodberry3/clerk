"use client";

import { useEffect, useState } from "react";
import { AdbyrdMark } from "@/components/brand/AdbyrdMark";
import { track } from "@/lib/analytics/track";
import type { DemoScenario } from "@/lib/demo/scenario";
import type { Tenant } from "@/lib/tenants/schema";
import { FoiaDesk } from "@/features/demo/FoiaDesk";
import { MinutesStudio } from "@/features/demo/MinutesStudio";
import { MondayBrief } from "@/features/demo/MondayBrief";
import { ResidentLine } from "@/features/demo/ResidentLine";

const TABS = [
  { id: "brief", label: "Monday brief" },
  { id: "foia", label: "FOIA desk" },
  { id: "minutes", label: "Minutes" },
  { id: "phone", label: "Resident line" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DemoApp({
  tenant,
  scenario,
  salesEmail,
  salesPhone,
}: {
  tenant: Tenant;
  scenario: DemoScenario;
  salesEmail: string;
  salesPhone: string;
}) {
  const [tab, setTab] = useState<TabId>("brief");
  const [selected, setSelected] = useState<string>(
    scenario.requests.find((r) => r.status === "needs-signature")?.number ??
      scenario.requests[0]!.number,
  );
  const clerk = tenant.board.find((m) => m.role === "Clerk");
  const openCount = scenario.requests.filter((r) => r.status === "needs-signature").length;

  useEffect(() => {
    track({ name: "demo_opened", tenant: tenant.slug });
  }, [tenant.slug]);

  const go = (next: TabId) => {
    setTab(next);
    track({ name: "demo_tab_viewed", tenant: tenant.slug, detail: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh">
      <div className="bg-navy-900 text-[13px] text-navy-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2 sm:px-8">
          <span className="inline-flex items-center gap-2 font-semibold text-white">
            <AdbyrdMark className="h-4 w-4" title="" />
            Private demo prepared by Adbyrd for {tenant.name}
          </span>
          <span>
            Township details come from {new URL(tenant.website).hostname.replace("www.", "")}.
            Requests, calls, and minutes are samples. This is not an official township website.
          </span>
        </div>
      </div>

      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 pt-4 sm:px-8">
          <div>
            <p className="text-lg font-bold leading-tight text-navy-700">{tenant.name}</p>
            <p className="text-sm text-slate-soft">Clerk&rsquo;s office, {tenant.county} County</p>
          </div>
          {clerk ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-right text-sm leading-tight">
                <span className="block font-semibold text-navy-700">{clerk.name}</span>
                <span className="block text-slate-soft">Clerk and FOIA Coordinator</span>
              </span>
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full bg-navy-700 text-sm font-semibold text-white"
              >
                {clerk.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
            </div>
          ) : null}
        </div>
        <nav
          aria-label="Demo sections"
          className="mx-auto mt-3 max-w-7xl overflow-x-auto px-5 sm:px-8"
        >
          <ul className="flex gap-1" role="tablist">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <li key={t.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`panel-${t.id}`}
                    id={`tab-${t.id}`}
                    onClick={() => go(t.id)}
                    className={[
                      "flex items-center gap-2 whitespace-nowrap border-b-[3px] px-3 pb-3 pt-2 text-[15px] font-semibold",
                      active
                        ? "border-ocean-600 text-navy-700"
                        : "border-transparent text-slate-soft hover:text-navy-700",
                    ].join(" ")}
                  >
                    {t.label}
                    {t.id === "foia" && openCount > 0 ? (
                      <span className="rounded-full bg-ocean-600 px-1.5 text-xs text-white">
                        {openCount}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        id="main"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mx-auto max-w-7xl px-5 py-8 sm:px-8"
      >
        <div id={`panel-${tab}`}>
          {tab === "brief" ? (
            <MondayBrief
              scenario={scenario}
              onOpenRequest={(n) => {
                setSelected(n);
                go("foia");
              }}
              onOpenMinutes={() => go("minutes")}
            />
          ) : null}
          {tab === "foia" ? (
            <FoiaDesk
              requests={scenario.requests}
              selected={selected}
              onSelect={setSelected}
              tenantSlug={tenant.slug}
              tenantName={tenant.name}
            />
          ) : null}
          {tab === "minutes" ? (
            <MinutesStudio tenant={tenant} meeting={scenario.meeting} today={scenario.today} />
          ) : null}
          {tab === "phone" ? <ResidentLine tenant={tenant} /> : null}
        </div>
      </main>

      <footer className="border-t border-rule bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-sm sm:px-8">
          <p className="max-w-2xl text-slate-soft">
            Questions about this demo, or ready for a 20-minute walkthrough? Contact Steve at
            Adbyrd.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${salesEmail}?subject=${encodeURIComponent(`${tenant.name} demo`)}`}
              className="rounded-md bg-ocean-600 px-4 py-2.5 font-semibold text-white hover:bg-ocean-700"
            >
              Book a walkthrough
            </a>
            <a
              href={`tel:${salesPhone.replace(/[^\d+]/g, "")}`}
              className="rounded-md border border-rule-strong px-4 py-2.5 font-semibold text-navy-700 hover:border-navy-700"
            >
              {salesPhone}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
