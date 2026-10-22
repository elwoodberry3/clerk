import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { DemoApp } from "@/features/demo/DemoApp";
import { todayIn } from "@/lib/dates/civil-date";
import { buildDemoScenario } from "@/lib/demo/scenario";
import { publicEnv } from "@/lib/env";
import { getTenant } from "@/lib/tenants/registry";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tenant = getTenant(slug);
  return {
    title: tenant ? `${tenant.name} demo` : "Demo not found",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function DemoPage({ params }: Props) {
  // Render per request so "today" and every deadline are always current in Michigan time.
  await connection();
  const { slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  const scenario = buildDemoScenario(tenant, todayIn(tenant.timeZone));

  return (
    <DemoApp
      tenant={tenant}
      scenario={scenario}
      salesEmail={publicEnv.NEXT_PUBLIC_SALES_EMAIL}
      salesPhone={publicEnv.NEXT_PUBLIC_SALES_PHONE}
    />
  );
}
