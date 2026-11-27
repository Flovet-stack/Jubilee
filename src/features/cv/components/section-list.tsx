"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { Reorder, useDragControls } from "motion/react";
import { type ReactNode, useRef, useState } from "react";

import {
  GripIcon,
  HugeiconsChevronRightIcon,
  HugeiconsEyeIcon,
  HugeiconsEyeOffIcon,
  HugeiconsTrashIcon,
} from "@/components/icons";
import { IconButton } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { cn } from "@/lib/utils";

/**
 * The editor's section list (0039): flat sections split by a border, each
 * with a header (collapse, title, add, More) and a body that holds the
 * entries in one bordered box, rows split by borders (0043).
 */

/** Hover-only on a mouse, always visible on touch (0024 §2). */
const onHover =
  "pointer-fine:opacity-0 pointer-fine:group-hover/row:opacity-100 pointer-fine:group-focus-within/row:opacity-100";

export function SectionBlock({
  title,
  marker,
  hiddenLabel,
  actions,
  children,
}: {
  title: string;
  /** The finding marker (0031 §3), if any. */
  marker?: ReactNode;
  /** Set when the section is hidden from the CV. */
  hiddenLabel?: string;
  /** The add and More buttons. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Collapsible.Root
      defaultOpen
      render={<li />}
      className="flex flex-col border-b border-line"
    >
      <div className="group/header flex items-center gap-1 bg-card py-0.5 ps-2 pe-3">
        <Collapsible.Trigger
          className={cn(
            "group/trigger jb-type flex min-h-11 min-w-0 flex-1 items-center rounded-control text-start text-md font-semibold pointer-fine:min-h-9",
            hiddenLabel ? "text-ink-muted" : "text-ink",
          )}
        >
          <span className="jb-type-icon text-ink-muted transition-transform duration-(--dur-base) ease-enter group-data-panel-open/trigger:rotate-90 motion-reduce:transition-none rtl:-scale-x-100">
            <HugeiconsChevronRightIcon />
          </span>
          <span className="min-w-0 truncate decoration-1 underline-offset-4 group-hover/header:underline">
            {title}
          </span>
          {marker}
          {hiddenLabel ? (
            <span className="jb-type-icon text-ink-muted" title={hiddenLabel}>
              <HugeiconsEyeOffIcon aria-hidden="true" />
              <span className="sr-only">{hiddenLabel}</span>
            </span>
          ) : null}
        </Collapsible.Trigger>
        {actions}
      </div>
      <Collapsible.Panel
        className={cn(
          "h-(--collapsible-panel-height) overflow-hidden bg-card",
          "transition-[height] duration-(--dur-base) ease-enter motion-reduce:transition-none",
          "data-ending-style:h-0 data-ending-style:duration-(--dur-exit) data-starting-style:h-0",
        )}
      >
        <div className="flex flex-col gap-1.5 border-t border-line px-3 py-2 shadow-[inset_0_1px_3px_rgb(0_0_0/0.06)]">
          {children}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/** On header hover, the header's buttons take the raised surface (0043). */
export const headerAction =
  "group-hover/header:bg-control group-hover/header:shadow-raised";

/** One bordered box per section; rows split by borders (0043). */
const entryBox =
  "flex flex-col overflow-hidden rounded-card border border-line bg-card";

/** A row: a very slight tint on hover (half of --wash-hover). */
const entryRow =
  "flex min-w-0 items-center border-b border-line px-1 last:border-b-0 hover-fine:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]";

/** One body card that opens a form: Contact and Summary. */
export function SummaryCard({
  onOpen,
  children,
}: {
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <div className={entryBox}>
      <div className={entryRow}>
        <button
          type="button"
          onClick={onOpen}
          className="jb-type flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 rounded-control text-start text-base text-ink pointer-fine:min-h-9"
        >
          {children}
        </button>
      </div>
    </div>
  );
}

export function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-muted">{children}</p>;
}

export type EntryRow = {
  id: string;
  label: string;
  hidden: boolean;
  findings?: ReactNode;
};

type EntryLabels = {
  move: (entry: string) => string;
  moveUp: string;
  moveDown: string;
  show: (entry: string) => string;
  remove: (entry: string) => string;
};

/** Entries you can drag by the handle, or move from its menu (WCAG 2.5.7). */
export function EntryList<T extends { id: string }>({
  entries,
  rows,
  onReorder,
  onMove,
  onOpen,
  onToggle,
  onRemove,
  labels,
}: {
  entries: T[];
  rows: EntryRow[];
  onReorder: (next: T[]) => void;
  onMove: (index: number, by: -1 | 1) => void;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  labels: EntryLabels;
}) {
  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={entries}
      onReorder={onReorder}
      className={entryBox}
    >
      {entries.map((entry, i) => {
        const row = rows[i];
        if (!row) return null;
        return (
          <EntryCard
            key={entry.id}
            value={entry}
            row={row}
            first={i === 0}
            last={i === entries.length - 1}
            onMove={(by) => onMove(i, by)}
            onOpen={() => onOpen(row.id)}
            onToggle={() => onToggle(row.id)}
            onRemove={() => onRemove(row.id)}
            labels={labels}
          />
        );
      })}
    </Reorder.Group>
  );
}

function EntryCard<T>({
  value,
  row,
  first,
  last,
  onMove,
  onOpen,
  onToggle,
  onRemove,
  labels,
}: {
  value: T;
  row: EntryRow;
  first: boolean;
  last: boolean;
  onMove: (by: -1 | 1) => void;
  onOpen: () => void;
  onToggle: () => void;
  onRemove: () => void;
  labels: EntryLabels;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wasOpen = useRef(false);
  const moved = useRef(false);

  return (
    <Reorder.Item
      as="li"
      value={value}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => {
        moved.current = true;
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={cn(
        entryRow,
        "group/row relative bg-card",
        dragging && "z-10 shadow-(--shadow-float)",
      )}
    >
      <Menu
        open={menuOpen}
        onOpenChange={(next) => {
          // The handle's own click opens it (below), so a drag never opens
          // the menu; Base UI still closes it (Escape, outside, an item).
          if (!next) setMenuOpen(false);
        }}
        trigger={
          <IconButton
            size="sm"
            label={labels.move(row.label)}
            icon={<GripIcon />}
            tooltip={false}
            className={cn(
              // Flat (0043): no fill, ring or press scale; the grip says it all.
              "cursor-grab touch-none active:scale-100 active:cursor-grabbing active:bg-transparent hover-fine:bg-transparent hover-fine:shadow-none",
              !menuOpen && onHover,
            )}
            onPointerDown={(e) => {
              wasOpen.current = menuOpen;
              moved.current = false;
              controls.start(e);
            }}
            onKeyDown={() => {
              wasOpen.current = menuOpen;
              moved.current = false;
            }}
            onClick={() => {
              // A press opens it; a drag, or a press that closed it, doesn't.
              if (!moved.current && !wasOpen.current) setMenuOpen(true);
            }}
          />
        }
        items={[
          {
            label: labels.moveUp,
            onSelect: () => onMove(-1),
            disabled: first,
          },
          {
            label: labels.moveDown,
            onSelect: () => onMove(1),
            disabled: last,
          },
        ]}
      />
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "jb-type flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center rounded-control text-start text-base pointer-fine:min-h-9",
          row.hidden ? "text-ink-muted" : "text-ink",
        )}
      >
        <span className="w-full truncate">{row.label}</span>
        {row.findings}
      </button>
      <IconButton
        size="sm"
        label={labels.show(row.label)}
        aria-pressed={!row.hidden}
        icon={row.hidden ? <HugeiconsEyeOffIcon /> : <HugeiconsEyeIcon />}
        onClick={onToggle}
        className={row.hidden ? undefined : onHover}
      />
      <IconButton
        size="sm"
        label={labels.remove(row.label)}
        icon={<HugeiconsTrashIcon />}
        onClick={onRemove}
        className={onHover}
      />
    </Reorder.Item>
  );
}
