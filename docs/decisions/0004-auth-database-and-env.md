# 0004: Auth, database and environment

- **Status:** Proposed
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Backend, Database Expert)
- **Approved:**
- **Specs:** specs/01-foundations.md

## Context

Flovet is creating a Supabase project, a Google OAuth client, a LinkedIn app, Vercel deployments and a Search Console property. Jubilee stores CVs, contact details and application history: personal data that must be private per user.

## Research

| Reference                                             | What they do                                                                                                                                                       | Adopt / adapt / reject | Why                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------- |
| AniKansou `src/lib/supabase/*`, `src/proxy.ts`        | `@supabase/ssr` browser and server clients; `proxy.ts` refreshes the session cookie; publishable key only                                                          | Adopt                  | Working pattern on this Next.js version                                          |
| AniKansou `src/env.ts`                                | `@t3-oss/env-nextjs` + zod: build fails on missing env                                                                                                             | Adopt                  | Catches missing Vercel env before deploy                                         |
| FlickVale decision 0019                               | Email + password and Google sign-in through Supabase                                                                                                               | Adapt                  | Google and LinkedIn instead of passwords; email magic link for everyone else     |
| Supabase docs: Sign in with LinkedIn                  | `linkedin_oidc` provider (scopes `openid profile email`); callback `https://<project-ref>.supabase.co/auth/v1/callback`; the old `linkedin` provider is deprecated | Adopt                  | LinkedIn is where job seekers already have a profile; OIDC is the supported path |
| Next.js docs: `authentication.md`, `data-security.md` | Check auth in the DAL, not only in the proxy                                                                                                                       | Adopt                  | The proxy refreshes sessions; queries enforce access                             |

Sources (opened): https://supabase.com/docs/guides/auth/social-sign-in/auth-linkedin and https://supabase.com/changelog/19204-linkedin-oauth-provider-deprecated-in-favour-of-linkedin-oidc-provider (via web-search summary, 2026-11-21); AniKansou `src/env.ts`, `src/proxy.ts`, `src/lib/supabase/server.ts`, `browser.ts`; FlickVale decision index; Next.js bundled `data-security.md`.

## Options

1. **Supabase Auth (Google, LinkedIn and email magic link), Postgres with RLS, `@supabase/ssr`.** Pros: matches AniKansou; RLS protects data even if app code is wrong. Cons: Supabase-specific.
2. **Auth.js + Supabase Postgres.** Cons: two systems for one job.

## Decision

Option 1.

- **Sign-in:** three options, chosen by Flovet on 2026-11-21: email magic link, Google OAuth, and LinkedIn (`linkedin_oidc`, scopes `openid profile email`). OAuth client IDs and secrets live in Supabase, not in the app.
- **LinkedIn sign-in is identity only.** It returns name, email and photo, not work history, so it doesn't replace LinkedIn import (a separate decision, #12). Callback at `/[locale]/auth/callback`.
- **Data:** Postgres in Supabase. RLS on every table, owner-only by default. Migrations in `supabase/migrations/` via the Supabase CLI; generated types in `src/types/database.types.ts`.
- **Files:** CV uploads and PDFs in a private Supabase Storage bucket, owner-only.
- **Keys:** the publishable key in the app; the secret key only in server-only code for cron and webhooks, never `NEXT_PUBLIC_`.
- **Env:** validated with `@t3-oss/env-nextjs` + zod in `src/env.ts`. `.env.example` lists every variable.
- **Search Console:** DNS verification preferred; an optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` meta tag otherwise.

## Consequences

- Every new table needs an RLS policy in the same migration (reviews check this).
- Accounts with the same verified email across providers are linked by Supabase; the sign-in spec tests Google + LinkedIn with one email.
- A data export and account deletion path is needed before launch (privacy decision, still to come).
