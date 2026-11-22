# 08: Regional locales

Status: Done (96/100, 2026-11-22; a real sign-in on `/en-gb` waits on Flovet) · Written: 2026-11-21

## Goal

Move the app from `en` and `fr` to the three regional locales in 0017, so a shared link always opens in the language and region it carries, and people in any country land on the locale that uses their words ("resume" or "CV").

## Decisions

Implements [0017](../docs/decisions/0017-and-cv-naming.md). Builds on [0002](../docs/decisions/0002-project-structure.md) (structure) and the routing from spec 01.

## Acceptance criteria

1. **Locales:** `src/i18n/routing.ts` has the three locales in 0017, default `en-US`, always prefixed, with the lowercase URL prefixes `/en-us`, `/en-gb`, `/fr-fr`. Every existing page and route works under each prefix.
2. **Country mapping:** a pure, tested function maps an `Accept-Language` header to a locale, following 0017's table: English from the US or Canada, or with no region → `en-US`; English from any other region → `en-GB`; any French → `fr-FR`; anything else → `en-US`. The header's quality order is respected (`de-DE, fr;q=0.8` → `fr-FR`).
3. **`/` only:** `/` redirects to the saved locale cookie if valid, else to the mapped locale. A URL that already has a locale is never redirected to another locale, whatever the cookie or header says.
4. **Cookie:** the locale cookie is written only when the user picks a locale in the picker (criterion 7). Visiting a shared `/en-gb/...` link does not change it. Old cookie values `en` and `fr` are read as `en-US` and `fr-FR`.
5. **Old URLs:** `/en/...` and `/fr/...` permanently redirect to `/en-us/...` and `/fr-fr/...`, keeping the path and query.
6. **Messages:** `src/messages/en.json` and `fr.json` stay the full base. `src/messages/en-GB.json` holds only the keys that differ (at least British spelling where the current copy has US spelling, and "CV" wherever the English copy names the document). `getRequestConfig` deep-merges base and override. Tests: the two base files have the same keys; every key in an override exists in its base; the merged `en-GB` messages have every base key.
7. **Picker:** a locale picker lists the three locales, each label in its own language ("English (United States)", "English (United Kingdom)", "Français (France)"). Choosing one goes to the same page in that locale and saves the cookie. Until the app shell exists, it sits at the bottom of the placeholder home page and the privacy page. Copy in the message files.
8. **SEO:** canonical and hreflang alternates (`src/lib/seo.ts`) list the three locales by their tags (`en-US`, `en-GB`, `fr-FR`) with the lowercase URLs, plus `x-default` → `/en-us`. The sitemap lists every public page in every locale. `<html lang>` carries the full tag.
9. **Auth links:** sign-in, the auth callback and confirm routes, the `next` return path (spec 05) and the guard's redirect all keep the user's regional locale. The Supabase redirect allow-list in `supabase/config.toml` still covers the new paths.
10. **Formats:** anything already formatting a date or number uses the full locale, so `en-GB` shows day-first dates.

## Out of scope

`fr-CA`, `en-CA` or any other new locale; a settings page; the final place of the picker (the app shell spec); any copy change beyond `en-GB` overrides; CV language and market (0016, #10).

## Edge cases

- `Accept-Language` missing → `en-US`. `en` alone → `en-US`. `fr-CM`, `fr-CA`, `fr-BE` → `fr-FR`. `en-NG`, `en-ZA`, `en-AU`, `en-IE` → `en-GB`. `en-CA` → `en-US`.
- Mixed or upper case in the URL (`/EN-GB/privacy`): redirect to the lowercase prefix, or return the localised 404. Pick one, test it and note it in the build notes.
- A cookie with an unknown value is ignored.
- An unknown prefix (`/de-de/...`) shows the bilingual global 404, as today.
- The `next` path after sign-in may still carry an old `/en/...` path: it resolves through criterion 5, not to a 404.

## Files and patterns to follow

- `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/proxy.ts` and `src/proxy.test.ts`, `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/messages/`, `src/features/auth/` (links and the `next` check).
- The mapping function and the message merge go in `src/i18n/` with unit tests next to them.
- Read the next-intl routing and middleware docs for the installed version (`localePrefix` with `prefixes`, `localeCookie`, `localeDetection`) and `node_modules/next/dist/docs/` for redirects in the proxy before writing code. If next-intl can't keep the cookie unchanged on a visit (criterion 4) with its own options, handle it in `src/proxy.ts` and say how in the build notes.

## Boundaries

- Always: pages stay static under `cacheComponents` (no `headers()` in pages); the locale comes from the URL segment, as spec 01 built it.
- Ask first: any new dependency (a deep-merge helper is a few lines; write it).
- Never: redirect a URL that already has a valid locale; detect by IP; hard-code a locale string in a component.

## Check

- `pnpm check` passes.
- Unit tests cover the mapping table in the edge cases, the cookie rule and the message merge.
- `curl -I` proof: `/` with `Accept-Language: fr-CM` → `/fr-fr`; `/` with `en-NG` → `/en-gb`; `/en-gb/privacy` with `Accept-Language: fr` and a `fr-FR` cookie → 200, no redirect; `/en/privacy` → 308 to `/en-us/privacy`.
- The page source of `/en-gb/privacy` shows `<html lang="en-GB">` and hreflang links for all three locales and `x-default`.
- Screenshots at 390 px and 1440 px of the picker on the home page, light and dark.
- Sign-in from `/en-gb/sign-in` lands on `/en-gb/home`.
- Reviewer skill run against this spec; score of 90 or more.

## Build notes (2026-11-22)

Choices the build made that no decision spells out.

- **Lowercase locale ids instead of next-intl `prefixes`.** The locales are `en-us`, `en-gb`, `fr-fr`, the same string as the URL segment; `localeTag()` in `src/i18n/locales.ts` gives `en-GB` for `<html lang>`, hreflang and the sitemap. With `prefixes`, every existing `/${locale}/...` link (sign-in, legal pages, auth routes, the `next` check) would have produced `/en-GB/...`; this way they stay correct with no rewrite step. `Intl` accepts the lowercase ids, so dates still follow the region (`en-gb` gives day-first). 0017 names `prefixes` as the mechanism; the URLs, tags and behaviour are exactly as decided.
- **next-intl detection and its cookie are off** (`localeDetection: false`, `localeCookie: false`, `alternateLinks: false`). next-intl 4 rewrites `NEXT_LOCALE` on any document visit whose locale differs (`syncCookie.js`), which would break criterion 4. `/` is chosen in `src/i18n/redirects.ts`; the picker writes the cookie in the browser (one year, `SameSite=Lax`).
- **The mapping is a rule, not a list:** any French → `fr-fr`; English from US, CA or no region → `en-us`; English from any other region → `en-gb`; anything else → `en-us`. Same result as 0017's table for every listed country, and covers countries it doesn't list.
- **Copy:** the base `en.json` now says "resume" and uses US spelling ("canceled"), as 0017 says en-US does; the previous British wording moved to `en-GB.json` unchanged. Nine strings, including privacy and terms text, so a legal review of en-US should note "resume".
- **Overrides of list items** are written as objects keyed by index (`"blocks": { "3": "..." }`), so an override names only the item that differs.
- **Mixed case** (`/EN-GB/...`) redirects (308) to lowercase.
- **Unknown prefix** (`/de-de/x`) behaves as before for unknown paths: next-intl prefixes the default locale (`/en-us/de-de/x`), which renders the localised 404. The spec's edge case said the global 404; this is the same behaviour as `/de/x` before this change.
- **After review:** the privacy policy now says the language cookie "remembers the language you choose" (en and fr); the cookie gets `Secure` on HTTPS; privacy and terms "last updated" moved to 2026-11-22 for the wording changes.
- **Picker placement:** the home page and both legal pages (they share `LegalDocument`).
- **Sitemap** entries also list `x-default`.
- **Not verified here:** a real sign-in from `/en-gb/sign-in` (this worktree has only placeholder Supabase keys). The guard's redirect, the `locale` form field and the callback paths all carry `en-gb`.
