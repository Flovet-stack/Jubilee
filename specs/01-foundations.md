# 01: Foundations

Status: Done (92/100, 2026-11-21) · Written: 2026-11-21

## Goal

Give every later feature the same base: the folder structure, validated environment, English and French routing, Supabase clients with session refresh, and SEO basics, so feature specs only add feature code.

## Decisions

Implements [0001](../docs/decisions/0001-stack-and-tooling.md), [0002](../docs/decisions/0002-project-structure.md), [0003](../docs/decisions/0003-internationalisation.md), [0004](../docs/decisions/0004-auth-database-and-env.md).

## Acceptance criteria

1. Dependencies added exactly as named in 0003 and 0004: `next-intl`, `@supabase/ssr`, `@supabase/supabase-js`, `@t3-oss/env-nextjs`, `zod`, `server-only`.
2. `src/env.ts` validates `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. `pnpm build` fails with a clear message when a required one is missing.
3. Routing: `src/app/[locale]/` with `(marketing)`, `(auth)` and `(app)` groups; `/` redirects to `/en` or `/fr` by `Accept-Language`; an unknown locale returns the not-found page.
4. `src/messages/en.json` and `fr.json` hold every string on the placeholder pages; a unit test fails if their keys differ.
5. `src/lib/supabase/{browser,server}.ts` and `src/proxy.ts` refresh the Supabase session (pattern from AniKansou) and run next-intl's locale handling in the same proxy.
6. ESLint enforces 0002's import rule; a test file importing `@/lib/supabase/server` from a component fails `pnpm lint`.
7. `robots.ts`, `sitemap.ts` (both locales, with `hreflang` alternates) and the optional Search Console meta tag.
8. Placeholder home pages at `/en` and `/fr`, replacing the temporary `src/app/page.tsx`.

## Out of scope

Sign-in screens, any database table, design tokens and fonts, any feature.

## Edge cases

- `Accept-Language: fr-CM` resolves to `fr`; an unsupported language falls back to `en`.
- A missing Supabase env var on Vercel fails the build, not the first request.

## Files and patterns to follow

- Structure exactly as in 0002.
- AniKansou `src/env.ts`, `src/proxy.ts`, `src/lib/supabase/*` as references.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and `02-guides/internationalization.md` first.

## Boundaries

- Always: Server Components unless a client reason is named.
- Ask first: any dependency not in criterion 1.
- Never: the Supabase secret key in client code.

## Check

- `pnpm check` passes.
- `curl -I` on `/` with `Accept-Language: fr` shows a redirect to `/fr`.
- Reviewer skill run against this spec; score of 90 or more.

## Build notes (2026-11-21)

Choices the build made that no decision spells out. None changes a decision; the first two are worth confirming.

- **Locale order:** URL prefix, then the saved `NEXT_LOCALE` cookie, then `Accept-Language` (next-intl's order). 0003 lists `Accept-Language` before the saved choice; a saved choice winning is the usual behaviour. Confirm, or ask for a 0003 amendment.
- **Session refresh on every page request:** next-intl has to run on every page, so the Supabase refresh shares that pass. AniKansou limits it to signed-in areas. With no `sb-` cookie, `getClaims` makes no network call. The refresh runs first and writes the new cookies onto the request, so Server Components in the same request see the fresh token (`src/proxy.test.ts`).
- **Root layout under `[locale]`**, read with `next/root-params`, so pages stay static under `cacheComponents` (next-intl's `setRequestLocale` is deprecated). `/design-system` moved to `/[locale]/design-system`.
- **404s:** `[locale]/[...rest]` makes unknown paths under a locale render the localised `[locale]/not-found.tsx`; `app/global-not-found.tsx` (experimental `globalNotFound` flag, the case its docs describe) covers URLs with no locale and shows both languages.
- **`pnpm-workspace.yaml`:** build scripts off for `@parcel/watcher` and `@swc/core`, pulled in by next-intl.
