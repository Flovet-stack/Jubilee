# 0014: Regional locales and what we call a CV

- **Status:** Proposed
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Frontend, Copy, Product Designer, UX)
- **Approved:**
- **Supersedes:** 0003 (internationalisation)
- **Specs:** none yet (a follow-up to spec 01 moves the routing to these locales)

## Context

0003 set two locales, `en` and `fr`. Flovet wants regional locales from the start:

- **Shared links:** a link someone shares (`/en-gb/...`) must open in the same language and region for whoever receives it.
- **Many countries now:** people outside the launch markets (0005) can use Jubilee in their own regional English or French, even before Jubilee supports their country's CV format or job sources.

The word also differs by country: resume.io calls it "Resume Builder" on its international site, "CV Builder" on its UK site and "CV" on its French site. Flovet agreed in chat that the code and data say "CV", and the screen uses the word each country uses.

## Research

| Reference                             | What they do                                                                                                                                                                                                                                                                                                                          | Adopt / adapt / reject       | Why                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Google: localised versions (hreflang) | Codes are ISO 639-1 language plus optional ISO 3166-1 region (`en-GB`), case-insensitive; "UK" is not a valid region, use `GB`; each version lists itself and all others; `x-default` for users no version matches, designed for selector pages; same-language regional variants are a normal hreflang case                           | Adopt                        | Defines our locale tags and alternates                                                           |
| Google: multi-regional sites          | Subdirectories are easy and low-maintenance; parameters not recommended; avoid automatic redirects between versions; don't adapt by IP (Googlebot crawls from the US with no `Accept-Language`); show links to other versions                                                                                                         | Adopt                        | Subdirectory URLs, no redirect on deep links, a visible picker                                   |
| Stripe                                | `/en-gb` entry, `/gb/...` inside; footer "United Kingdom (English)"                                                                                                                                                                                                                                                                   | Adapt                        | Lowercase language-region in the URL reads well and is unambiguous                               |
| Apple                                 | `/uk/`, country only, a "Choose your country or region" page                                                                                                                                                                                                                                                                          | Reject (URL), adopt (picker) | Country-only codes can't express English vs French in Canada or Cameroon                         |
| Notion                                | Language-region codes (`/en-GB`, `/en-US`, `/es-ES`), footer picker labelled "Français (France)"                                                                                                                                                                                                                                      | Adopt                        | Same model we need; picker labelled in the language itself                                       |
| Airbnb                                | Country domain (`.co.uk`), "Languages & currency" picker                                                                                                                                                                                                                                                                              | Reject                       | One domain per country is costly (Google's table) and we have one domain                         |
| resume.io / cvapp.fr / Kickresume     | "Resume Builder" (international, US), "CV Builder" (UK), "CV" (France), "Resume Builder" (Kickresume)                                                                                                                                                                                                                                 | Adopt                        | The noun follows the country, not just the language                                              |
| next-intl routing docs                | `localePrefix: { mode, prefixes }` maps a locale (`en-GB`) to any URL prefix (`/en-gb`); detection order is URL, cookie, `Accept-Language`, default; best-fit matching weighs region (so `en-AU` can match `en-GB`); `alternateLinks` on by default with `x-default`; messages can be merged from a base locale in `getRequestConfig` | Adopt                        | Supports everything here without a new dependency; the base-plus-override merge is ours to write |

Sources (opened 2026-11-21):

- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://stripe.com/en-gb, https://www.apple.com/uk/, https://www.notion.com/fr-fr, https://www.airbnb.co.uk/
- https://resume.io/, https://resume.io/uk, https://cvapp.fr/, https://www.kickresume.com/
- https://next-intl.dev/docs/routing/configuration, https://next-intl.dev/docs/usage/configuration, https://next-intl.dev/docs/routing/middleware

Tried and failed: Canva's regional pages (403), Indeed's local sites (403/404), Zety (timed out).

## Options

1. **Keep `en` and `fr`; add regional locales when each market launches.** Pros: nothing to do now. Cons: shared links carry no region; URLs change later; non-target countries get US English.
2. **A locale for every country now (11), each with its own full message file.** Cons: 11 files to keep in sync by hand, mostly identical.
3. **Regional locales now, only where the words differ (three), on two base message files with small regional overrides.** Pros: one place to write copy per language; a region only lists the words that differ. Cons: a merge step and a test to write.

## Decision

Option 3. Supersedes 0003.

**Locales: three to start** (BCP 47 tags, as in hreflang). A country gets its own locale only when its words differ from the one it maps to, or when it launches as a market with its own content (job sources, prices).

| Locale  | Says on screen         | Also serves (by browser language, until they need their own)                                         |
| ------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `en-US` | "resume", US spelling  | Canada (`en-CA`) and any English with no region                                                      |
| `en-GB` | "CV", British spelling | Nigeria, Kenya, South Africa, Ireland, Australia, and other English-speaking countries that say "CV" |
| `fr-FR` | "CV"                   | Canada (`fr-CA`), Cameroon, Côte d'Ivoire, Senegal, Belgium, Switzerland, and any French             |

Sending `en-CA` to `en-US` ("resume") is an assumption (no Canadian source was opened); the Copy review checks it with a Canadian reader. Likely next locales: `fr-CA` (Québec terms such as "courriel") and `en-CA` when Canada launches (0005 phase 2). Adding one is one line in the routing and one small override file.

**URLs:** lowercase prefixes, `/en-us/...`, `/en-gb/...`, `/fr-fr/...`, mapped to the tags with next-intl's `prefixes`. Always prefixed.

**Shared links and detection:**

- A URL with a locale always opens in that locale. No redirect on deep links, no IP detection (Google).
- Only `/` chooses: saved choice (cookie) first, then `Accept-Language` mapped by the table above (an explicit country list in code, tested, rather than relying only on next-intl's best-fit matching, whose result for `fr-CM` the docs don't show), then `en-US`.
- The cookie is set only when the user picks a locale, not on every visit, so opening someone's shared link doesn't change your own default.
- A visible picker (country and language, each label in its own language, as Notion) in the footer and settings.

**Messages:** `src/messages/en.json` and `fr.json` hold every key (written in US English and France French). `src/messages/<locale>.json` overrides only the keys that differ (`en-GB`: "CV", "organise"; `fr-FR` has none, since it is the base). `getRequestConfig` deep-merges base and override. Tests: base files have the same keys; an override only contains keys that exist in its base.

**Formats:** dates and numbers follow the locale through `Intl` (`en-GB` gives 21/11/2026, `en-US` 11/21/2026).

**Unchanged from 0003:** no hard-coded UI strings; hreflang alternates on every public page (now one per locale, plus `x-default` to `/en-us`); **CV language and market are data, not the UI locale** (0013 stores them per CV). The UI locale only suggests the defaults for a new CV.

**What "supported" means outside the launch markets:** the interface works in the person's regional language now. CV format rules (#13) and job sources (#22) stay limited to the markets in 0005; elsewhere the builder offers the nearest supported format and says so.

**Naming:** code, data and docs say "CV" (`cvs`, `cv_versions`). Only the `en-US` messages say "resume".

## Consequences

- A follow-up to spec 01 changes `src/i18n/routing.ts` and `request.ts`, the proxy and its tests, the sitemap's hreflang, the messages tests, and every `/en` or `/fr` link (spec 04's privacy page, spec 05's sign-in, the Supabase redirect URLs and email template links).
- `/en/...` and `/fr/...` are already live in development only, so there are no public URLs to redirect yet. If any were shared, a permanent redirect from `/en` to `/en-us` and `/fr` to `/fr-fr` keeps them working.
- Three locales keep the static build close to today's (two locales). Each new locale adds one set of static pages.
- Someone in Cameroon sees `/fr-fr/` in the URL and France's French. Acceptable while the words are the same; their own locale comes when the copy or content differs.
- Copy is still written twice (en, fr); regional files stay small. A native reader checks each regional override before that country launches.
- Reviews check: every route works under every locale; deep links never redirect; the cookie changes only on an explicit choice; hreflang lists the three locales and `x-default`; each country in the table maps to its locale (tested); no override key is missing from its base.
