import { z } from "zod";

/**
 * First-party demo engagement events. These answer the sales question "which screen did the
 * clerk spend time on?" without third-party trackers or personal data. No IP addresses,
 * names, or free text are accepted.
 */
export const demoEventSchema = z.object({
  name: z.enum([
    "demo_opened",
    "demo_tab_viewed",
    "foia_request_opened",
    "foia_letter_approved",
    "resident_question_asked",
    "calculator_used",
  ]),
  tenant: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(80)
    .optional(),
  detail: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(80)
    .optional(),
});

export type DemoEvent = z.infer<typeof demoEventSchema>;
