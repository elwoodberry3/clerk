import { z } from "zod";

/** MCL 15.234 limits. */
export const MAX_FRINGE_PERCENT = 50;
export const MAX_COPY_COST_PER_SHEET = 0.1;
export const DEPOSIT_THRESHOLD = 50;
export const LABOR_INCREMENT_MINUTES = 15;

export const feeInputSchema = z.object({
  /** Hourly wage of the lowest-paid employee capable of the task (MCL 15.234(3)). */
  hourlyWage: z.number().positive().max(500),
  /** Fringe benefit add-on as a percentage of labor; statute caps at 50. */
  fringePercent: z.number().min(0).max(MAX_FRINGE_PERCENT),
  /** Minutes to search, locate, and examine. Only chargeable when `unreasonablyHighCost`. */
  searchMinutes: z.number().int().min(0).default(0),
  /** Minutes to separate and delete exempt information. Only chargeable when `unreasonablyHighCost`. */
  separationMinutes: z.number().int().min(0).default(0),
  /** Minutes to duplicate or publish (including digital transfer). */
  duplicationMinutes: z.number().int().min(0).default(0),
  duplicationIncrementMinutes: z.number().int().positive().default(LABOR_INCREMENT_MINUTES),
  paperSheets: z.number().int().min(0).default(0),
  copyCostPerSheet: z.number().min(0).max(MAX_COPY_COST_PER_SHEET).default(MAX_COPY_COST_PER_SHEET),
  nonpaperMediaCost: z.number().min(0).default(0),
  mailingCost: z.number().min(0).default(0),
  /**
   * Search/examination and separation labor may only be charged if failing to charge would
   * cause unreasonably high costs, and the township must identify the nature of those costs.
   */
  unreasonablyHighCost: z.boolean().default(false),
});

export type FeeInput = z.input<typeof feeInputSchema>;

export interface FeeLine {
  code: "a" | "b" | "c" | "d" | "e" | "f" | "fringe";
  label: string;
  detail: string;
  amount: number;
}

export interface FeeEstimate {
  lines: FeeLine[];
  total: number;
  depositAllowed: boolean;
  maxDeposit: number;
}

const cents = (n: number) => Math.round(n * 100) / 100;
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** Billable hours in whole increments, partial increments rounded down (MCL 15.234(3)). */
export function billableHours(minutes: number, incrementMinutes: number): number {
  return (Math.floor(minutes / incrementMinutes) * incrementMinutes) / 60;
}

/**
 * Itemized FOIA fee estimate under MCL 15.234. This is a draft for the FOIA coordinator;
 * it never leaves the township without a human approving it.
 */
export function estimateFoiaFee(raw: FeeInput): FeeEstimate {
  const input = feeInputSchema.parse(raw);
  const lines: FeeLine[] = [];
  let labor = 0;

  const laborLine = (
    code: "a" | "b" | "e",
    label: string,
    minutes: number,
    increment: number,
  ): void => {
    const hours = billableHours(minutes, increment);
    if (hours === 0) return;
    const amount = cents(hours * input.hourlyWage);
    labor += amount;
    lines.push({
      code,
      label,
      detail: `${hours.toFixed(2)} hrs × ${usd(input.hourlyWage)}/hr`,
      amount,
    });
  };

  if (input.unreasonablyHighCost) {
    laborLine("a", "Search, locate, and examine", input.searchMinutes, LABOR_INCREMENT_MINUTES);
    laborLine(
      "b",
      "Separate and delete exempt information",
      input.separationMinutes,
      LABOR_INCREMENT_MINUTES,
    );
  }
  if (input.nonpaperMediaCost > 0) {
    lines.push({
      code: "c",
      label: "Nonpaper physical media",
      detail: "Actual cost",
      amount: cents(input.nonpaperMediaCost),
    });
  }
  if (input.paperSheets > 0) {
    lines.push({
      code: "d",
      label: "Paper copies",
      detail: `${input.paperSheets} sheets × ${usd(input.copyCostPerSheet)}`,
      amount: cents(input.paperSheets * input.copyCostPerSheet),
    });
  }
  laborLine(
    "e",
    "Duplication or publication labor",
    input.duplicationMinutes,
    input.duplicationIncrementMinutes,
  );
  if (input.mailingCost > 0) {
    lines.push({
      code: "f",
      label: "Mailing",
      detail: "Least expensive reasonable method",
      amount: cents(input.mailingCost),
    });
  }
  if (labor > 0 && input.fringePercent > 0) {
    lines.push({
      code: "fringe",
      label: "Fringe benefits",
      detail: `${input.fringePercent}% of labor (statutory cap 50%)`,
      amount: cents(labor * (input.fringePercent / 100)),
    });
  }

  const total = cents(lines.reduce((sum, line) => sum + line.amount, 0));
  const depositAllowed = total > DEPOSIT_THRESHOLD;
  return { lines, total, depositAllowed, maxDeposit: depositAllowed ? cents(total / 2) : 0 };
}
