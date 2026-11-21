# 0001: Stack and tooling

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Frontend, Backend, PM)
- **Approved:** 2026-11-21 by Flovet
- **Specs:** specs/01-foundations.md

## Context

Flovet asked for a new Next.js project "with the best structure for this based on our current and future needs", consistent with FlickVale and AniKansou. Jubilee needs accounts, a relational store for CVs and applications, server-side AI calls, scheduled work (alerts, follow-ups), two UI languages, and later a browser extension.

## Research

| Reference                                                | What they do                                                                                                                     | Adopt / adapt / reject | Why                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| FlickVale (local repo)                                   | Next.js 16.4.6, React 19.3, Tailwind 4.3 via `@tailwindcss/turbopack`, pnpm 11, Prettier + Tailwind plugin, Vitest, `pnpm check` | Adopt                  | Same owner, same tooling, proven together                        |
| AniKansou (local repo)                                   | Adds Supabase (`@supabase/ssr`), `@t3-oss/env-nextjs` + zod, husky + lint-staged, Playwright, PostHog                            | Adapt                  | Supabase and env validation fit; the rest when a spec needs them |
| `create-next-app@16.4.6` scaffold                        | App Router, `src/`, TypeScript, Tailwind 4, `cacheComponents` and `partialPrefetching` on                                        | Adopt                  | Current defaults                                                 |
| npm registry (2026-11-21)                                | Latest: next 16.4.6, vitest 5.1.1, prettier 3.10.1, @supabase/ssr 0.12.7, zod 4.6.7                                              | Adopt                  | Pinned to these                                                  |
| Next.js bundled docs: `ai-agents.md`, `data-security.md` | Version-matched docs in `node_modules/next/dist/docs/`; recommend a Data Access Layer with `server-only`                         | Adopt                  | AGENTS.md points agents at them; DAL shapes 0002                 |

Sources (opened): local FlickVale and AniKansou `package.json`, `CLAUDE.md`, configs; `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`, `data-security.md`; `npm view` output.

## Options

1. **Next.js 16 + Supabase + Vercel (same as AniKansou).** Pros: known stack, auth and Postgres in one, free tiers, RLS for personal data. Cons: Supabase lock-in for auth.
2. **Next.js + Postgres (Neon) + Auth.js.** Pros: portable. Cons: more parts to run; new to this owner.
3. **Remix / other framework.** Cons: breaks consistency with the other projects for no gain.

## Decision

Option 1.

- **Framework:** Next.js 16.4.6 (App Router, `cacheComponents`, `partialPrefetching`), React 19.3, TypeScript strict with `noUncheckedIndexedAccess`, Tailwind CSS 4.3, pnpm 11.
- **Quality:** ESLint (`eslint-config-next` + `eslint-config-prettier`), Prettier with the Tailwind plugin, Vitest. `pnpm check` runs all of them plus `next build`.
- **Backend:** Supabase (Postgres, Auth, Storage for CV files), detailed in 0004.
- **Hosting:** Vercel. Nothing in the code depends on it beyond standard Next.js.
- **Added when a spec needs them, each with a decision:** Playwright (E2E), husky + lint-staged, analytics, email, AI SDK, payments.

## Consequences

- Same commands and conventions as FlickVale and AniKansou.
- Reviews check: no dependency outside this list or a later approved decision; no `any`.
