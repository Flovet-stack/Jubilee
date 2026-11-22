/**
 * The locales of decision 0017 and how a browser's language reaches them.
 *
 * A locale id is the lowercase URL segment (`/en-gb/...`), so every path
 * built as `/${locale}/...` is already the public URL. `localeTag` gives the
 * BCP 47 tag (`en-GB`) for `<html lang>`, hreflang and `Intl`.
 */

export const locales = ["en-us", "en-gb", "fr-fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en-us";

const TAGS: Record<Locale, string> = {
  "en-us": "en-US",
  "en-gb": "en-GB",
  "fr-fr": "fr-FR",
};

/** Saved only when the user picks a locale (0017), never on a visit. */
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Locales before 0017, still found in old links and cookies. */
const LEGACY: Record<string, Locale> = { en: "en-us", fr: "fr-fr" };

/** English-speaking regions that say "resume" (0017); others say "CV". */
const RESUME_REGIONS = new Set(["US", "CA"]);

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

export function localeTag(locale: Locale): string {
  return TAGS[locale];
}

/** The base message file a locale builds on. */
export function languageOf(locale: Locale): "en" | "fr" {
  return locale.startsWith("fr") ? "fr" : "en";
}

/** `en`/`fr` (old URLs and cookies) to their 0017 locale; null otherwise. */
export function legacyLocale(value: string): Locale | null {
  return LEGACY[value.toLowerCase()] ?? null;
}

/**
 * One language tag (`fr-CM`, `en`, `en-GB`) to a locale, by 0017's table.
 * Null when the language is neither English nor French.
 */
export function localeForTag(tag: string): Locale | null {
  const [language = "", region = ""] = tag.trim().split(/[-_]/);
  switch (language.toLowerCase()) {
    case "fr":
      return "fr-fr";
    case "en":
      return region === "" || RESUME_REGIONS.has(region.toUpperCase())
        ? "en-us"
        : "en-gb";
    default:
      return null;
  }
}

/**
 * An `Accept-Language` header to a locale: the first English or French
 * entry by quality, else the default.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;

  const entries = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag, quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter(({ tag, quality }) => tag !== "" && tag !== "*" && quality > 0)
    // Highest quality first; equal qualities keep the header's order.
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of entries) {
    const locale = localeForTag(tag);
    if (locale) return locale;
  }
  return defaultLocale;
}

/** The saved choice, if it names a locale (old `en`/`fr` included). */
export function localeFromCookie(value: string | undefined): Locale | null {
  if (!value) return null;
  if (isLocale(value)) return value;
  return legacyLocale(value);
}
