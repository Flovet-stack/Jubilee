import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import {
  HugeiconsBookmarkIcon,
  HugeiconsCalendarIcon,
  HugeiconsSendIcon,
  HugeiconsStarIcon,
  HugeiconsXIcon,
} from "@/components/icons";
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

/** Small marks from AnimateIcons (0049): a stage is never colour alone (0007). */
const stageIcon = {
  saved: HugeiconsBookmarkIcon,
  applied: HugeiconsSendIcon,
  interview: HugeiconsCalendarIcon,
  offer: HugeiconsStarIcon,
  rejected: HugeiconsXIcon,
} satisfies Record<Stage, unknown>;

function StageMark({ stage }: { stage: Stage }) {
  const Icon = stageIcon[stage];
  return <Icon size={14} />;
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
