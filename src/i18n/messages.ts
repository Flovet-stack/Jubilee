import { languageOf, type Locale } from "./locales";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isObject(value: unknown): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Lays a regional override over its base messages (0017). Objects merge key
 * by key. A list in the base is overridden item by item with an object keyed
 * by index (`"blocks": { "3": "..." }`), so an override names only what
 * differs. Anything else in the override replaces the base value.
 */
export function mergeMessages<T>(base: T, override: unknown): T {
  if (Array.isArray(base) && isObject(override)) {
    const merged: unknown[] = [...base];
    for (const [key, value] of Object.entries(override)) {
      const index = Number(key);
      merged[index] = mergeMessages(merged[index], value);
    }
    return merged as T;
  }
  if (isObject(base) && isObject(override)) {
    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      merged[key] = mergeMessages(merged[key], value);
    }
    return merged as T;
  }
  return (override === undefined ? base : override) as T;
}

const bases = {
  en: () => import("../messages/en.json"),
  fr: () => import("../messages/fr.json"),
};

// Only locales whose words differ from their base have a file (0017).
const overrides: Partial<Record<Locale, () => Promise<{ default: unknown }>>> =
  {
    "en-gb": () => import("../messages/en-GB.json"),
  };

export async function loadMessages(locale: Locale) {
  const base = (await bases[languageOf(locale)]()).default;
  const override = overrides[locale];
  return override ? mergeMessages(base, (await override()).default) : base;
}
