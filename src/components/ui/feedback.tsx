"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type { ReactNode } from "react";

import {
  HugeiconsBadgeAlertIcon,
  HugeiconsCircleCheckIcon,
  HugeiconsXIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

import { IconButton } from "./button";

/* ── Alert ──────────────────────────────────────────────────────────── */

type AlertTone = "info" | "success" | "warning" | "danger";

/** "i" in a circle. icons-animated has no info icon, so it's drawn here (0009). */
function InfoMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16.5v-5M12 8h.01" strokeWidth="2" />
    </svg>
  );
}

const toneIcon: Record<AlertTone, ReactNode> = {
  info: <InfoMark />,
  success: <HugeiconsCircleCheckIcon />,
  warning: <HugeiconsBadgeAlertIcon />,
  danger: <HugeiconsBadgeAlertIcon />,
};

const toneClasses: Record<AlertTone, string> = {
  info: "text-violet",
  success: "text-success",
  warning: "text-paper-ink bg-marigold rounded-full p-0.5 -m-0.5",
  danger: "text-danger",
};

type AlertProps = {
  tone?: AlertTone;
  title: ReactNode;
  children?: ReactNode;
  /** A quiet Button or TextLink that fixes the problem. */
  action?: ReactNode;
  /** Shows a close button with this label, e.g. "Dismiss". */
  dismissLabel?: string;
  onDismiss?: () => void;
  className?: string;
};

/**
 * Inline message, placed where the problem is (0008: feedback inline, not a
 * toast). Danger is announced at once (role="alert"); the others politely.
 * Tone shows as an icon and the title's words, never as a coloured edge.
 */
export function Alert({
  tone = "info",
  title,
  children,
  action,
  dismissLabel,
  onDismiss,
  className,
}: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-card bg-card p-4 shadow-[inset_0_0_0_1px_var(--line)]",
        tone === "danger" && "shadow-[inset_0_0_0_1px_var(--danger)]",
        className,
      )}
    >
      <span className={cn("mt-0.5 flex shrink-0", toneClasses[tone])}>
        {toneIcon[tone]}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold text-ink">{title}</p>
        {children ? (
          <div className="text-sm text-ink-muted">{children}</div>
        ) : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      {dismissLabel && onDismiss ? (
        <IconButton
          label={dismissLabel}
          icon={<HugeiconsXIcon />}
          size="sm"
          tooltip={false}
          onClick={onDismiss}
          className="-me-2 -mt-2"
        />
      ) : null}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────── */

/**
 * Placeholder in the shape of the content that's coming, so nothing jumps
 * when it lands (CLS). A soft pulse; still under reduced motion.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("jb-skeleton block h-4 rounded-mark bg-line", className)}
    />
  );
}

/* ── Progress ───────────────────────────────────────────────────────── */

type ProgressProps = {
  /** 0–max. `null` means unknown: the bar shows a moving segment. */
  value: number | null;
  max?: number;
  label: ReactNode;
  /** Shown at the right of the label, e.g. "82% match". Omit to hide. */
  valueText?: ReactNode;
  className?: string;
};

/**
 * A bar for a known amount: the match score, a profile's completeness.
 * Fills with the standard curve when the value changes.
 */
export function Progress({
  value,
  max = 100,
  label,
  valueText,
  className,
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      value={value}
      max={max}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-baseline justify-between gap-4 text-base">
        <ProgressPrimitive.Label className="font-semibold text-ink">
          {label}
        </ProgressPrimitive.Label>
        {valueText ? (
          <span className="text-ink-muted tabular-nums">{valueText}</span>
        ) : null}
      </div>
      <ProgressPrimitive.Track className="h-2 overflow-hidden rounded-full bg-line">
        <ProgressPrimitive.Indicator className="block h-full rounded-full bg-violet transition-[width] duration-(--dur-slow) ease-standard data-indeterminate:w-1/3 data-indeterminate:animate-pulse" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

/* ── Avatar ─────────────────────────────────────────────────────────── */

type AvatarProps = {
  /** The person's name: used for the initials and the accessible name. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toLocaleUpperCase();
}

const avatarSize = {
  sm: "size-8 text-xs",
  md: "size-10 text-base",
  lg: "size-14 text-lg",
};

/**
 * A photo, or initials on tint while it loads or when it fails. The fallback
 * waits 200 ms so a cached photo doesn't flash initials first.
 */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-tint font-bold text-violet select-none",
        avatarSize[size],
        className,
      )}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback delay={src ? 200 : 0} aria-label={name}>
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
