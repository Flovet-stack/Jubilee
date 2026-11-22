# 0018: Locale ids are the lowercase URL segments

- **Status:** Approved
- **Proposed:** 2026-11-22 by the product team (roles: Tech Lead, Frontend), from the spec 08 build and review
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Supersedes:** the "URLs" sentence of 0017 ("mapped to the tags with next-intl's `prefixes`"); the rest of 0017 stands
- **Specs:** specs/08-regional-locales.md

## Context

0017 says the lowercase URLs (`/en-gb`) are mapped to the BCP 47 tags (`en-GB`) with next-intl's `prefixes` option. With `prefixes`, the code works with `en-GB` and next-intl rewrites each request from `/en-gb`. The app already builds about a dozen links as `/${locale}/...` (sign-in, legal pages, auth callbacks, the `next` check), and each would then produce `/en-GB/...` unless rewritten through a helper. The spec 08 reviewer flagged the build's alternative as a deviation from an approved decision.

## Research

| Reference                                               | What they do                                                                                           | Adopt / adapt / reject | Why                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------- |
| next-intl routing docs (`localePrefix` with `prefixes`) | The `[locale]` segment holds the real locale; the URL shows the mapped prefix; the middleware rewrites | Reject here            | Same URLs, but every hand-built link needs a helper, and a missed one is a broken link |
| Google: localised versions                              | hreflang codes are case-insensitive                                                                    | Adopt                  | A missed `localeTag()` call emits `en-gb`, which is still valid                        |
| MDN / ECMA-402 `Intl`                                   | Locale arguments are case-insensitive                                                                  | Adopt                  | Dates and numbers follow the region with lowercase ids                                 |

Sources: https://next-intl.dev/docs/routing/configuration, https://developers.google.com/search/docs/specialty/international/localized-versions (both opened 2026-11-21 for 0017).

## Decision

The locale ids are the lowercase URL segments: `en-us`, `en-gb`, `fr-fr`. `localeTag()` in `src/i18n/locales.ts` gives the BCP 47 tag (`en-GB`) wherever a tag is needed: `<html lang>`, hreflang and the sitemap. No next-intl `prefixes`.

## Consequences

- Links built as `/${locale}/...` are already the public URL; no rewrite step.
- Any new place that outputs a language tag calls `localeTag()`. Reviews check `<html lang>`, hreflang and sitemap tags are `en-GB` style.
