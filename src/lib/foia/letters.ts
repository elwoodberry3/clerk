import { formatLong, type CivilDate } from "@/lib/dates/civil-date";
import type { FeeEstimate } from "@/lib/rules/michigan/fees";
import type { Tenant } from "@/lib/tenants/schema";

export type LetterKind = "grant" | "extension" | "partial-denial";

export interface LetterContext {
  tenant: Tenant;
  requestNumber: string;
  requesterName: string;
  receivedOn: CivilDate;
  responseDueOn: CivilDate;
  extendedDueOn: CivilDate;
  recordsDescription: string;
  fee: FeeEstimate;
  /** For extensions: why more time is needed (MCL 15.235(7) requires reasons). */
  extensionReason?: string;
  /** For partial denials: each exemption relied on, with a plain-English basis. */
  exemptions?: { cite: string; basis: string; withheld: string }[];
  signerName?: string;
}

export interface DraftLetter {
  kind: LetterKind;
  subject: string;
  paragraphs: string[];
  /** Statutory elements the draft includes; asserted in tests and shown as a checklist. */
  includes: string[];
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function feeParagraph(fee: FeeEstimate): string {
  if (fee.total === 0) return "There is no charge for these records.";
  const lines = fee.lines.map((l) => `${l.label} (${l.detail}): ${usd(l.amount)}`).join("; ");
  const deposit = fee.depositAllowed
    ? ` Because the estimate exceeds $50.00, a good-faith deposit of ${usd(fee.maxDeposit)} (one-half) is requested before processing.`
    : "";
  return `The estimated fee is ${usd(fee.total)}, itemized as follows: ${lines}.${deposit} A detailed itemization is enclosed.`;
}

function signature(ctx: LetterContext): string {
  const signer = ctx.signerName ?? "[FOIA Coordinator]";
  return `${signer}, ${ctx.tenant.foia.coordinatorRole} and FOIA Coordinator, ${ctx.tenant.name}`;
}

function appealRights(tenant: Tenant): string {
  return (
    `Under MCL 15.240, you may submit a written appeal to the head of the public body as designated in ${tenant.name}'s ` +
    `FOIA Procedures and Guidelines, identifying it as an appeal of a denial, or you may commence a civil action in the ` +
    `circuit court within 180 days after this final determination. If you prevail in court, you may be entitled to ` +
    `reasonable attorneys' fees, costs, and disbursements, and possibly damages, as provided in MCL 15.240. You may ` +
    `also appeal any fee you believe exceeds what the Act allows under MCL 15.240a.`
  );
}

export function draftLetter(kind: LetterKind, ctx: LetterContext): DraftLetter {
  const header = `Re: Freedom of Information Act request ${ctx.requestNumber}, received ${formatLong(ctx.receivedOn)}`;
  const opening = `Dear ${ctx.requesterName},`;

  if (kind === "grant") {
    return {
      kind,
      subject: `${header}: granted`,
      paragraphs: [
        opening,
        `${ctx.tenant.name} grants your request for ${ctx.recordsDescription}.`,
        feeParagraph(ctx.fee),
        `Records will be provided electronically unless you request paper copies.`,
        signature(ctx),
      ],
      includes: ["Grant determination", "Itemized fee or no-charge statement"],
    };
  }

  if (kind === "extension") {
    const reason =
      ctx.extensionReason ??
      "the request covers a large volume of records that must be located and reviewed";
    return {
      kind,
      subject: `${header}: notice of extension`,
      paragraphs: [
        opening,
        `This notice extends the time for ${ctx.tenant.name} to respond to your request for ${ctx.recordsDescription}, as permitted by MCL 15.235(2)(d).`,
        `The extension is needed because ${reason}.`,
        `The township will grant, deny, or grant in part and deny in part your request no later than ${formatLong(ctx.extendedDueOn)}.`,
        signature(ctx),
      ],
      includes: ["Reason for extension", "Date of final response (not more than 10 business days)"],
    };
  }

  const exemptions = ctx.exemptions ?? [];
  return {
    kind,
    subject: `${header}: granted in part, denied in part`,
    paragraphs: [
      opening,
      `${ctx.tenant.name} grants in part and denies in part your request for ${ctx.recordsDescription}.`,
      ...exemptions.map(
        (e) =>
          `Withheld under ${e.cite}: ${e.withheld}. Basis: ${e.basis}. Nonexempt portions have been separated and are being provided.`,
      ),
      `To the extent any record you described does not exist under the name you gave or another name reasonably known to the township, this letter serves as certification that it does not exist.`,
      feeParagraph(ctx.fee),
      appealRights(ctx.tenant),
      signature(ctx),
    ],
    includes: [
      "Basis for each exemption (MCL 15.235(5)(a))",
      "Certificate of non-existence where applicable (5)(b)",
      "Description of separated information (5)(c)",
      "Appeal and court rights (5)(d)",
      "Attorneys' fees and damages notice (5)(e)",
      "Signed by the FOIA Coordinator (MCL 15.235(6))",
    ],
  };
}
