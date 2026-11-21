"use client";

import type { ReactNode } from "react";

import {
  HugeiconsCheckIcon,
  HugeiconsUndoIcon,
  HugeiconsXIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

import { Button } from "./button";

/* ── EmptyState ─────────────────────────────────────────────────────── */

type EmptyStateProps = {
  title: ReactNode;
  children?: ReactNode;
  /** One button: the way out of the empty state. */
  action?: ReactNode;
  className?: string;
};

/**
 * Empty states are words and one button until the illustration decision
 * (0005). Says what will appear here and how to get it.
 */
export function EmptyState({
  title,
  children,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-box px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {children ? (
        <div className="max-w-sm text-sm text-ink-muted">{children}</div>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

/* ── UndoLine ───────────────────────────────────────────────────────── */

type UndoLineProps = {
  /** What happened, e.g. "Moved to Interview". */
  message: ReactNode;
  undoLabel: string;
  onUndo: () => void;
  className?: string;
};

/**
 * Short feedback in the place the change happened (0006 §4), with Undo
 * instead of "Are you sure?" for anything reversible. Fades in, 200 ms.
 */
export function UndoLine({
  message,
  undoLabel,
  onUndo,
  className,
}: UndoLineProps) {
  return (
    <p
      role="status"
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-control bg-tint px-3 text-sm text-ink",
        "transition-opacity duration-(--dur-base) ease-enter starting:opacity-0",
        className,
      )}
    >
      <HugeiconsCheckIcon size={18} className="text-success" />
      <span>{message}</span>
      <Button
        variant="quiet"
        size="sm"
        icon={<HugeiconsUndoIcon size={18} />}
        onClick={onUndo}
        className="ms-auto -me-2 text-violet"
      >
        {undoLabel}
      </Button>
    </p>
  );
}

/* ── MarkedChange ───────────────────────────────────────────────────── */

type MarkedChangeProps = {
  /** Text the AI removed (struck through). */
  removed?: ReactNode;
  /** Text the AI added (tint highlight, violet underline). */
  added?: ReactNode;
  /** Why it changed, e.g. "Matches 'logistics' in the job post". */
  reason: ReactNode;
  acceptLabel: string;
  rejectLabel: string;
  onAccept: () => void;
  onReject: () => void;
  /** Once decided, the controls go and the result stays. */
  status?: "pending" | "accepted" | "rejected";
  className?: string;
};

/**
 * An AI edit shown as a marked change, never applied silently (0006 §1b):
 * added text on --tint, underlined in violet; removed text struck through in
 * muted ink; a reason; Accept / Reject per change.
 */
export function MarkedChange({
  removed,
  added,
  reason,
  acceptLabel,
  rejectLabel,
  onAccept,
  onReject,
  status = "pending",
  className,
}: MarkedChangeProps) {
  if (status === "accepted") return <span>{added}</span>;
  if (status === "rejected") return <span>{removed}</span>;
  return (
    <span
      className={cn(
        "flex flex-col gap-2 rounded-control bg-card p-3 shadow-[inset_0_0_0_1px_var(--line)]",
        className,
      )}
    >
      <span className="leading-relaxed">
        {removed ? (
          <del className="text-ink-muted decoration-ink-muted">{removed}</del>
        ) : null}
        {removed && added ? " " : null}
        {added ? (
          <ins className="rounded-paper bg-tint text-ink underline decoration-violet decoration-2 underline-offset-4">
            {added}
          </ins>
        ) : null}
      </span>
      <span className="text-sm text-ink-muted">{reason}</span>
      <span className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={<HugeiconsCheckIcon size={18} />}
          onClick={onAccept}
        >
          {acceptLabel}
        </Button>
        <Button
          size="sm"
          variant="quiet"
          icon={<HugeiconsXIcon size={18} />}
          onClick={onReject}
        >
          {rejectLabel}
        </Button>
      </span>
    </span>
  );
}

/* ── ReviewPanel ────────────────────────────────────────────────────── */

type ReviewRow = { label: ReactNode; value: ReactNode };

type ReviewPanelProps = {
  title: ReactNode;
  /** Exactly what goes out: CV version, letter, email address… */
  rows: ReviewRow[];
  /** The final Button. Its label names the act and target ("Send to …"). */
  action: ReactNode;
  /** A quiet way back, e.g. "Edit letter". */
  secondary?: ReactNode;
  className?: string;
};

/**
 * Final actions (0006 §1b, fully explicit): a summary of what leaves Jubilee
 * and one button naming the act and the target. Never the default focus.
 */
export function ReviewPanel({
  title,
  rows,
  action,
  secondary,
  className,
}: ReviewPanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-box bg-well p-4 shadow-[inset_0_0_0_1px_var(--line)]",
        className,
      )}
    >
      <h2 className="px-1 text-lg font-bold text-ink">{title}</h2>
      <dl className="flex flex-col rounded-box bg-card shadow-[inset_0_0_0_1px_var(--line)]">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-0.5 px-4 py-3 not-first:shadow-[inset_0_1px_0_var(--line)] sm:flex-row sm:gap-4"
          >
            <dt className="shrink-0 text-sm text-ink-muted sm:w-40">
              {row.label}
            </dt>
            <dd className="min-w-0 font-semibold break-words text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {secondary}
        {action}
      </div>
    </section>
  );
}
