"use client";

import { Popover } from "@base-ui/react/popover";
import {
  type FocusEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import { enGB, enUS, fr } from "react-day-picker/locale";

import {
  HugeiconsCalendarIcon,
  HugeiconsChevronLeftIcon,
  HugeiconsChevronRightIcon,
} from "@/components/icons";
import {
  type DateError,
  type DateOrder,
  type DateResult,
  type Precision,
  dateOrderFor,
  endsBeforeStart,
  formatDay,
  fromIsoDay,
  parseDay,
  parseMonth,
  parseYear,
  toIsoDay,
} from "@/lib/dates";
import { blockSubmitUnless } from "@/lib/form-events";
import { cn } from "@/lib/utils";

import { buttonVariants } from "./button";
import { Checkbox } from "./checkbox";
import { type ControlSize, Field, FieldSet, Input } from "./field";
import { Select } from "./select";

/**
 * Dates (decision 0021). Typing always works; the calendar is optional and
 * only offered for full dates (near dates: interviews, follow-ups). Values use
 * 0016's formats: `YYYY`, `YYYY-MM`, `YYYY-MM-DD`. Errors show when a field
 * loses focus or its form submits, never while typing, and never auto-tab.
 */

export type DateMessages = {
  /** Accessible names of the parts. */
  month: string;
  year: string;
  /** Placeholder of the month list. */
  monthPlaceholder: string;
  /** Accessible name of the calendar button. */
  chooseDate: string;
  errors: Record<DateError | "required", string>;
};

type Draft = { year: string; month: number | null; day: string };

const EMPTY: Draft = { year: "", month: null, day: "" };

function draftFrom(
  value: string | null | undefined,
  precision: Precision,
  order: DateOrder,
): Draft {
  if (!value) return EMPTY;
  return {
    year: value.slice(0, 4),
    month: precision === "year" ? null : Number(value.slice(5, 7)) || null,
    day: precision === "day" ? formatDay(value, order) : "",
  };
}

function parseDraft(
  draft: Draft,
  precision: Precision,
  order: DateOrder,
  bounds: { min?: string; max?: string },
): DateResult {
  if (precision === "year") return parseYear(draft.year, bounds);
  if (precision === "month") return parseMonth(draft.month, draft.year, bounds);
  return parseDay(draft.day, order, bounds);
}

function pickerLocale(languageTag: string) {
  if (languageTag.startsWith("fr")) return fr;
  return languageTag === "en-US" ? enUS : enGB;
}

function monthItems(languageTag: string) {
  const format = new Intl.DateTimeFormat(languageTag, { month: "long" });
  return Array.from({ length: 12 }, (_, index) => {
    const name = format.format(new Date(2024, index, 15));
    return {
      value: String(index + 1),
      label: name.charAt(0).toLocaleUpperCase(languageTag) + name.slice(1),
    };
  });
}

/** True while the screen is at least 1024 px wide (two calendar months). */
function useWide(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(min-width: 1024px)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

/** Our look for DayPicker; its default stylesheet is never loaded. */
const calendarClasses = {
  root: "relative text-ink",
  months: "flex flex-col gap-6 lg:flex-row",
  month: "flex flex-col gap-3",
  month_caption: "flex h-10 items-center justify-center px-10",
  caption_label: "text-base font-semibold",
  nav: "absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between",
  button_previous: cn(
    buttonVariants({ variant: "quiet", size: "sm", iconOnly: true }),
    "disabled:cursor-not-allowed disabled:text-ink-subtle",
  ),
  button_next: cn(
    buttonVariants({ variant: "quiet", size: "sm", iconOnly: true }),
    "disabled:cursor-not-allowed disabled:text-ink-subtle",
  ),
  month_grid: "border-collapse",
  weekdays: "",
  weekday: "h-8 w-10 text-xs font-semibold text-ink-muted",
  week: "",
  day: "p-0 text-center",
  day_button: cn(
    "inline-flex size-10 cursor-pointer items-center justify-center rounded-control text-sm tabular-nums",
    "transition-colors duration-(--dur-exit) hover-fine:bg-wash-hover hover-fine:duration-(--dur-fast)",
    "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-violet",
    "disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover-fine:bg-transparent",
  ),
  today: "font-bold text-violet",
  selected:
    "[&>button]:bg-violet [&>button]:text-on-violet [&>button]:hover-fine:bg-violet",
  range_start: "rounded-s-control bg-tint",
  range_end: "rounded-e-control bg-tint",
  range_middle:
    "bg-tint [&>button]:!bg-transparent [&>button]:!text-ink [&>button]:rounded-none",
  outside: "text-ink-subtle",
  disabled: "text-ink-subtle",
  hidden: "invisible",
};

function Chevron({ orientation }: { orientation?: string }) {
  return orientation === "left" ? (
    <HugeiconsChevronLeftIcon />
  ) : (
    <HugeiconsChevronRightIcon />
  );
}

const popupClasses = cn(
  "rounded-card bg-card p-3 text-ink outline-none",
  "shadow-[0_0_0_1px_var(--line),var(--shadow-float)]",
  "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
  "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
  "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
);

function CalendarTrigger({
  label,
  size,
}: {
  label: string;
  size: ControlSize;
}) {
  return (
    <Popover.Trigger
      aria-label={label}
      className={buttonVariants({
        variant: "quiet",
        size: size === "lg" ? "md" : "sm",
        iconOnly: true,
      })}
    >
      <HugeiconsCalendarIcon />
    </Popover.Trigger>
  );
}

/** Calls `onLeave` when focus moves outside the element (not between parts). */
function leaving(onLeave: () => void) {
  return (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) onLeave();
  };
}

/** Runs `check` on its form's submit; a failed check stops the submit. */
function useSubmitCheck(
  anchor: React.RefObject<HTMLElement | null>,
  check: () => boolean,
) {
  const latest = useRef(check);
  useEffect(() => {
    latest.current = check;
  });
  useEffect(
    () =>
      blockSubmitUnless(anchor.current?.closest("form"), () =>
        latest.current(),
      ),
    [anchor],
  );
}

type DatePartsProps = {
  precision: Precision;
  draft: Draft;
  onDraft: (draft: Draft) => void;
  /** Month changes and calendar picks commit at once. */
  onCommit: (draft: Draft) => void;
  languageTag: string;
  messages: DateMessages;
  size: ControlSize;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  describedBy?: string;
  /** Accessible name of the text input when there's no `Field` label. */
  inputLabel?: string;
  /** The calendar, for full dates. Omitted in a range (one calendar there). */
  calendar?: ReactNode;
  inputId?: string;
};

function DateParts({
  precision,
  draft,
  onDraft,
  onCommit,
  languageTag,
  messages,
  size,
  disabled,
  readOnly,
  invalid,
  describedBy,
  inputLabel,
  calendar,
  inputId,
}: DatePartsProps) {
  const months = useMemo(() => monthItems(languageTag), [languageTag]);
  const shared = {
    size,
    disabled,
    readOnly,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  };
  if (precision === "year") {
    return (
      <Input
        {...shared}
        id={inputId}
        aria-label={inputLabel}
        inputMode="numeric"
        autoComplete="off"
        value={draft.year}
        onChange={(event) =>
          onDraft({ ...draft, year: event.currentTarget.value })
        }
        className="w-28"
      />
    );
  }
  if (precision === "month") {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
        <Select
          size={size}
          aria-label={
            inputLabel ? `${inputLabel}, ${messages.month}` : messages.month
          }
          placeholder={messages.monthPlaceholder}
          items={months}
          value={draft.month ? String(draft.month) : null}
          disabled={disabled}
          readOnly={readOnly}
          onValueChange={(value) =>
            onCommit({ ...draft, month: value ? Number(value) : null })
          }
        />
        <Input
          {...shared}
          aria-label={
            inputLabel ? `${inputLabel}, ${messages.year}` : messages.year
          }
          inputMode="numeric"
          autoComplete="off"
          value={draft.year}
          onChange={(event) =>
            onDraft({ ...draft, year: event.currentTarget.value })
          }
        />
      </div>
    );
  }
  return (
    <Input
      {...shared}
      id={inputId}
      aria-label={inputLabel}
      autoComplete="off"
      value={draft.day}
      onChange={(event) =>
        onDraft({ ...draft, day: event.currentTarget.value })
      }
      end={calendar}
    />
  );
}

type DateFieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  /** An error from the form (e.g. the server); replaces our own check. */
  error?: ReactNode;
  optionalLabel?: string;
  precision: Precision;
  /** BCP 47 tag of the UI language ("en-US", "fr-FR"). */
  languageTag: string;
  defaultValue?: string | null;
  /** Controlled value; a change from outside replaces what's shown. */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: ControlSize;
  className?: string;
  messages: DateMessages;
};

/** One date at a year, month or day precision. */
export function DateField({
  label,
  hint,
  error,
  optionalLabel,
  precision,
  languageTag,
  defaultValue,
  value: controlled,
  onValueChange,
  min,
  max,
  name,
  required,
  disabled,
  readOnly,
  size = "md",
  className,
  messages,
}: DateFieldProps) {
  const order = dateOrderFor(languageTag);
  const [draft, setDraft] = useState<Draft>(() =>
    draftFrom(defaultValue, precision, order),
  );
  const [value, setValue] = useState<string | null>(defaultValue ?? null);
  const [ownError, setOwnError] = useState<DateError | "required" | null>(null);
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const inputId = useId();
  // Controlled mode: adopt a value set from outside; our commits update
  // `synced`, so a parent echoing the value back changes nothing.
  const [synced, setSynced] = useState(controlled);
  if (controlled !== undefined && controlled !== synced) {
    setSynced(controlled);
    setDraft(draftFrom(controlled, precision, order));
    setValue(controlled);
    setOwnError(null);
  }

  const commit = (next: Draft): boolean => {
    const result = parseDraft(next, precision, order, { min, max });
    setSynced(result.status === "valid" ? result.value : null);
    if (result.status === "valid") {
      setValue(result.value);
      setOwnError(null);
      onValueChange?.(result.value);
      return true;
    }
    setValue(null);
    onValueChange?.(null);
    if (result.status === "empty") {
      setOwnError(required ? "required" : null);
      return !required;
    }
    setOwnError(result.error);
    return false;
  };

  useSubmitCheck(anchor, () => commit(draft));

  const shownError = error || (ownError ? messages.errors[ownError] : null);
  const locked = disabled || readOnly;

  const calendar =
    precision === "day" ? (
      <Popover.Root
        open={open && !locked}
        onOpenChange={(next) => setOpen(next && !locked)}
      >
        {locked ? null : (
          <CalendarTrigger label={messages.chooseDate} size={size} />
        )}
        <Popover.Portal>
          <Popover.Positioner
            align="end"
            sideOffset={6}
            collisionPadding={16}
            className="z-50 outline-none"
          >
            <Popover.Popup className={popupClasses}>
              <DayPicker
                mode="single"
                locale={pickerLocale(languageTag)}
                selected={value ? fromIsoDay(value) : undefined}
                defaultMonth={value ? fromIsoDay(value) : undefined}
                startMonth={min ? fromIsoDay(min) : undefined}
                endMonth={max ? fromIsoDay(max) : undefined}
                disabled={[
                  ...(min ? [{ before: fromIsoDay(min) ?? new Date() }] : []),
                  ...(max ? [{ after: fromIsoDay(max) ?? new Date() }] : []),
                ]}
                autoFocus
                classNames={calendarClasses}
                components={{ Chevron }}
                onSelect={(date) => {
                  if (!date) return;
                  const iso = toIsoDay(date);
                  const next = { ...draft, day: formatDay(iso, order) };
                  setDraft(next);
                  commit(next);
                  setOpen(false);
                }}
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    ) : undefined;

  const parts = (
    <div ref={anchor} onBlur={leaving(() => commit(draft))}>
      <DateParts
        precision={precision}
        draft={draft}
        onDraft={(next) => {
          setDraft(next);
          if (ownError) setOwnError(null);
        }}
        onCommit={(next) => {
          setDraft(next);
          if (next.year.trim() !== "") commit(next);
        }}
        languageTag={languageTag}
        messages={messages}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        invalid={Boolean(shownError)}
        calendar={calendar}
        inputId={inputId}
      />
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
    </div>
  );

  if (precision === "month") {
    return (
      <FieldSet
        label={label}
        hint={hint}
        error={shownError}
        optionalLabel={optionalLabel}
        disabled={disabled}
        className={className}
      >
        {parts}
      </FieldSet>
    );
  }
  return (
    <Field
      label={label}
      hint={hint}
      error={shownError}
      optionalLabel={optionalLabel}
      disabled={disabled}
      className={className}
    >
      {parts}
    </Field>
  );
}

export type DateRangeValue = {
  start: string | null;
  /** Null while open-ended: "Current" ticked, or not filled in yet. */
  end: string | null;
  current: boolean;
};

type DateRangeFieldProps = Omit<
  DateFieldProps,
  "defaultValue" | "value" | "onValueChange" | "name"
> & {
  defaultValue?: Partial<DateRangeValue>;
  /** Controlled value; a change from outside replaces what's shown. */
  value?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  /** Hidden input names for forms. */
  names?: { start: string; end: string; current?: string };
  messages: DateMessages & {
    from: string;
    to: string;
    /** "I still work here"; omit to hide the "Current" checkbox. */
    current?: string;
    /** Accessible name of the range calendar button. */
    chooseDates: string;
    endBeforeStart: string;
  };
};

/**
 * A start and an end at one precision, with an optional "Current" box that
 * clears and disables the end (0016: no end = current). At day precision one
 * calendar picks the whole range: two months from 1024 px, one below.
 */
export function DateRangeField({
  label,
  hint,
  error,
  optionalLabel,
  precision,
  languageTag,
  defaultValue,
  value: controlled,
  onValueChange,
  min,
  max,
  names,
  required,
  disabled,
  readOnly,
  size = "md",
  className,
  messages,
}: DateRangeFieldProps) {
  const order = dateOrderFor(languageTag);
  const wide = useWide();
  const [start, setStart] = useState<Draft>(() =>
    draftFrom(defaultValue?.start, precision, order),
  );
  const [end, setEnd] = useState<Draft>(() =>
    draftFrom(defaultValue?.end, precision, order),
  );
  const [current, setCurrent] = useState(defaultValue?.current ?? false);
  const [value, setValue] = useState<DateRangeValue>({
    start: defaultValue?.start ?? null,
    end: defaultValue?.end ?? null,
    current: defaultValue?.current ?? false,
  });
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const id = useId();
  const keyOf = (range?: DateRangeValue) =>
    range ? `${range.start ?? ""}|${range.end ?? ""}|${range.current}` : "";
  const [synced, setSynced] = useState(keyOf(controlled));
  if (controlled !== undefined && keyOf(controlled) !== synced) {
    setSynced(keyOf(controlled));
    setStart(draftFrom(controlled.start, precision, order));
    setEnd(draftFrom(controlled.end, precision, order));
    setCurrent(controlled.current);
    setValue(controlled);
    setStartError(null);
    setEndError(null);
  }

  const check = (
    nextStart: Draft,
    nextEnd: Draft,
    isCurrent: boolean,
  ): boolean => {
    const bounds = { min, max };
    const a = parseDraft(nextStart, precision, order, bounds);
    const b = isCurrent
      ? ({ status: "empty" } as const)
      : parseDraft(nextEnd, precision, order, bounds);
    let startMessage: string | null = null;
    let endMessage: string | null = null;
    if (a.status === "invalid") startMessage = messages.errors[a.error];
    if (a.status === "empty" && required)
      startMessage = messages.errors.required;
    if (b.status === "invalid") endMessage = messages.errors[b.error];
    if (
      a.status === "valid" &&
      b.status === "valid" &&
      endsBeforeStart(a.value, b.value)
    )
      endMessage = messages.endBeforeStart;
    setStartError(startMessage);
    setEndError(endMessage);
    const next: DateRangeValue = {
      start: a.status === "valid" ? a.value : null,
      end: !isCurrent && b.status === "valid" && !endMessage ? b.value : null,
      current: isCurrent,
    };
    setValue(next);
    setSynced(keyOf(next));
    onValueChange?.(next);
    return !startMessage && !endMessage;
  };

  useSubmitCheck(anchor, () => check(start, end, current));

  const locked = disabled || readOnly;
  const range: DateRange | undefined = value.start
    ? {
        from: fromIsoDay(value.start),
        to: value.end ? fromIsoDay(value.end) : undefined,
      }
    : undefined;

  const part = (
    which: "start" | "end",
    draft: Draft,
    setDraft: (draft: Draft) => void,
    partError: string | null,
  ) => {
    const partLabel = which === "start" ? messages.from : messages.to;
    const errorId = `${id}-${which}-error`;
    const off = which === "end" && current;
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span
          className={cn(
            "text-sm text-ink-muted",
            (disabled || off) && "text-ink-subtle",
          )}
          aria-hidden="true"
        >
          {partLabel}
        </span>
        <DateParts
          precision={precision}
          draft={off ? EMPTY : draft}
          onDraft={(next) => {
            setDraft(next);
            if (which === "start") setStartError(null);
            else setEndError(null);
          }}
          onCommit={(next) => {
            setDraft(next);
            if (next.year.trim() !== "")
              check(
                which === "start" ? next : start,
                which === "end" ? next : end,
                current,
              );
          }}
          languageTag={languageTag}
          messages={messages}
          size={size}
          disabled={disabled || off}
          readOnly={readOnly}
          invalid={Boolean(partError)}
          describedBy={partError ? errorId : undefined}
          inputLabel={partLabel}
        />
        {partError ? (
          <p
            id={errorId}
            role="alert"
            className="text-sm font-medium text-danger"
          >
            {partError}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <FieldSet
      label={label}
      hint={hint}
      error={error}
      optionalLabel={optionalLabel}
      disabled={disabled}
      className={className}
    >
      <div
        ref={anchor}
        className="flex flex-col gap-3"
        onBlur={leaving(() => check(start, end, current))}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {part("start", start, setStart, startError)}
          {part("end", end, setEnd, endError)}
          {precision === "day" && !locked ? (
            <Popover.Root open={open} onOpenChange={setOpen}>
              <div className="flex sm:pt-7">
                <Popover.Trigger
                  aria-label={messages.chooseDates}
                  className={buttonVariants({
                    variant: "secondary",
                    size,
                    iconOnly: true,
                  })}
                >
                  <HugeiconsCalendarIcon />
                </Popover.Trigger>
              </div>
              <Popover.Portal>
                <Popover.Positioner
                  align="end"
                  sideOffset={6}
                  collisionPadding={16}
                  className="z-50 outline-none"
                >
                  <Popover.Popup className={popupClasses}>
                    <DayPicker
                      mode="range"
                      locale={pickerLocale(languageTag)}
                      numberOfMonths={wide ? 2 : 1}
                      selected={range}
                      defaultMonth={range?.from}
                      startMonth={min ? fromIsoDay(min) : undefined}
                      endMonth={max ? fromIsoDay(max) : undefined}
                      autoFocus
                      classNames={calendarClasses}
                      components={{ Chevron }}
                      onSelect={(picked) => {
                        const nextStart = picked?.from
                          ? {
                              ...start,
                              day: formatDay(toIsoDay(picked.from), order),
                            }
                          : EMPTY;
                        const nextEnd =
                          picked?.to && !current
                            ? {
                                ...end,
                                day: formatDay(toIsoDay(picked.to), order),
                              }
                            : end;
                        setStart(nextStart);
                        setEnd(nextEnd);
                        check(nextStart, nextEnd, current);
                        if (picked?.from && (picked.to || current))
                          setOpen(false);
                      }}
                    />
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          ) : null}
        </div>
        {messages.current ? (
          <Checkbox
            label={messages.current}
            checked={current}
            disabled={disabled}
            readOnly={readOnly}
            onCheckedChange={(checked) => {
              setCurrent(checked);
              if (checked) setEnd(EMPTY);
              check(start, checked ? EMPTY : end, checked);
            }}
          />
        ) : null}
      </div>
      {names ? (
        <>
          <input type="hidden" name={names.start} value={value.start ?? ""} />
          <input type="hidden" name={names.end} value={value.end ?? ""} />
          {names.current ? (
            <input
              type="hidden"
              name={names.current}
              value={value.current ? "true" : ""}
            />
          ) : null}
        </>
      ) : null}
    </FieldSet>
  );
}
