"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { type ComponentProps, type ReactNode, useId, useState } from "react";

import { HugeiconsBadgeAlertIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Form fields (0008 §3 spacing: 8 px label → control → hint; 0009 states).
 * Labels sit above the control, never as a placeholder. Optional fields are
 * marked, required ones are not (GOV.UK). Errors say what to do and replace
 * the hint; the control turns danger and the message has an icon.
 */

type FieldProps = {
  label: ReactNode;
  /** Help shown under the label, before the control. */
  hint?: ReactNode;
  /** When set, the field is invalid and this message is announced. */
  error?: ReactNode;
  /** e.g. "(optional)". Shown after the label when given. */
  optionalLabel?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  hint,
  error,
  optionalLabel,
  disabled,
  className,
  children,
}: FieldProps) {
  const invalid = error != null && error !== false && error !== "";
  return (
    <FieldPrimitive.Root
      invalid={invalid}
      disabled={disabled}
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <FieldPrimitive.Label className="text-sm font-semibold text-ink data-disabled:text-ink-subtle">
        {label}
        {optionalLabel ? (
          <span className="font-normal text-ink-muted"> {optionalLabel}</span>
        ) : null}
      </FieldPrimitive.Label>
      {hint ? (
        <FieldPrimitive.Description className="-mt-1 text-sm text-ink-muted">
          {hint}
        </FieldPrimitive.Description>
      ) : null}
      {children}
      <FieldPrimitive.Error
        match={invalid}
        className="flex items-start gap-1.5 text-sm font-medium text-danger"
      >
        <HugeiconsBadgeAlertIcon size={18} className="mt-px" />
        <span>{error}</span>
      </FieldPrimitive.Error>
    </FieldPrimitive.Root>
  );
}

/** Shared control look: inputs, textareas and select triggers. */
export const controlClasses = cn(
  "w-full min-w-0 rounded-control bg-card text-base text-ink shadow-[inset_0_0_0_1px_var(--field)]",
  "transition-[box-shadow,background-color] duration-(--dur-exit) hover-fine:duration-(--dur-fast)",
  "placeholder:text-ink-subtle",
  "hover-fine:shadow-[inset_0_0_0_1px_var(--ink-muted)]",
  "focus-visible:shadow-[inset_0_0_0_1px_var(--violet)] focus-visible:outline-offset-0",
  "data-invalid:shadow-[inset_0_0_0_2px_var(--danger)] data-invalid:focus-visible:outline-danger",
  "data-disabled:cursor-not-allowed data-disabled:bg-well data-disabled:text-ink-subtle data-disabled:shadow-[inset_0_0_0_1px_var(--line)]",
  "read-only:bg-well read-only:shadow-[inset_0_0_0_1px_var(--line)]",
);

type InputProps = Omit<ComponentProps<typeof InputPrimitive>, "className"> & {
  className?: string;
  /** A decorative icon at the start, e.g. search. */
  icon?: ReactNode;
  /** A control at the end, e.g. a clear or reveal button. */
  end?: ReactNode;
};

/** Single-line text. 16 px text so iOS doesn't zoom; 48 px tall. */
export function Input({ className, icon, end, ...props }: InputProps) {
  return (
    <span className="relative flex w-full min-w-0 items-center">
      {icon ? (
        <span className="pointer-events-none absolute start-3 flex text-ink-muted">
          {icon}
        </span>
      ) : null}
      <InputPrimitive
        className={cn(
          controlClasses,
          "h-(--control-h) px-3",
          icon ? "ps-10" : undefined,
          end ? "pe-12" : undefined,
          className,
        )}
        {...props}
      />
      {end ? (
        <span className="absolute end-0.5 flex items-center">{end}</span>
      ) : null}
    </span>
  );
}

type TextareaProps = Omit<ComponentProps<"textarea">, "className"> & {
  className?: string;
  /** Shows "n / max" under the field when `maxLength` is set. */
  showCount?: boolean;
};

/**
 * Multi-line text that grows with its content (`field-sizing: content`)
 * between 4 and about 12 lines, then scrolls.
 */
export function Textarea({
  className,
  showCount = false,
  maxLength,
  defaultValue,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const counterId = useId();
  const [length, setLength] = useState(
    String(value ?? defaultValue ?? "").length,
  );
  return (
    <span className="flex w-full flex-col gap-1">
      <FieldPrimitive.Control
        render={
          <textarea
            maxLength={maxLength}
            defaultValue={defaultValue}
            value={value}
            aria-describedby={showCount && maxLength ? counterId : undefined}
            onChange={(event) => {
              setLength(event.currentTarget.value.length);
              onChange?.(event);
            }}
            {...props}
          />
        }
        className={cn(
          controlClasses,
          "field-sizing-content max-h-80 min-h-28 resize-y px-3 py-3 leading-normal",
          className,
        )}
      />
      {showCount && maxLength ? (
        <span
          id={counterId}
          className={cn(
            "self-end text-xs text-ink-muted tabular-nums",
            length >= maxLength && "font-semibold text-danger",
          )}
        >
          {length} / {maxLength}
        </span>
      ) : null}
    </span>
  );
}
