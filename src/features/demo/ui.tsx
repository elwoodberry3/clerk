import type { ReactNode } from "react";
import type { DeadlineUrgency } from "@/lib/rules/michigan/foia";

const URGENCY: Record<
  DeadlineUrgency | "responded",
  { label: (n: number) => string; cls: string }
> = {
  overdue: { label: () => "Past due", cls: "bg-red-50 text-red-700 ring-red-700/20" },
  "due-today": { label: () => "Due today", cls: "bg-amber-50 text-amber-700 ring-amber-700/25" },
  "due-soon": {
    label: (n) => `${n} business ${n === 1 ? "day" : "days"} left`,
    cls: "bg-amber-50 text-amber-700 ring-amber-700/25",
  },
  "on-track": {
    label: (n) => `${n} business days left`,
    cls: "bg-ocean-50 text-ocean-700 ring-ocean-600/20",
  },
  responded: {
    label: () => "Answered on time",
    cls: "bg-green-50 text-green-700 ring-green-600/25",
  },
};

export function UrgencyBadge({
  urgency,
  daysLeft,
}: {
  urgency: DeadlineUrgency | "responded";
  daysLeft: number;
}) {
  const u = URGENCY[urgency];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${u.cls}`}
    >
      {u.label(daysLeft)}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-rule bg-white ${className ?? ""}`}>
      {title ? (
        <header className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-ocean-700 underline decoration-ocean-600/40 underline-offset-2 hover:decoration-ocean-700"
    >
      {children}
    </a>
  );
}
