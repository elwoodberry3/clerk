import { cooperCharterTownship } from "@/lib/tenants/data/cooper-charter-township";
import { tenantSchema, type Tenant } from "@/lib/tenants/schema";

/**
 * All configured townships. Each entry is validated at module load so a malformed config
 * fails the build (and CI), never a prospect's demo.
 */
const TENANTS: readonly Tenant[] = [cooperCharterTownship].map((t) => tenantSchema.parse(t));

const BY_SLUG = new Map(TENANTS.map((t) => [t.slug, t]));

export function getTenant(slug: string): Tenant | undefined {
  return BY_SLUG.get(slug);
}

export function allTenantSlugs(): string[] {
  return TENANTS.map((t) => t.slug);
}

export function tenantClerk(tenant: Tenant) {
  return tenant.board.find((m) => m.role === "Clerk");
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}
