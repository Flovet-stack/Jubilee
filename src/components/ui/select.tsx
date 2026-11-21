"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import type { ReactNode } from "react";

import {
  HugeiconsCheckIcon,
  HugeiconsChevronDownIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

import { controlClasses } from "./field";

export type SelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  items: SelectItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Shown when nothing is chosen, e.g. "Choose a country". */
  placeholder: string;
  /** Shown in the list when `items` is empty. */
  emptyText?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  /** Pass an id when a <Field> label should point at this trigger. */
  id?: string;
  "aria-label"?: string;
  children?: ReactNode;
};

/**
 * One choice from a longer list (7+ items, or where space is tight). Put it
 * inside <Field> for its label, hint and error. The list grows from the
 * trigger (origin-aware, scale 0.96 → 1, 200 ms in, 150 ms out); keyboard
 * highlight moves without animation (0007 §6). Long labels wrap in the list
 * and truncate in the trigger.
 */
export function Select({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  emptyText,
  name,
  disabled,
  readOnly,
  required,
  className,
  id,
  ...aria
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as string | null)}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={aria["aria-label"]}
        className={cn(
          controlClasses,
          "group/trigger flex h-(--control-h) cursor-pointer items-center justify-between gap-2 ps-3 pe-2 text-start",
          "data-popup-open:shadow-[inset_0_0_0_1px_var(--violet)] data-readonly:cursor-default",
          className,
        )}
      >
        <SelectPrimitive.Value
          placeholder={placeholder}
          className="min-w-0 truncate data-placeholder:text-ink-subtle"
        />
        <SelectPrimitive.Icon className="flex text-ink-muted transition-[rotate] duration-(--dur-base) ease-standard group-data-popup-open/trigger:rotate-180 motion-reduce:transition-none">
          <HugeiconsChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={6}
          collisionPadding={16}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <SelectPrimitive.Popup
            className={cn(
              "max-w-[min(var(--available-width),28rem)] min-w-(--anchor-width) overflow-hidden rounded-control bg-card text-ink outline-none",
              "shadow-[0_0_0_1px_var(--line),var(--shadow-float)]",
              "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
            )}
          >
            <SelectPrimitive.List className="max-h-[min(var(--available-height),20rem)] scroll-py-1 overflow-y-auto overscroll-contain p-1">
              {items.length === 0 && emptyText ? (
                <div className="px-3 py-3 text-sm text-ink-muted">
                  {emptyText}
                </div>
              ) : null}
              {items.map((item) => (
                <SelectPrimitive.Item
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn(
                    "grid min-h-11 cursor-pointer grid-cols-[1fr_20px] items-center gap-3 rounded-mark px-3 py-2 text-base outline-none select-none",
                    "data-highlighted:bg-wash-hover data-selected:font-semibold",
                    "data-disabled:cursor-not-allowed data-disabled:text-ink-subtle",
                  )}
                >
                  <SelectPrimitive.ItemText className="min-w-0">
                    {item.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="flex text-violet">
                    <HugeiconsCheckIcon />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
