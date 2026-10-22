import { z } from "zod";

/**
 * Public, build-time configuration. Validated once so a bad deploy fails loudly at build,
 * not in front of a prospect. The only server-only secret, DEMO_ACCESS_KEY, is read in src/proxy.ts.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("https://clerk.adbyrd.com"),
  NEXT_PUBLIC_SALES_EMAIL: z.email().default("support@adbyrd.com"),
  NEXT_PUBLIC_SALES_PHONE: z.string().min(7).default("+1 (888) 712-1694"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_SALES_EMAIL: process.env.NEXT_PUBLIC_SALES_EMAIL || undefined,
  NEXT_PUBLIC_SALES_PHONE: process.env.NEXT_PUBLIC_SALES_PHONE || undefined,
});

export const SALES_PHONE_HREF = `tel:${publicEnv.NEXT_PUBLIC_SALES_PHONE.replace(/[^\d+]/g, "")}`;
export const SALES_EMAIL_HREF = `mailto:${publicEnv.NEXT_PUBLIC_SALES_EMAIL}`;
