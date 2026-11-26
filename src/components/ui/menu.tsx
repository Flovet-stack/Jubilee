"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MenuEntry =
  | {
      type?: "item";
      label: ReactNode;
      icon?: ReactNode;
      onSelect: () => void;
      disabled?: boolean;
      /** Danger: destructive; it still opens its own confirmation or undo. */
      tone?: "default" | "danger";
      /** Keeps the menu open after a press, for an item that shows progress. */
      keepOpen?: boolean;
    }
  | { type: "separator" };

type MenuProps = {
  /** The Button that opens it. Its label says what's inside ("More", "Move to"). */
  trigger: ReactElement;
  items: MenuEntry[];
  align?: "start" | "end";
  /** Controlled open state, for a menu that closes when its work is done. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Menu button (APG menu button; 0008 §4 "More"). Grows from its trigger in
 * 200 ms and leaves in 150 ms. Arrow keys move the highlight with no
 * animation; type-ahead works. Items are ≥ 44 px tall.
 */
export function Menu({
  trigger,
  items,
  align = "start",
  open,
  onOpenChange,
}: MenuProps) {
  return (
    <MenuPrimitive.Root
      open={open}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      <MenuPrimitive.Trigger render={trigger} />
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          sideOffset={6}
          align={align}
          collisionPadding={16}
          className="z-50 outline-none"
        >
          <MenuPrimitive.Popup
            className={cn(
              "max-w-[min(var(--available-width),20rem)] min-w-48 rounded-card bg-card p-1 text-ink outline-none",
              "shadow-[0_0_0_1px_var(--line),var(--shadow-float)]",
              "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
            )}
          >
            {items.map((entry, index) =>
              entry.type === "separator" ? (
                <MenuPrimitive.Separator
                  key={`sep-${index}`}
                  className="mx-2 my-1 h-px bg-line"
                />
              ) : (
                <MenuPrimitive.Item
                  key={index}
                  disabled={entry.disabled}
                  closeOnClick={!entry.keepOpen}
                  onClick={entry.onSelect}
                  className={cn(
                    "jb-type flex min-h-11 cursor-pointer items-center rounded-mark text-base outline-none select-none",
                    "data-highlighted:bg-wash-hover",
                    entry.tone === "danger" &&
                      "text-danger data-highlighted:bg-wash-danger",
                    "data-disabled:cursor-not-allowed data-disabled:text-ink-subtle",
                  )}
                >
                  {entry.icon ? (
                    <span className="jb-type-icon text-ink-muted">
                      {entry.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0">{entry.label}</span>
                </MenuPrimitive.Item>
              ),
            )}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
