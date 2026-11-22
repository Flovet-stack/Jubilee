import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "./locales";

// Decision 0017: three regional locales, always prefixed. The proxy picks
// the locale for `/` itself (src/proxy.ts), so next-intl neither detects
// nor writes the cookie: a visit to a shared link never changes the saved
// choice. hreflang comes from page metadata (src/lib/seo.ts).
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});

export type { Locale } from "./locales";
