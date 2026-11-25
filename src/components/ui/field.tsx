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

type FieldSetProps = Omit<FieldProps, "children"> & {
  /** Ids of the controls' own descriptions, if any. */
  children: ReactNode;
};

/**
 * A field made of several controls (a month and a year; "From" and "To").
 * Same look as `Field`, with fieldset/legend semantics so the label names
 * the group; each control inside carries its own short accessible name.
 */
export function FieldSet({
  label,
  hint,
  error,
  optionalLabel,
  disabled,
  className,
  children,
}: FieldSetProps) {
  const id = useId();
  const invalid = error != null && error !== false && error !== "";
  return (
    <fieldset
      disabled={disabled}
      aria-describedby={
        [hint ? `${id}-hint` : "", invalid ? `${id}-error` : ""]
          .filter(Boolean)
          .join(" ") || undefined
      }
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <legend
        className={cn(
          "mb-2 text-base font-semibold text-ink",
          disabled && "text-ink-subtle",
        )}
      >
        {label}
        {optionalLabel ? (
          <span className="font-normal text-ink-muted"> {optionalLabel}</span>
        ) : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-3 text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {invalid ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-sm font-medium text-danger"
        >
          <HugeiconsBadgeAlertIcon size={18} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : null}
    </fieldset>
  );
}

/** Shared control look: inputs, textareas and select triggers. */
export const controlClasses = cn(
  "w-full min-w-0 bg-card text-(length:--text-field) text-ink shadow-[inset_0_0_0_1px_var(--field)]",
  "transition-[box-shadow,background-color] duration-(--dur-exit) hover-fine:duration-(--dur-fast)",
  "placeholder:text-ink-subtle",
  "hover-fine:shadow-[inset_0_0_0_1px_var(--ink-muted)]",
  "focus-visible:shadow-[inset_0_0_0_1px_var(--violet)] focus-visible:outline-offset-0",
  "data-invalid:shadow-[inset_0_0_0_2px_var(--danger)] data-invalid:focus-visible:outline-danger",
  "data-disabled:cursor-not-allowed data-disabled:bg-well data-disabled:text-ink-subtle data-disabled:shadow-[inset_0_0_0_1px_var(--line)]",
  "read-only:bg-well read-only:shadow-[inset_0_0_0_1px_var(--line)]",
);

/**
 * Control sizes (0020) and their radius (0022). Text is --text-field at every size:
 * 14 px with a mouse, 16 px on touch so iOS never zooms (0033).
 */
export type ControlSize = "lg" | "md" | "sm";

export const controlHeight: Record<ControlSize, string> = {
  lg: "h-(--control-h-lg)",
  md: "h-(--control-h)",
  sm: "h-(--control-h-sm)",
};

/** Type spacing for fields (0029): --text-field text, padding from the height. */
export const fieldSpacing: Record<ControlSize, string> = {
  lg: "jb-field jb-field-lg",
  md: "jb-field jb-field-md",
  sm: "jb-field jb-field-sm",
};

export const controlRadius: Record<ControlSize, string> = {
  lg: "rounded-control-lg",
  md: "rounded-control",
  sm: "rounded-control-sm",
};

type InputProps = Omit<
  ComponentProps<typeof InputPrimitive>,
  "className" | "size"
> & {
  className?: string;
  /** lg on single-task screens, md by default, sm in dense rows (0020). */
  size?: ControlSize;
  /** A decorative icon at the start, e.g. search. */
  icon?: ReactNode;
  /** A control at the end, e.g. a clear or reveal button. */
  end?: ReactNode;
};

/** Single-line text. 16 px text so iOS doesn't zoom; height by `size`. */
export function Input({
  className,
  size = "md",
  icon,
  end,
  ...props
}: InputProps) {
  return (
    <span
      className={cn(
        "relative flex w-full min-w-0 items-center",
        fieldSpacing[size],
      )}
    >
      {icon ? (
        <span className="jb-field-icon pointer-events-none text-ink-muted">
          {icon}
        </span>
      ) : null}
      <InputPrimitive
        className={cn(
          controlClasses,
          controlHeight[size],
          controlRadius[size],
          "jb-field-box",
          icon && "jb-field-has-icon",
          end && "jb-field-has-end",
          className,
        )}
        {...props}
      />
      {end ? <span className="jb-field-end">{end}</span> : null}
    </span>
  );
}

type TextareaProps = Omit<ComponentProps<"textarea">, "className"> & {
  className?: string;
  /**
   * Sets the radius and padding to match the other fields (0020, 0022). The
   * height stays content-driven (4 lines minimum) at every size.
   */
  size?: ControlSize;
  /** Shows "n / max" under the field when `maxLength` is set. */
  showCount?: boolean;
};

/**
 * Multi-line text that grows with its content (`field-sizing: content`)
 * between 4 and about 12 lines, then scrolls.
 */
export function Textarea({
  className,
  size = "md",
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
          controlRadius[size],
          "field-sizing-content max-h-80 min-h-28 resize-y",
          fieldSpacing[size],
          "jb-field-box",
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
