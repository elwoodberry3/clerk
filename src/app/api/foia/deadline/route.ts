import { NextResponse } from "next/server";
import { z } from "zod";
import { civilDate, isCivilDate } from "@/lib/dates/civil-date";
import { computeFoiaDeadlines, MI_CITATIONS, MICHIGAN_RULES_PACK } from "@/lib/rules/michigan";

const dateString = z.string().refine(isCivilDate, "Expected a date in YYYY-MM-DD format");

const bodySchema = z
  .object({
    submittedOn: dateString,
    channel: z.enum(["email", "fax", "web-form", "in-person", "mail"]),
    discoveredInSpamOn: dateString.optional(),
  })
  .strict();

/**
 * POST /api/foia/deadline
 * Computes Michigan FOIA receipt and response deadlines. Stateless; stores nothing.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const result = computeFoiaDeadlines({
      submittedOn: civilDate(parsed.data.submittedOn),
      channel: parsed.data.channel,
      discoveredInSpamOn: parsed.data.discoveredInSpamOn
        ? civilDate(parsed.data.discoveredInSpamOn)
        : undefined,
    });
    return NextResponse.json({
      ...result,
      rulesPack: { state: MICHIGAN_RULES_PACK.state, version: MICHIGAN_RULES_PACK.version },
      citations: [MI_CITATIONS.foiaReceipt, MI_CITATIONS.foiaResponse, MI_CITATIONS.foiaExtension],
    });
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
