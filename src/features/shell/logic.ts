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

export type CvRowText = {
  /** The headline, or the CV's title when it has none yet. */
  primary: string;
  /** The person's full name; "" when missing or the same as primary. */
  secondary: string;
  /** "Headline | Name": the accessible name and the hover title. */
  full: string;
};

/**
 * What a saved-CV row says (Flovet, 2026-11-25): the headline, then the
 * full name after a "|". Falls back to the title, then to `untitled`, so a
 * row is never blank. Whitespace-only values count as missing.
 */
export function cvRowText(
  cv: { headline: string; name: string; title: string },
  untitled: string,
): CvRowText {
  const headline = cv.headline.trim();
  const name = cv.name.trim();
  const primary = headline || cv.title.trim() || untitled;
  const secondary = name && name !== primary ? name : "";
  return {
    primary,
    secondary,
    full: secondary ? `${primary} | ${secondary}` : primary,
  };
}

/** Resumes the sidebar shows; past this, a "View all" link (0031). */
export const CV_SIDEBAR_MAX = 5;

/** The page shows its search from this many resumes (0031). */
export const CV_SEARCH_FROM = CV_SIDEBAR_MAX + 1;

/** The sidebar's rows, and whether the "View all (N)" link shows. */
export function sidebarCvs<T>(cvs: readonly T[]): {
  shown: T[];
  total: number;
  viewAll: boolean;
} {
  return {
    shown: cvs.slice(0, CV_SIDEBAR_MAX),
    total: cvs.length,
    viewAll: cvs.length > CV_SIDEBAR_MAX,
  };
}

/**
 * Under a minute ago, or a time slightly ahead of the server clock, reads
 * "just now" rather than "12 seconds ago" or "in 2 seconds".
 */
export function editedJustNow(updatedAt: Date, now: Date): boolean {
  return now.getTime() - updatedAt.getTime() < 60_000;
}

/** Case- and accent-insensitive match on headline, name or title. */
export function matchesCv(text: CvRowText, query: string): boolean {
  const fold = (value: string) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
  const q = fold(query.trim());
  return q === "" || fold(text.full).includes(q);
}
