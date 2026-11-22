import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

/**
 * Canonical URL and hreflang alternates for a public page (decision 0003).
 * `path` is the locale-free path: "" for home, "/privacy" for privacy.
 * Relative URLs resolve against `metadataBase` in the root layout.
 */
export function alternatesFor(
  locale: Locale,
  path = "",
): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path}`]),
  );
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

/** Every public page, locale-free, for the sitemap. */
export const publicPaths = ["", "/privacy", "/terms"] as const;
