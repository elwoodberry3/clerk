import { NextResponse } from "next/server";
import { MICHIGAN_RULES_PACK } from "@/lib/rules/michigan";
import { allTenantSlugs } from "@/lib/tenants/registry";

/** GET /api/health: liveness plus the deployed rules-pack version, for uptime monitors. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    rulesPack: {
      state: MICHIGAN_RULES_PACK.state,
      version: MICHIGAN_RULES_PACK.version,
      attorneyReviewed: MICHIGAN_RULES_PACK.attorneyReviewed,
    },
    tenants: allTenantSlugs().length,
  });
}
