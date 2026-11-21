"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  "className"
> & {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
};

/**
 * Checkbox with its label (the whole row is the target, ≥ 44 px).
 * States: unchecked, checked, indeterminate, hover, focus-visible, pressed,
 * disabled, read-only, invalid. The tick draws in 120 ms; keyboard toggles
 * look the same (a 120 ms state change, not a movement).
 */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "group/check flex min-h-11 cursor-pointer items-start gap-3 py-2.5 has-data-disabled:cursor-not-allowed",
        className,
      )}
    >
      <CheckboxPrimitive.Root
        className={cn(
          "peer relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-mark bg-card text-on-violet shadow-[inset_0_0_0_1.5px_var(--field)]",
          "transition-[background-color,box-shadow,scale] duration-(--dur-fast) ease-standard",
          "group-hover/check:shadow-[inset_0_0_0_1.5px_var(--ink-muted)] active:scale-(--press-scale)",
          "data-checked:bg-violet data-checked:shadow-none data-indeterminate:bg-violet data-indeterminate:shadow-none",
          "data-invalid:shadow-[inset_0_0_0_2px_var(--danger)]",
          "data-disabled:bg-well data-disabled:shadow-[inset_0_0_0_1.5px_var(--line)] data-disabled:data-checked:bg-ink-subtle data-disabled:data-indeterminate:bg-ink-subtle",
          "data-readonly:cursor-default",
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          keepMounted
          className="group/indicator flex data-unchecked:opacity-0"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="text-current"
          >
            {/* Tick: stroke draws in (dasharray) when checked. */}
            <path
              d="M2.5 7.4 5.6 10.2 11.5 3.8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              className="transition-[stroke-dashoffset] duration-(--dur-fast) ease-enter [stroke-dasharray:1] [stroke-dashoffset:1] group-data-checked/indicator:[stroke-dashoffset:0] group-data-indeterminate/indicator:hidden"
            />
            <path
              d="M3 7h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="hidden group-data-indeterminate/indicator:block"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base text-ink peer-data-disabled:text-ink-subtle">
          {label}
        </span>
        {description ? (
          <span className="text-sm text-ink-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
