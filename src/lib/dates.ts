/**
 * Dates typed by people (decision 0021; formats from 0016: `YYYY`,
 * `YYYY-MM`, `YYYY-MM-DD`). Typing always works: any separator, no leading
 * zeros needed, month names or abbreviations in English and French.
 */

export type Precision = "year" | "month" | "day";

/** Day, month and year order for a typed full date. */
export type DateOrder = "dmy" | "mdy";

export type DateError =
  "incomplete" | "impossible" | "yearMissing" | "beforeMin" | "afterMax";

export type DateResult =
  | { status: "empty" }
  | { status: "valid"; value: string }
  | { status: "invalid"; error: DateError };

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/** Lowercase, accents and trailing dots removed: "Févr." → "fevr". */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\.$/, "");
}

const MONTH_NAMES: string[][] = [
  ["january", "janvier"],
  ["february", "fevrier"],
  ["march", "mars"],
  ["april", "avril"],
  ["may", "mai"],
  ["june", "juin"],
  ["july", "juillet"],
  ["august", "aout"],
  ["september", "septembre"],
  ["october", "octobre"],
  ["november", "novembre"],
  ["december", "decembre"],
];

/**
 * 1–12 for a month name or a prefix of one ("jan", "févr", "sept"), when the
 * prefix points to one month only. "jui" (juin or juillet) is not enough.
 */
export function monthFromName(text: string): number | undefined {
  const word = fold(text);
  if (word.length < 3) return undefined;
  const matches = MONTH_NAMES.flatMap((names, index) =>
    names.some((name) => name.startsWith(word)) ? [index + 1] : [],
  );
  return matches.length === 1 ? matches[0] : undefined;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function daysIn(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseYearPart(part: string): number | undefined {
  if (!/^\d{4}$/.test(part)) return undefined;
  return Number(part);
}

function bounded(
  value: string,
  min: string | undefined,
  max: string | undefined,
): DateResult {
  if (min && value < min) return { status: "invalid", error: "beforeMin" };
  if (max && value > max) return { status: "invalid", error: "afterMax" };
  return { status: "valid", value };
}

/** A typed year: four digits between 1900 and 2100. */
export function parseYear(
  text: string,
  { min, max }: { min?: string; max?: string } = {},
): DateResult {
  const trimmed = text.trim();
  if (trimmed === "") return { status: "empty" };
  const year = parseYearPart(trimmed);
  if (year === undefined) return { status: "invalid", error: "incomplete" };
  if (year < MIN_YEAR || year > MAX_YEAR)
    return { status: "invalid", error: "impossible" };
  return bounded(String(year), min, max);
}

/** A month (1–12, or empty) chosen from a list plus a typed year. */
export function parseMonth(
  month: number | null,
  yearText: string,
  { min, max }: { min?: string; max?: string } = {},
): DateResult {
  const yearTyped = yearText.trim() !== "";
  if (month == null && !yearTyped) return { status: "empty" };
  if (!yearTyped) return { status: "invalid", error: "yearMissing" };
  const year = parseYear(yearText);
  if (year.status !== "valid") return year;
  if (month == null) return { status: "invalid", error: "incomplete" };
  return bounded(`${year.value}-${pad(month)}`, min, max);
}

/** Splits "3 févr 2024", "03/02/2024", "3.2.2024" or "3-2-2024" into parts. */
function parts(text: string): string[] {
  return text
    .trim()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * A typed full date in the locale's order (`dmy` or `mdy`). A month written
 * as a word can sit anywhere: "Feb 3 2024" and "3 février 2024" both work.
 */
export function parseDay(
  text: string,
  order: DateOrder,
  { min, max }: { min?: string; max?: string } = {},
): DateResult {
  const tokens = parts(text);
  if (tokens.length === 0) return { status: "empty" };
  if (tokens.length !== 3) return { status: "invalid", error: "incomplete" };

  const named = tokens.findIndex((token) => /\p{L}/u.test(token));
  let day: string | undefined;
  let month: number | undefined;
  let yearPart: string | undefined;
  if (named !== -1) {
    month = monthFromName(tokens[named] ?? "");
    const rest = tokens.filter((_, index) => index !== named);
    [day, yearPart] = rest;
  } else {
    const [a, b, c] = tokens;
    [day, month, yearPart] =
      order === "dmy" ? [a, Number(b), c] : [b, Number(a), c];
  }

  if (!day || !yearPart || month === undefined || !/^\d{1,2}$/.test(day))
    return { status: "invalid", error: "incomplete" };
  const year = parseYearPart(yearPart);
  if (year === undefined) return { status: "invalid", error: "incomplete" };
  const dayNumber = Number(day);
  if (
    year < MIN_YEAR ||
    year > MAX_YEAR ||
    month < 1 ||
    month > 12 ||
    dayNumber < 1 ||
    dayNumber > daysIn(year, month)
  )
    return { status: "invalid", error: "impossible" };
  return bounded(`${year}-${pad(month)}-${pad(dayNumber)}`, min, max);
}

/** Shows a stored `YYYY-MM-DD` back in the locale's order: 03/02/2024. */
export function formatDay(value: string, order: DateOrder): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return order === "dmy"
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`;
}

/** The order people write full dates in, per locale (0017). */
export function dateOrderFor(languageTag: string): DateOrder {
  return languageTag === "en-US" ? "mdy" : "dmy";
}

/** True when an end comes before its start (same precision, so text order works). */
export function endsBeforeStart(start: string, end: string): boolean {
  return end < start;
}

/** `YYYY-MM-DD` for a local calendar date (DayPicker hands us Dates). */
export function toIsoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A local Date for a stored `YYYY-MM-DD` (noon, so time zones can't shift it). */
export function fromIsoDay(value: string): Date | undefined {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day, 12);
}
