import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { loadMessages } from "./messages";
import { routing } from "./routing";

// Reads the locale from the `[locale]` root segment, so pages stay static
// under cacheComponents (no headers() call, no setRequestLocale).
export default getRequestConfig(async () => {
  const requested = await rootLocale();
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return { locale, messages: await loadMessages(locale) };
});
