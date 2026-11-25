"use client";

import { Combobox } from "@base-ui/react/combobox";
import { hasFlag } from "country-flag-icons";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  HugeiconsCheckIcon,
  HugeiconsChevronDownIcon,
} from "@/components/icons";
import {
  type Country,
  type CountryCode,
  countryOf,
  exampleFor,
  formatNational,
  listCountries,
  matchesCountry,
  parsePhone,
} from "@/lib/phone";
import { blockSubmitUnless } from "@/lib/form-events";
import { cn } from "@/lib/utils";

import { buttonVariants } from "./button";
import {
  type ControlSize,
  Field,
  Input,
  controlRadius,
  fieldSpacing,
} from "./field";

export type PhoneValue = {
  country: CountryCode;
  /** The number in E.164 (`+33612345678`), or null while it isn't valid. */
  e164: string | null;
};

type PhoneFieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  /** An error from the form (e.g. the server); replaces our own check. */
  error?: ReactNode;
  optionalLabel?: string;
  /** BCP 47 tag of the UI language, for country names ("fr-FR"). */
  languageTag: string;
  /** Starting country when there's no value; from `defaultCountryFor(locale)`. */
  defaultCountry: CountryCode;
  /** A stored E.164 number; shown back in its national format. */
  defaultValue?: string;
  /**
   * Controlled value (E.164, or null to clear). When it changes from outside
   * (a loaded CV, a reset), the field shows it in its national format.
   */
  value?: string | null;
  onValueChange?: (value: PhoneValue) => void;
  /** Name of the hidden input that carries the E.164 number in a form. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: ControlSize;
  className?: string;
  /** Copy, from the message files. */
  messages: {
    /** Accessible name of the country button, e.g. "Country code". */
    country: string;
    /** Search box placeholder in the country list. */
    search: string;
    /** Shown when no country matches the search. */
    noMatch: string;
    /** Error for a number that isn't valid, given an example number. */
    invalid: (example: string) => string;
    /** Error for a required field left empty. */
    required: string;
  };
};

function Flag({ code }: { code: CountryCode }) {
  if (!hasFlag(code)) {
    return (
      <span className="inline-flex h-3.5 min-w-5 shrink-0 items-center justify-center rounded-paper bg-well px-0.5 text-xs leading-none font-bold text-ink-muted">
        {code}
      </span>
    );
  }
  return (
    // A plain <img>: static SVG from /flags, sized, lazy (no next/image work).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code}.svg`}
      alt=""
      width={20}
      height={14}
      loading="lazy"
      className="h-3.5 w-5 shrink-0 rounded-paper object-cover shadow-[0_0_0_1px_var(--line)]"
    />
  );
}

/**
 * Phone number with a country code (decision 0021). The country button opens
 * a searchable list (names in the UI language, or a dial code). The number is
 * typed freely: no mask, never reformatted while typing. It's checked when
 * the field loses focus and when its form submits; a pasted `+` number picks
 * its own country. The value is E.164, in a hidden input named `name`.
 */
export function PhoneField({
  label,
  hint,
  error,
  optionalLabel,
  languageTag,
  defaultCountry,
  defaultValue,
  value,
  onValueChange,
  name,
  required,
  disabled,
  readOnly,
  size = "md",
  className,
  messages,
}: PhoneFieldProps) {
  const countries = useMemo(() => listCountries(languageTag), [languageTag]);
  const initialCountry =
    (defaultValue && countryOf(defaultValue)) || defaultCountry;
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [text, setText] = useState(
    defaultValue ? formatNational(defaultValue) : "",
  );
  const [e164, setE164] = useState<string | null>(defaultValue ?? null);
  const [ownError, setOwnError] = useState<string | null>(null);
  // Controlled mode: adopt a value set from outside (React's "adjust state
  // when a prop changes" pattern). Our own commits update `synced` too, so a
  // parent echoing the value back never reformats what the user typed.
  const [synced, setSynced] = useState<string | null | undefined>(value);
  if (value !== undefined && value !== synced) {
    setSynced(value);
    setText(value ? formatNational(value) : "");
    setE164(value);
    if (value) setCountry(countryOf(value) ?? country);
    setOwnError(null);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = countries.find((item) => item.code === country);

  const check = (raw: string, current: CountryCode): boolean => {
    const result = parsePhone(raw, current);
    if (result.status === "empty") {
      setE164(null);
      setSynced(null);
      setOwnError(required ? messages.required : null);
      onValueChange?.({ country: current, e164: null });
      return !required;
    }
    if (result.status === "valid") {
      setCountry(result.country);
      setE164(result.e164);
      setSynced(result.e164);
      setOwnError(null);
      onValueChange?.({ country: result.country, e164: result.e164 });
      return true;
    }
    setCountry(result.country);
    setE164(null);
    setSynced(null);
    setOwnError(messages.invalid(exampleFor(result.country)));
    onValueChange?.({ country: result.country, e164: null });
    return false;
  };

  // Check on submit too; an invalid number stops the submit and gets focus.
  const latest = useRef({ text, country, check });
  useEffect(() => {
    latest.current = { text, country, check };
  });
  useEffect(
    () =>
      blockSubmitUnless(inputRef.current?.form, () => {
        const { text: raw, country: current, check: run } = latest.current;
        const ok = run(raw, current);
        if (!ok) inputRef.current?.focus();
        return ok;
      }),
    [],
  );

  const shownError = error || ownError;
  const locked = disabled || readOnly;

  return (
    <Field
      label={label}
      hint={hint}
      error={shownError}
      optionalLabel={optionalLabel}
      disabled={disabled}
      className={className}
    >
      <div className="flex min-w-0 gap-2">
        <Combobox.Root<Country>
          items={countries}
          value={selected ?? null}
          onValueChange={(next) => {
            if (!next) return;
            setCountry(next.code);
            if (text.trim() !== "") check(text, next.code);
            inputRef.current?.focus();
          }}
          itemToStringLabel={(item) => item.name}
          isItemEqualToValue={(a, b) => a.code === b.code}
          filter={(item, query) => matchesCountry(item, query)}
          disabled={locked}
        >
          <Combobox.Trigger
            aria-label={`${messages.country}: ${selected?.name ?? country} ${selected?.dial ?? ""}`}
            className={cn(
              buttonVariants({ variant: "secondary", size }),
              controlRadius[size],
              // Part of the field (0029): field spacing and 16 px text, so the
              // dial code reads as part of the number and the heights match.
              fieldSpacing[size],
              "shrink-0 text-(length:--text-base) font-medium tabular-nums",
              "data-popup-open:shadow-[inset_0_0_0_1px_var(--violet)]",
            )}
          >
            <Flag code={country} />
            <span>{selected?.dial}</span>
            <span className="jb-type-icon text-ink-muted">
              <HugeiconsChevronDownIcon />
            </span>
          </Combobox.Trigger>
          <Combobox.Portal>
            <Combobox.Positioner
              align="start"
              sideOffset={6}
              collisionPadding={16}
              className="z-50 outline-none"
            >
              <Combobox.Popup
                aria-label={messages.country}
                className={cn(
                  "flex w-[min(22rem,var(--available-width))] flex-col overflow-hidden rounded-card bg-card text-ink outline-none",
                  "shadow-[0_0_0_1px_var(--line),var(--shadow-float)]",
                  "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
                  "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
                  "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
                )}
              >
                <div className="border-b border-line p-2">
                  <Combobox.Input
                    placeholder={messages.search}
                    aria-controls={listId}
                    className="jb-field jb-field-md jb-field-box h-(--control-h) w-full rounded-control bg-well text-ink outline-none placeholder:text-ink-subtle focus-visible:shadow-[inset_0_0_0_1px_var(--violet)]"
                  />
                </div>
                <Combobox.Empty className="jb-type text-sm text-ink-muted empty:hidden">
                  {messages.noMatch}
                </Combobox.Empty>
                <Combobox.List
                  id={listId}
                  className="max-h-[min(var(--available-height),18rem)] scroll-py-1 overflow-y-auto overscroll-contain p-1 empty:hidden"
                >
                  {(item: Country) => (
                    <Combobox.Item
                      key={item.code}
                      value={item}
                      className={cn(
                        "jb-type grid min-h-11 cursor-pointer grid-cols-[20px_1fr_auto_1lh] items-center rounded-mark text-base outline-none select-none",
                        "data-highlighted:bg-wash-hover data-selected:font-semibold",
                      )}
                    >
                      <Flag code={item.code} />
                      <span className="min-w-0">{item.name}</span>
                      <span className="text-sm text-ink-muted tabular-nums">
                        {item.dial}
                      </span>
                      {/* A grid cell, not a flex row: the 1lh column already places it, so
                          the pull to --py is dropped. */}
                      <Combobox.ItemIndicator className="jb-type-icon mx-0 text-violet">
                        <HugeiconsCheckIcon />
                      </Combobox.ItemIndicator>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <Input
          ref={inputRef}
          size={size}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={text}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={shownError ? true : undefined}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setText(next);
            // Clear a shown error as soon as the user edits; check on blur.
            if (ownError) setOwnError(null);
            // A pasted or typed `+` number picks its country straight away.
            if (/^(\+|00)/.test(next.trim())) {
              const found = parsePhone(next, country);
              if (found.status !== "empty") setCountry(found.country);
            }
          }}
          onBlur={() => check(text, country)}
          className="flex-1"
        />
      </div>
      {name ? <input type="hidden" name={name} value={e164 ?? ""} /> : null}
    </Field>
  );
}
