"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  ComponentProps<typeof SwitchPrimitive.Root>,
  "className"
> & {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
};

/**
 * On/off setting that applies at once (no Save button). For choices saved
 * with a form, use Checkbox. Label left, switch right (settings rows).
 * The thumb slides in 200 ms with the standard curve; it is a CSS transition,
 * so quick double toggles reverse smoothly instead of jumping.
 */
export function Switch({
  label,
  description,
  className,
  ...props
}: SwitchProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4 py-2 has-data-disabled:cursor-not-allowed",
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base text-ink">{label}</span>
        {description ? (
          <span className="text-sm text-ink-muted">{description}</span>
        ) : null}
      </span>
      <SwitchPrimitive.Root
        className={cn(
          "group/switch relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-field p-1",
          "transition-[background-color,scale] duration-(--dur-base) ease-standard active:scale-(--press-scale)",
          "data-checked:bg-violet hover-fine:bg-ink-muted hover-fine:data-checked:bg-[color-mix(in_oklab,var(--violet)_88%,var(--ink))]",
          "data-disabled:bg-line data-disabled:data-checked:bg-ink-subtle",
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "size-5 rounded-full bg-card shadow-thumb",
            "transition-[translate,background-color] duration-(--dur-base) ease-standard",
            "data-checked:translate-x-5 data-checked:bg-on-violet",
          )}
        />
      </SwitchPrimitive.Root>
    </label>
  );
}
