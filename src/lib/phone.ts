import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/min";
import examples from "libphonenumber-js/mobile/examples";

import type { Locale } from "@/i18n/locales";

/**
 * Phone numbers (decision 0021). Free typing, no mask: we only read what the
 * user typed, validate it with libphonenumber-js and store E.164.
 */

export type { CountryCode };

const LOCALE_COUNTRY: Record<Locale, CountryCode> = {
  "en-us": "US",
  "en-gb": "GB",
  "fr-fr": "FR",
};

/** The country a phone field starts on, from the site's locale. */
export function defaultCountryFor(locale: Locale): CountryCode {
  return LOCALE_COUNTRY[locale];
}

export type Country = { code: CountryCode; name: string; dial: string };

/**
 * Every country libphonenumber knows, named in the UI language and sorted by
 * that name. Names come from `Intl.DisplayNames`, not a hand-written list.
 */
export function listCountries(languageTag: string): Country[] {
  const names = new Intl.DisplayNames([languageTag], { type: "region" });
  const collator = new Intl.Collator(languageTag);
  return getCountries()
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      dial: `+${getCountryCallingCode(code)}`,
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

/** Lowercase, accents stripped: "Côte" matches "cote". */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Matches a country by name (any part) or by dial code ("+33", "33"). */
export function matchesCountry(country: Country, query: string): boolean {
  const q = fold(query);
  if (q === "") return true;
  const digits = q.replace(/^\+/, "");
  if (/^\d+$/.test(digits)) return country.dial.slice(1).startsWith(digits);
  return fold(country.name).includes(q);
}

export type PhoneResult =
  | { status: "empty" }
  | { status: "valid"; country: CountryCode; e164: string }
  | { status: "invalid"; country: CountryCode };

/**
 * Reads what the user typed. A number starting with `+` (or `00`) carries its
 * own country, which wins: that's how a pasted foreign number switches the
 * country. Otherwise the number is read for the chosen country only; a
 * number that would be valid elsewhere is still an error here.
 */
export function parsePhone(text: string, country: CountryCode): PhoneResult {
  const trimmed = text.trim();
  if (trimmed === "") return { status: "empty" };
  const international = /^(\+|00)/.test(trimmed);
  const input = international ? trimmed.replace(/^00/, "+") : trimmed;
  const parsed = international
    ? parsePhoneNumberFromString(input)
    : parsePhoneNumberFromString(input, country);
  const found = parsed?.country ?? country;
  if (parsed?.isValid() && parsed.country) {
    return { status: "valid", country: parsed.country, e164: parsed.number };
  }
  return { status: "invalid", country: international ? found : country };
}

/** The number in its country's usual national format, for showing back. */
export function formatNational(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatNational() ?? e164;
}

/** The country an E.164 number belongs to, when it's valid. */
export function countryOf(e164: string): CountryCode | undefined {
  return parsePhoneNumberFromString(e164)?.country;
}

/** A sample mobile number for error messages ("like 06 12 34 56 78"). */
export function exampleFor(country: CountryCode): string {
  return getExampleNumber(country, examples)?.formatNational() ?? "";
}
