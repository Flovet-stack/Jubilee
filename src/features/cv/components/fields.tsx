"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import {
  HugeiconsChevronDownIcon,
  HugeiconsChevronUpIcon,
  HugeiconsPlusIcon,
  HugeiconsTrashIcon,
  HugeiconsXIcon,
} from "@/components/icons";
import { Button, IconButton } from "@/components/ui/button";
import {
  type DateMessages,
  DateField,
  DateRangeField,
} from "@/components/ui/date-field";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { move, splitSkills } from "../editor";

/**
 * Small fields the CV editor repeats (spec 14). Every string comes from the
 * message files; nothing here knows about a section kind.
 */

type TextFieldProps = {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: ReactNode;
  optional?: boolean;
  multiline?: boolean;
  maxLength?: number;
  type?: "text" | "email" | "url";
  autoComplete?: string;
  placeholder?: string;
  /** Checks the value when the field is left; returns the error or null. */
  check?: (value: string) => string | null;
  className?: string;
};

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  hint,
  optional,
  multiline,
  maxLength,
  type = "text",
  autoComplete,
  placeholder,
  check,
  className,
}: TextFieldProps) {
  const t = useTranslations("cv.editor");
  const [error, setError] = useState<string | null>(null);
  const blur = () => {
    setError(check ? check(value) : null);
    onBlur?.();
  };
  const change = (next: string) => {
    if (error && check && !check(next)) setError(null);
    onChange(next);
  };
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      optionalLabel={optional ? t("optional") : undefined}
      className={className}
    >
      {multiline ? (
        <Textarea
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => change(e.target.value)}
          onBlur={blur}
        />
      ) : (
        <Input
          value={value}
          type={type}
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          spellCheck={type === "text"}
          onChange={(e) => change(e.target.value)}
          onBlur={blur}
        />
      )}
    </Field>
  );
}

/** The date-field copy from `fields.date`, shared by every date in the editor. */
export function useDateMessages() {
  const t = useTranslations("fields.date");
  const messages: DateMessages = {
    month: t("month"),
    year: t("year"),
    monthPlaceholder: t("monthPlaceholder"),
    chooseDate: t("chooseDate"),
    errors: {
      incomplete: t("errors.incomplete"),
      impossible: t("errors.impossible"),
      yearMissing: t("errors.yearMissing"),
      beforeMin: t("errors.beforeMin"),
      afterMax: t("errors.afterMax"),
      required: t("errors.required"),
    },
  };
  return {
    messages,
    range: (current: string) => ({
      ...messages,
      from: t("from"),
      to: t("to"),
      current,
      chooseDates: t("chooseDates"),
      endBeforeStart: t("endBeforeStart"),
    }),
  };
}

/** Start and end at month precision; no end means "current" (0016). */
export function DatesField({
  label,
  start,
  end,
  currentLabel,
  languageTag,
  onChange,
}: {
  label: ReactNode;
  start: string | undefined;
  end: string | undefined;
  currentLabel: string;
  languageTag: string;
  onChange: (dates: { startDate?: string; endDate?: string }) => void;
}) {
  const { range: rangeMessages } = useDateMessages();
  const range = {
    start: start ?? null,
    end: end ?? null,
    current: Boolean(start) && !end,
  };
  return (
    <DateRangeField
      label={label}
      precision="month"
      languageTag={languageTag}
      // The field reads its first value from defaultValue and later ones
      // from value, so both are passed.
      defaultValue={range}
      value={range}
      onValueChange={(value) =>
        onChange({
          startDate: value.start ?? undefined,
          endDate: value.current ? undefined : (value.end ?? undefined),
        })
      }
      messages={rangeMessages(currentLabel)}
    />
  );
}

export function MonthField({
  label,
  value,
  languageTag,
  onChange,
}: {
  label: ReactNode;
  value: string | undefined;
  languageTag: string;
  onChange: (value: string | undefined) => void;
}) {
  const { messages } = useDateMessages();
  const t = useTranslations("cv.editor");
  return (
    <DateField
      label={label}
      optionalLabel={t("optional")}
      precision="month"
      languageTag={languageTag}
      defaultValue={value ?? null}
      value={value ?? null}
      onValueChange={(next) => onChange(next ?? undefined)}
      messages={messages}
    />
  );
}

/**
 * Bullets: one field each, add, move up or down, remove (0024 §2). A quiet
 * character count appears from 150 characters ("aim for 1–2 lines").
 */
export function BulletsField({
  label,
  hint,
  items,
  onChange,
  onBlur,
}: {
  label: ReactNode;
  hint?: ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  onBlur?: () => void;
}) {
  const t = useTranslations("cv.editor.bullets");
  const groupId = useId();
  const list = useRef<HTMLOListElement>(null);
  const focusLast = useRef(false);
  // A new bullet gets the cursor, so typing goes straight into it.
  useEffect(() => {
    if (!focusLast.current) return;
    focusLast.current = false;
    list.current
      ?.querySelector<HTMLTextAreaElement>("li:last-child textarea")
      ?.focus();
  }, [items.length]);
  const set = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));
  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={hint ? `${groupId}-hint` : undefined}
    >
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      {hint ? (
        <p id={`${groupId}-hint`} className="-mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      <ol ref={list} className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="group/row flex items-start gap-1">
            <span aria-hidden className="mt-2.5 w-4 shrink-0 text-ink-muted">
              •
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Textarea
                aria-label={t("label", { number: index + 1 })}
                value={item}
                maxLength={300}
                rows={2}
                className="min-h-16"
                onChange={(e) => set(index, e.target.value)}
                onBlur={onBlur}
              />
              {item.length >= 150 ? (
                <p className="text-sm text-ink-muted">
                  {t("count", { count: item.length })}
                </p>
              ) : null}
            </div>
            <RowActions
              onUp={
                index > 0 ? () => onChange(move(items, index, -1)) : undefined
              }
              onDown={
                index < items.length - 1
                  ? () => onChange(move(items, index, 1))
                  : undefined
              }
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
              labels={{
                up: t("moveUp"),
                down: t("moveDown"),
                remove: t("remove"),
              }}
            />
          </li>
        ))}
      </ol>
      <Button
        variant="quiet"
        size="sm"
        className="self-start"
        icon={<HugeiconsPlusIcon />}
        onClick={() => {
          focusLast.current = true;
          onChange([...items, ""]);
        }}
        disabled={items.length >= 20}
      >
        {t("add")}
      </Button>
    </fieldset>
  );
}

/**
 * Move up, move down and remove for a row. With a fine pointer they show on
 * hover or keyboard focus; on touch they're always visible (0024 §2).
 */
export function RowActions({
  onUp,
  onDown,
  onRemove,
  labels,
  className,
}: {
  onUp?: () => void;
  onDown?: () => void;
  onRemove?: () => void;
  labels: { up: string; down: string; remove: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center",
        "pointer-fine:opacity-0 pointer-fine:group-focus-within/row:opacity-100 pointer-fine:group-hover/row:opacity-100",
        className,
      )}
    >
      <IconButton
        size="sm"
        label={labels.up}
        icon={<HugeiconsChevronUpIcon />}
        onClick={onUp}
        disabled={!onUp}
      />
      <IconButton
        size="sm"
        label={labels.down}
        icon={<HugeiconsChevronDownIcon />}
        onClick={onDown}
        disabled={!onDown}
      />
      {onRemove ? (
        <IconButton
          size="sm"
          label={labels.remove}
          icon={<HugeiconsTrashIcon />}
          onClick={onRemove}
        />
      ) : null}
    </div>
  );
}

/**
 * A list of short items (skills, courses). Type one and press Enter, or paste
 * a comma list: it splits into one item each (0024 §2).
 */
export function ItemsField({
  label,
  hint,
  items,
  onChange,
  max,
  removeLabel,
  addLabel,
}: {
  label: ReactNode;
  hint?: ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  removeLabel: (item: string) => string;
  addLabel: string;
}) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const known = new Set(items.map((item) => item.toLocaleLowerCase()));
    const fresh = splitSkills(raw).filter(
      (item) => !known.has(item.toLocaleLowerCase()),
    );
    if (fresh.length > 0) onChange([...items, ...fresh].slice(0, max));
    setText("");
  };
  return (
    <Field label={label} hint={hint}>
      <Input
        value={text}
        onChange={(e) => {
          const value = e.target.value;
          if (/[,;]/.test(value)) add(value);
          else setText(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(text);
          }
        }}
        onBlur={() => text && add(text)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (/[,;\n]/.test(pasted)) {
            e.preventDefault();
            add(`${text}${pasted}`);
          }
        }}
        enterKeyHint="done"
        aria-description={addLabel}
      />
      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1 rounded-mark bg-well py-1 ps-3 pe-1 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)]"
            >
              {item}
              <IconButton
                size="sm"
                label={removeLabel(item)}
                icon={<HugeiconsXIcon />}
                onClick={() =>
                  onChange(items.filter((other) => other !== item))
                }
              />
            </li>
          ))}
        </ul>
      ) : null}
    </Field>
  );
}
