import { NextResponse, type NextRequest } from "next/server";

import {
  isLocale,
  legacyLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  localeFromCookie,
} from "./locales";

/**
 * The redirects of decision 0017, before next-intl routes the request:
 *
 * - `/` goes to the saved choice, else the browser's language (307).
 * - Old `/en/...` and `/fr/...` go to `/en-us/...` and `/fr-fr/...` (308).
 * - A locale in the wrong case (`/EN-GB/...`) goes to lowercase (308).
 *
 * A path that already starts with a locale is never sent to another one,
 * whatever the cookie or header says. Null means "no redirect".
 */
export function localeRedirect(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/") {
    const locale =
      localeFromCookie(request.cookies.get(LOCALE_COOKIE)?.value) ??
      localeFromAcceptLanguage(request.headers.get("accept-language"));
    return NextResponse.redirect(new URL(`/${locale}${search}`, request.url));
  }

  const [, segment = "", ...rest] = pathname.split("/");
  if (isLocale(segment)) return null;

  const target = legacyLocale(segment) ?? lowercaseLocale(segment);
  if (!target) return null;

  const path = [target, ...rest].join("/");
  return NextResponse.redirect(new URL(`/${path}${search}`, request.url), 308);
}

function lowercaseLocale(segment: string) {
  const lower = segment.toLowerCase();
  return isLocale(lower) ? lower : null;
}
