import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { SALES_EMAIL_HREF } from "@/lib/env";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight">This page isn&rsquo;t here</h1>
        <p className="mt-4 text-lg">
          If you followed a demo link, it may have been mistyped or retired. Email us and
          we&rsquo;ll send a fresh one.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={SALES_EMAIL_HREF}
            className="rounded-md bg-ocean-600 px-5 py-3 font-semibold text-white hover:bg-ocean-700"
          >
            Ask for a new demo link
          </a>
          <Link
            href="/"
            className="rounded-md border border-rule-strong bg-white px-5 py-3 font-semibold text-navy-700"
          >
            Go to the home page
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
