import { isLocale, type Locale } from "@/i18n/locales";

/** The main links of the sidebar (decision 0027), in order. */
export const NAV_ITEMS = [
  { key: "home", path: "/home" },
  { key: "jobs", path: "/jobs" },
  { key: "applications", path: "/applications" },
  { key: "toApprove", path: "/to-approve" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** First-party cookie that remembers a collapsed sidebar (0027). */
export const COLLAPSE_COOKIE = "shell-collapsed";
export const COLLAPSE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Only "1" means collapsed; anything else (missing, garbage) is expanded. */
export function parseCollapsed(value: string | undefined | null): boolean {
  return value === "1";
}

/** "/fr-fr/jobs/123" → "/jobs/123"; "/fr-fr" → "". */
export function pathWithoutLocale(pathname: string): string {
  const [, first = "", ...rest] = pathname.split("/");
  if (!isLocale(first)) return pathname === "/" ? "" : pathname;
  return rest.length && rest.join("/") !== "" ? `/${rest.join("/")}` : "";
}

/**
 * Which main link a path belongs to. A link owns its exact path and the
 * paths under it ("/applications/42"); anything else, such as a CV in the
 * editor or Settings, marks none.
 */
export function activeNav(pathname: string): NavKey | null {
  const path = pathWithoutLocale(pathname);
  const item = NAV_ITEMS.find(
    ({ path: base }) => path === base || path.startsWith(`${base}/`),
  );
  return item?.key ?? null;
}

/** The same page in another locale (shared links never redirect, 0017). */
export function pathInLocale(pathname: string, locale: Locale): string {
  return `/${locale}${pathWithoutLocale(pathname)}`;
}
