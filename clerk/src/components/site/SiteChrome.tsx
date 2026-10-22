import Link from "next/link";
import { AdbyrdWordmark } from "@/components/brand/AdbyrdMark";
import { publicEnv, SALES_EMAIL_HREF, SALES_PHONE_HREF } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Township Clerk Agent home">
          <AdbyrdWordmark />
          <span className="hidden border-l border-rule pl-3 text-sm font-medium text-slate-ink sm:inline">
            Township Clerk Agent
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-5 text-sm font-medium">
          <Link
            href="/#what-it-does"
            className="hidden text-slate-ink hover:text-navy-700 md:inline"
          >
            What it does
          </Link>
          <Link href="/#pricing" className="hidden text-slate-ink hover:text-navy-700 md:inline">
            Pricing
          </Link>
          <Link
            href="/tools/foia-deadline-calculator"
            className="hidden text-slate-ink hover:text-navy-700 sm:inline"
          >
            FOIA calculator
          </Link>
          <a
            href={SALES_EMAIL_HREF}
            className="rounded-md bg-ocean-600 px-3.5 py-2 text-white hover:bg-ocean-700"
          >
            Request a demo
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
        <div className="space-y-3">
          <AdbyrdWordmark />
          <p className="max-w-sm text-slate-soft">
            Adbyrd builds AI assistants for Michigan local government. Headquartered at 251 N Rose
            St, Kalamazoo, Michigan.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-navy-700">Contact</p>
          <p>
            <a className="hover:text-ocean-700" href={SALES_PHONE_HREF}>
              {publicEnv.NEXT_PUBLIC_SALES_PHONE}
            </a>
          </p>
          <p>
            <a className="hover:text-ocean-700" href={SALES_EMAIL_HREF}>
              {publicEnv.NEXT_PUBLIC_SALES_EMAIL}
            </a>
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-navy-700">Free tools</p>
          <p>
            <Link className="hover:text-ocean-700" href="/tools/foia-deadline-calculator">
              Michigan FOIA deadline calculator
            </Link>
          </p>
        </div>
        <p className="text-xs text-slate-soft sm:col-span-3">
          The Township Clerk Agent drafts; township officials decide and sign. Nothing on this site
          is legal advice. Deadline rules follow MCL 15.235, MCL 15.234, MCL 15.269, and MCL
          435.101. © {new Date().getFullYear()} Adbyrd.
        </p>
      </div>
    </footer>
  );
}
