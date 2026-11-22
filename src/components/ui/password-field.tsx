"use client";

import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { HugeiconsEyeIcon, HugeiconsEyeOffIcon } from "@/components/icons";
import { hideOnSubmit } from "@/lib/form-events";

import { IconButton } from "./button";
import { type ControlSize, Field, Input } from "./field";

type PasswordFieldProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "size" | "autoComplete" | "end" | "icon" | "maxLength"
> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optionalLabel?: string;
  /** "current" signs in; "new" creates or changes a password. */
  purpose: "current" | "new";
  /** Toggle labels. Two fields on one page need distinct ones (GOV.UK). */
  showLabel: string;
  hideLabel: string;
  /** Shown under the field while Caps Lock is on. */
  capsLockLabel: string;
  size?: ControlSize;
};

/**
 * Password with a show/hide toggle (decision 0021, GOV.UK password input).
 * Hidden by default and again when its form submits. Paste is allowed, no
 * `maxLength`, no spellcheck or autocapitalise. No confirm field: the toggle
 * lets people check what they typed.
 */
export function PasswordField({
  label,
  hint,
  error,
  optionalLabel,
  purpose,
  showLabel,
  hideLabel,
  capsLockLabel,
  size = "md",
  disabled,
  readOnly,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide again on submit, so the browser never keeps it shown afterwards.
  useEffect(() => hideOnSubmit(inputRef.current?.form, setVisible), []);

  const readCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"));

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      optionalLabel={optionalLabel}
      disabled={disabled}
    >
      <Input
        ref={inputRef}
        {...props}
        size={size}
        type={visible ? "text" : "password"}
        autoComplete={purpose === "new" ? "new-password" : "current-password"}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        disabled={disabled}
        readOnly={readOnly}
        onKeyDown={(event) => {
          readCapsLock(event);
          onKeyDown?.(event);
        }}
        onKeyUp={(event) => {
          readCapsLock(event);
          onKeyUp?.(event);
        }}
        onBlur={(event) => {
          setCapsLock(false);
          onBlur?.(event);
        }}
        end={
          <IconButton
            size={size === "lg" ? "md" : "sm"}
            label={visible ? hideLabel : showLabel}
            tooltip={false}
            aria-pressed={visible}
            disabled={disabled}
            icon={visible ? <HugeiconsEyeOffIcon /> : <HugeiconsEyeIcon />}
            // Keep focus and the caret in the input on a mouse or touch toggle.
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => setVisible((shown) => !shown)}
          />
        }
      />
      {capsLock ? (
        <p className="text-sm text-ink-muted" aria-live="polite">
          {capsLockLabel}
        </p>
      ) : null}
    </Field>
  );
}
