# 0002: Project structure

- **Status:** Proposed
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Frontend, Backend)
- **Approved:**
- **Specs:** specs/01-foundations.md

## Context

The MVP has ten features that share data (CV, versions, applications). Later work adds a browser extension (autofill, save jobs), background jobs (alerts, follow-ups) and more markets. The structure must keep features separate, keep personal data behind one access layer, and not block those future pieces.

## Research

| Reference                                | What they do                                                                                                                                        | Adopt / adapt / reject | Why                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| Next.js docs: `02-project-structure.md`  | `src/` optional; route groups `(group)` for layouts without URL changes; files can live outside `app`                                               | Adopt                  | Route groups split marketing, auth and app shells             |
| Next.js docs: `data-security.md`         | A Data Access Layer: `server-only` modules that do auth checks and return minimal DTOs                                                              | Adopt                  | CVs and contact details are sensitive                         |
| AniKansou `src/` and `eslint.config.mjs` | `src/app` routes only; `src/features/<name>/{queries,actions,schemas,components}`; ESLint bans Supabase imports outside `queries.ts` / `actions.ts` | Adopt                  | Proven; the lint rule enforces the DAL instead of trusting it |
| FlickVale spec 01                        | `src/components/` shared UI, `src/features/` feature code, tokens only                                                                              | Adopt                  | Consistency                                                   |
| Monorepo (pnpm workspaces + Turborepo)   | Separate `apps/web`, `apps/extension`, `packages/*`                                                                                                 | Defer                  | No second app exists yet; adds build config for nothing today |

Sources (opened): `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`, `02-guides/data-security.md`; AniKansou `src/` tree and `eslint.config.mjs`; FlickVale `specs/01-foundations.md`.

## Options

1. **Single app, feature folders, lint-enforced data access.** Pros: simple, proven in AniKansou. Cons: a later move to a monorepo.
2. **Monorepo now.** Pros: extension-ready. Cons: overhead for months before the extension exists.
3. **Colocate everything under `app/`.** Cons: features leak across routes; harder to enforce the DAL.

## Decision

Option 1:

```
src/
  app/
    [locale]/            (0003)
      (marketing)/       public pages: home, pricing, legal
      (auth)/            sign-in, callback
      (app)/             signed-in product: cv, jobs, tracker, settings
    api/                 route handlers (webhooks, cron) only
  features/<feature>/    cv, tailoring, jobs, applications, follow-ups, billing…
    queries.ts           server-only reads (the only Supabase reads)
    actions.ts           server actions (the only Supabase writes)
    schemas.ts           zod schemas
    logic.ts             pure functions, unit-tested
    components/          the feature's UI
  components/ui/         shared UI primitives
  lib/                   supabase clients, env, seo, utils
  i18n/                  routing and request config (0003)
  messages/              en.json, fr.json (0003)
supabase/migrations/     SQL migrations
```

- ESLint bans `@/lib/supabase/*` outside `features/*/queries.ts`, `actions.ts` and `src/proxy.ts`.
- Features import each other only through their `queries.ts` / `actions.ts` / `schemas.ts`, never another feature's components.
- **Move to a monorepo** (`apps/web`, `apps/extension`, `packages/core` for shared schemas and CV logic) when the browser-extension spec starts. Keeping pure logic in `logic.ts` and `schemas.ts` makes that move a file copy.

## Consequences

- Every feature has the same shape, so specs can name files exactly.
- Reviews check: no Supabase import outside the allowed files; no cross-feature component imports.
