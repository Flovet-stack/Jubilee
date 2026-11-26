import "server-only";

/**
 * Removes contact details before text leaves for a provider (0036 rule 9):
 * email addresses, phone numbers and street addresses, in every string of a
 * task's input. Errs on removing too much: no task needs any of them.
 */
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu;

// +33 6 12 34 56 78, (555) 123-4567, 06.12.34.56.78. Kept only if it has
// fewer than 9 digits, so year ranges like "2019 - 2023" survive.
const PHONE =
  /(?<![\p{L}\p{N}])(?:\+|00)?\(?\d[\d\s().-]{6,}\d(?![\p{L}\p{N}])/gu;

// Street addresses, to the end of the line or the next comma. Only words that
// rarely mean anything else in a CV ("way", "place", "drive" are left out).
// French: the street word follows the number ("12 bis rue de la Paix").
const FR_STREET = new RegExp(
  String.raw`(?<![\p{L}\p{N}])\d{1,4}(?:\s?(?:bis|ter))?,?\s+(?:rue|avenue|boulevard|chemin|allée|impasse|quai)(?![\p{L}])[^\n,;]*`,
  "giu",
);
// English: one to three capitalised words, then the street word
// ("221B Baker Street", "48 Maple Lane").
const EN_STREET = new RegExp(
  String.raw`(?<![\p{L}\p{N}])\d{1,5}[A-Za-z]?\s+(?:\p{Lu}[\p{L}'.-]*\s+){1,3}(?:Street|St\.|Road|Rd\.|Lane|Avenue|Ave\.|Boulevard|Blvd\.?)(?![\p{L}])[^\n,;]*`,
  "gu",
);

export const REDACTED = "[removed]";

export function stripContactDetails(text: string): string {
  return text
    .replace(EMAIL, REDACTED)
    .replace(FR_STREET, REDACTED)
    .replace(EN_STREET, REDACTED)
    .replace(PHONE, (match) =>
      match.replace(/\D/g, "").length >= 9 ? REDACTED : match,
    );
}

export function redactDeep<T>(value: T): T {
  if (typeof value === "string") return stripContactDetails(value) as T;
  if (Array.isArray(value)) return value.map((item) => redactDeep(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, redactDeep(child)]),
    ) as T;
  }
  return value;
}
