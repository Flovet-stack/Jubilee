import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Badge: a small pill for real state only (no-ai-slop: no NEW/BETA/AI).
 * Each tone has one meaning. Text never relies on colour alone: tones that
 * mean something come with an icon or a word that says it.
 */
const badgeVariants = cva(
  "jb-type jb-type-badge inline-flex max-w-full min-w-0 items-center rounded-full text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-card text-ink-muted shadow-[inset_0_0_0_1px_var(--line)]",
        violet: "bg-tint text-violet",
        success:
          "bg-[color-mix(in_oklab,var(--success)_12%,var(--card))] text-success",
        danger:
          "bg-[color-mix(in_oklab,var(--danger)_12%,var(--card))] text-danger",
        marigold: "bg-marigold text-paper-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  icon?: ReactNode;
  /** Full text for the tooltip when the label may truncate. */
  title?: string;
  className?: string;
};

export function Badge({ tone, icon, title, className, children }: BadgeProps) {
  return (
    <span title={title} className={cn(badgeVariants({ tone }), className)}>
      {icon ? <span className="jb-type-icon">{icon}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export type Stage = "saved" | "applied" | "interview" | "offer" | "rejected";

const stageClasses: Record<Stage, string> = {
  saved:
    "bg-[color-mix(in_oklab,var(--stage-saved)_10%,var(--card))] text-stage-saved",
  applied:
    "bg-[color-mix(in_oklab,var(--stage-applied)_10%,var(--card))] text-stage-applied",
  interview:
    "bg-[color-mix(in_oklab,var(--stage-interview)_10%,var(--card))] text-stage-interview",
  offer: "bg-marigold text-paper-ink",
  rejected:
    "bg-[color-mix(in_oklab,var(--stage-rejected)_10%,var(--card))] text-stage-rejected",
};

/** Small static marks: a stage is never colour alone (0007). */
function StageMark({ stage }: { stage: Stage }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    fill: "none",
    "aria-hidden": true,
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (stage) {
    case "saved":
      return (
        <svg {...common}>
          <path d="M4 2.5h6v9L7 9.5l-3 2v-9Z" />
        </svg>
      );
    case "applied":
      return (
        <svg {...common}>
          <path d="M2 7.2 12 2.5 9.2 12 7.2 8.3 2 7.2Z" />
        </svg>
      );
    case "interview":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="10" height="9" rx="1.5" />
          <path d="M2 6h10M5 1.8v2.4M9 1.8v2.4" />
        </svg>
      );
    case "offer":
      return (
        <svg {...common}>
          <path d="M7 1.8 8.5 5l3.5.4-2.6 2.4.7 3.5L7 9.6l-3.1 1.7.7-3.5L2 5.4 5.5 5 7 1.8Z" />
        </svg>
      );
    case "rejected":
      return (
        <svg {...common}>
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
        </svg>
      );
  }
}

type StageBadgeProps = {
  stage: Stage;
  /** The stage name from the message files, e.g. "Interview". */
  label: string;
  className?: string;
};

/**
 * Tracker stage (0007): fixed colour + mark + word. Rejected is warm grey,
 * never red; the offer is the one marigold pill.
 */
export function StageBadge({ stage, label, className }: StageBadgeProps) {
  return (
    <span
      data-stage={stage}
      className={cn(
        "jb-type jb-type-badge inline-flex max-w-full items-center rounded-full text-xs font-semibold whitespace-nowrap",
        stageClasses[stage],
        className,
      )}
    >
      <StageMark stage={stage} />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}
