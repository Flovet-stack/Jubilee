"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: ReactNode;
  /** e.g. a count; shown after the label in muted ink. */
  meta?: ReactNode;
  disabled?: boolean;
  panel: ReactNode;
  /** e.g. a background and padding for a flush pane (0042). */
  panelClassName?: string;
};

type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Names the tab list for screen readers, e.g. "Application details". */
  label: string;
  className?: string;
  /** e.g. a surface and inline padding when the tabs sit flush (0042). */
  listClassName?: string;
};

/**
 * Tabs (APG tabs; 0008 §1a "easy" tier). The underline slides to the active
 * tab in 200 ms with the standard curve; it's a transition, so fast clicking
 * retargets smoothly. The list scrolls sideways on narrow screens rather than
 * wrapping. Panels switch without animation.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  className,
  listClassName,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(next) => onValueChange?.(next as string)}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      <TabsPrimitive.List
        aria-label={label}
        className={cn(
          "relative z-0 flex [scrollbar-width:none] gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--line)]",
          listClassName,
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              "jb-type flex min-h-11 shrink-0 cursor-pointer items-center rounded-t-control text-base font-semibold whitespace-nowrap text-ink-muted outline-none select-none",
              "transition-colors duration-(--dur-exit) hover-fine:text-ink hover-fine:duration-(--dur-fast)",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet",
              "data-active:text-ink",
              "data-disabled:cursor-not-allowed data-disabled:text-ink-subtle",
            )}
          >
            {item.label}
            {item.meta != null ? (
              <span className="text-sm font-medium text-ink-subtle tabular-nums">
                {item.meta}
              </span>
            ) : null}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator
          renderBeforeHydration
          className="absolute bottom-0 left-0 -z-1 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full bg-violet transition-[translate,width] duration-(--dur-base) ease-standard motion-reduce:transition-none"
        />
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Panel
          key={item.value}
          value={item.value}
          className={cn(
            "min-w-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-4",
            item.panelClassName,
          )}
        >
          {item.panel}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  );
}
