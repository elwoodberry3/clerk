import { z } from "zod";

/**
 * Township configuration. One file per township in src/lib/tenants/data/.
 * Every township-specific fact the product uses lives here, so onboarding a township is a
 * config change plus review, never a code change. See docs/onboarding-a-township.md.
 */

const url = z.url({ protocol: /^https$/ });

/** Where a fact came from and whether a human has confirmed it with the township. */
export const provenanceSchema = z.object({
  sourceUrl: url,
  /** "public-site": scraped from the township website; "confirmed": confirmed by township staff. */
  status: z.enum(["public-site", "confirmed", "placeholder"]),
});

export const boardMemberSchema = z.object({
  name: z.string().min(2),
  role: z.enum(["Supervisor", "Clerk", "Treasurer", "Trustee", "Deputy Clerk", "Manager"]),
});

export const faqSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  topic: z.string(),
  /** Sample phrasing a resident might use; shown as quick-pick buttons in the demo. */
  sampleQuestion: z.string(),
  /** Lowercase keywords used by the deterministic demo matcher. */
  keywords: z.array(z.string().min(2)).min(1),
  answer: z.string().min(20),
  /** What the agent does after answering: text a link, transfer, or take a message. */
  followUp: z.enum(["text-link", "transfer", "take-message", "none"]),
  provenance: provenanceSchema,
});

export const tenantSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  shortName: z.string(),
  county: z.string(),
  state: z.literal("MI"),
  timeZone: z.literal("America/Detroit"),
  website: url,
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.literal("MI"),
    zip: z.string().regex(/^\d{5}$/),
  }),
  board: z.array(boardMemberSchema).min(3),
  meetings: z.object({
    body: z.string(),
    /** 1–5: which week of the month. */
    weekOfMonth: z.number().int().min(1).max(5),
    /** 0 = Sunday … 6 = Saturday */
    weekday: z.number().int().min(0).max(6),
    time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/),
    location: z.string(),
    provenance: provenanceSchema,
  }),
  foia: z.object({
    coordinatorRole: z.string(),
    intakeEmail: z.email().optional(),
    policyUrl: url,
    /** Fee inputs are placeholders until confirmed in discovery. */
    fees: z.object({
      lowestPaidCapableHourlyWage: z.number().positive(),
      fringePercent: z.number().min(0).max(50),
      copyCostPerSheet: z.number().min(0).max(0.1),
      provenance: provenanceSchema,
    }),
  }),
  minutes: z.object({
    heading: z.string(),
    certificationLine: z.string(),
    provenance: provenanceSchema,
  }),
  residentLine: z.object({
    greeting: z.string(),
    faqs: z.array(faqSchema).min(3),
  }),
  /** Why this township is a strong fit; shown only in internal notes, never to the prospect. */
  salesNotes: z.array(z.string()),
});

export type Tenant = z.infer<typeof tenantSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type BoardMember = z.infer<typeof boardMemberSchema>;
