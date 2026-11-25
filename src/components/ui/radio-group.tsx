"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { type ComponentProps, type ReactNode, useId } from "react";

import { HugeiconsBadgeAlertIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

type RadioGroupProps = Omit<
  ComponentProps<typeof RadioGroupPrimitive>,
  "className" | "children"
> & {
  /** The question, as the group's legend. */
  legend: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: RadioOption[];
  /** Cards: each option in a bordered row; for 2–4 big choices (onboarding). */
  appearance?: "list" | "cards";
  className?: string;
};

/**
 * One choice from a short list (≤ 6; longer lists use Select). Arrow keys
 * move and select, per the APG radio group. The dot grows in 120 ms.
 */
export function RadioGroup({
  legend,
  hint,
  error,
  options,
  appearance = "list",
  className,
  ...props
}: RadioGroupProps) {
  const id = useId();
  const invalid = error != null && error !== false && error !== "";
  return (
    <fieldset
      className={cn("flex min-w-0 flex-col gap-2", className)}
      aria-describedby={
        [hint ? `${id}-hint` : "", invalid ? `${id}-error` : ""]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <legend className="mb-2 text-base font-semibold text-ink">
        {legend}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-2 text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      <RadioGroupPrimitive
        className={cn(
          "flex flex-col",
          appearance === "cards" ? "gap-3" : "gap-0",
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "group/radio flex cursor-pointer items-start gap-3 has-data-disabled:cursor-not-allowed",
              appearance === "list" && "min-h-11 py-2.5",
              appearance === "cards" && [
                "rounded-card bg-card p-4 shadow-[inset_0_0_0_1px_var(--line)]",
                "transition-[box-shadow,background-color] duration-(--dur-exit) hover-fine:shadow-[inset_0_0_0_1px_var(--field)] hover-fine:duration-(--dur-fast)",
                "has-data-checked:bg-tint has-data-checked:shadow-[inset_0_0_0_2px_var(--violet)]",
                "has-data-disabled:bg-well",
              ],
            )}
          >
            <Radio.Root
              value={option.value}
              disabled={option.disabled}
              className={cn(
                "peer mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-card shadow-[inset_0_0_0_1.5px_var(--field)]",
                "transition-[box-shadow,scale] duration-(--dur-fast) ease-standard",
                "group-hover/radio:shadow-[inset_0_0_0_1.5px_var(--ink-muted)] active:scale-(--press-scale)",
                "data-checked:shadow-[inset_0_0_0_1.5px_var(--violet)] group-hover/radio:data-checked:shadow-[inset_0_0_0_1.5px_var(--violet)]",
                invalid && "shadow-[inset_0_0_0_2px_var(--danger)]",
                "data-disabled:bg-well data-disabled:shadow-[inset_0_0_0_1.5px_var(--line)]",
              )}
            >
              <Radio.Indicator
                keepMounted
                className={cn(
                  "size-2.5 rounded-full bg-violet transition-[scale,opacity] duration-(--dur-fast) ease-enter",
                  "data-unchecked:scale-50 data-unchecked:opacity-0 motion-reduce:transition-opacity motion-reduce:data-unchecked:scale-100",
                  "data-disabled:bg-ink-subtle",
                )}
              />
            </Radio.Root>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base text-ink peer-data-disabled:text-ink-subtle">
                {option.label}
              </span>
              {option.description ? (
                <span className="text-sm text-ink-muted">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </RadioGroupPrimitive>
      {invalid ? (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-sm font-medium text-danger"
        >
          <HugeiconsBadgeAlertIcon size={18} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : null}
    </fieldset>
  );
}
