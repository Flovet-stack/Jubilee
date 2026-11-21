import { defineRouting } from "next-intl/routing";

// Decision 0003: English and French, English by default, always prefixed.
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
