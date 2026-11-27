"use client";

import { type ReactNode, type Ref } from "react";

import { Button } from "@/components/ui/button";
import { ToneMark } from "@/components/ui/feedback";

/**
 * One AI proposal (decision 0049): her text struck through, the new text
 * highlighted, a one-line reason, and Accept, Edit, Reject. New details are
 * marked in the text and block Accept until she edits them. Built for
 * "Suggest a rewrite" (spec 29); import, tailoring and translation reuse it.
 */
export function ProposalCard({
  original,
  proposed,
  reason,
  details,
  labels,
  onAccept,
  onEdit,
  onReject,
  ref,
}: {
  original: string;
  proposed: string;
  reason: string;
  /** Numbers, names and tools not in the CV (from `newDetails`). */
  details: string[];
  labels: {
    title: string;
    was: string;
    now: string;
    accept: string;
    edit: string;
    reject: string;
    newDetails: (list: string) => string;
  };
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
  ref?: Ref<HTMLDivElement>;
}) {
  const blocked = details.length > 0;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={labels.title}
      className="flex flex-col gap-3 rounded-card bg-well p-3 shadow-[inset_0_0_0_1px_var(--line)] focus-visible:[outline:var(--focus-ring)] focus-visible:outline-offset-2"
    >
      <div className="flex flex-col gap-1.5 text-base">
        <p className="text-ink-muted">
          <span className="sr-only">{labels.was} </span>
          <del className="whitespace-pre-line decoration-1">{original}</del>
        </p>
        <p className="text-ink">
          <span className="sr-only">{labels.now} </span>
          <ins className="rounded-control-sm bg-tint box-decoration-clone whitespace-pre-line no-underline">
            {highlight(proposed, details)}
          </ins>
        </p>
      </div>
      <p className="text-sm text-ink-muted">{reason}</p>
      {blocked ? (
        <p className="flex items-start gap-[0.5em] text-sm text-ink">
          <span className="flex h-lh shrink-0 items-center">
            <ToneMark tone="warning" className="size-[1.125em]" />
          </span>
          <span className="min-w-0">
            {labels.newDetails(details.join(", "))}
          </span>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={blocked}
          onClick={onAccept}
        >
          {labels.accept}
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          {labels.edit}
        </Button>
        <Button variant="quiet" size="sm" onClick={onReject}>
          {labels.reject}
        </Button>
      </div>
    </div>
  );
}

/** The proposal with each new detail marked. */
function highlight(text: string, details: string[]): ReactNode {
  if (details.length === 0) return text;
  const escaped = details
    .map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "u"));
  return parts.map((part, i) =>
    details.includes(part) ? (
      <mark key={i} className="rounded-control-sm bg-marigold text-paper-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
