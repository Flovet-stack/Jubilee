"use client";

import { usePathname } from "next/navigation";

import { TextLink } from "@/components/ui/text-link";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  locales,
  localeTag,
  type Locale,
} from "@/i18n/locales";

/** The current path without its locale segment: "/privacy", or "". */
function pathWithoutLocale(pathname: string): string {
  const [, , ...rest] = pathname.split("/");
  return rest.length ? `/${rest.join("/")}` : "";
}

/** Saves the choice; only an explicit pick does this (0017). */
function remember(locale: Locale) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

export function LocaleLinks({
  current,
  names,
}: {
  current: Locale;
  names: Record<Locale, string>;
}) {
  const path = pathWithoutLocale(usePathname());

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {locales.map((locale) => (
        <li key={locale} lang={localeTag(locale)}>
          {locale === current ? (
            <span aria-current="true" className="font-semibold text-ink">
              {names[locale]}
            </span>
          ) : (
            <TextLink
              href={`/${locale}${path}`}
              hrefLang={localeTag(locale)}
              prefetch={false}
              onClick={() => remember(locale)}
            >
              {names[locale]}
            </TextLink>
          )}
        </li>
      ))}
    </ul>
  );
}
