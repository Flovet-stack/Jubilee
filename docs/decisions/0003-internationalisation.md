# 0003: Internationalisation

- **Status:** Superseded by [0014](0014-regional-locales-and-cv-naming.md)
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Frontend, Copy, UX)
- **Approved:** 2026-11-21 by Flovet
- **Specs:** specs/01-foundations.md

## Context

The brief needs English and French from launch, with more languages later. Two different things are multilingual: the **interface** and the **CVs** a user produces. A French speaker may want an English CV for a job in London.

## Research

| Reference                               | What they do                                                                                                              | Adopt / adapt / reject | Why                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| Next.js docs: `internationalization.md` | `app/[lang]` segment, locale detection in `proxy.ts`, hand-written dictionaries                                           | Adapt                  | Routing model is right; hand-rolled dictionaries lack plurals and formatting |
| next-intl 4.15.3 (npm metadata)         | Supports Next ^16; `[locale]` routing, ICU messages (plurals), dates and numbers, server components; published 2026-11-19 | Adopt                  | The common choice for App Router; maintained                                 |
| AniKansou, FlickVale                    | English only                                                                                                              | n/a                    | No precedent                                                                 |

Sources (opened): `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`; `npm view next-intl` (version, peer dependencies, publish date). next-intl's website was not opened.

## Options

1. **next-intl with a `[locale]` segment.** Pros: plurals, formatting, typed messages. Cons: one dependency.
2. **Next.js built-in pattern (dictionaries).** Pros: no dependency. Cons: we'd rebuild plurals, dates and fallbacks.
3. **Locale per domain.** Cons: one domain for now.

## Decision

Option 1.

- Locales `en` and `fr`; default `en`. URLs `/en/...` and `/fr/...`; `/` redirects by `Accept-Language`, then by the user's saved choice.
- Messages in `src/messages/{en,fr}.json`; no hard-coded UI strings.
- **CV language is data, not the UI locale.** Each CV version stores its own language and market.
- `hreflang` alternates on every public page for SEO.

## Consequences

- Adding a language = one message file plus a review by a native speaker.
- Reviews check: no literal UI strings in components; both message files have the same keys.
