# 0006: Account data and the email sign-in code

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Database Expert, Backend, Product Designer, UX)
- **Approved:** 2026-11-21 by Flovet (in chat, as draft "0005"; renumbered to 0006 because main already had an approved 0005, launch markets)
- **Builds on:** 0004 (sign-in with email magic link, Google and LinkedIn). Supersedes nothing.
- **Specs:** specs/02-auth-database.md

## Context

0004 sets the three sign-in methods (email magic link, Google, LinkedIn). Before the database is set up, the account data behind them needs a decision: what is stored per user, who can read it, and how one person signing in with several providers stays one account. This also settles how the email sign-in message works on phones.

The Supabase project `jubilee` exists (eu-west-1, Postgres 17) and has no tables yet (checked 2026-11-21).

Brief: "Personal data (CVs, contact details) is sensitive: least privilege, RLS on every table, data export and deletion from day one." "Mobile data and mid-range phones are common in launch markets."

## Research

| Reference                                | What they do                                                                                                                                                                        | Adopt / adapt / reject | Why                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Supabase: Sign in with LinkedIn          | Provider `linkedin_oidc`; LinkedIn app needs the "Sign In with LinkedIn using OpenID Connect" product and a LinkedIn Page; callback `https://<ref>.supabase.co/auth/v1/callback`    | Adopt                  | Only supported LinkedIn route. Gives name, email and photo, **not** work history                               |
| Supabase: Sign in with Google            | `signInWithOAuth('google')` with PKCE for server-side apps; client ID and secret live in Supabase                                                                                   | Adopt                  | Already planned in 0004                                                                                        |
| Supabase: Passwordless email sign-in     | One email can carry a magic link and a 6-digit code (`{{ .Token }}`)                                                                                                                | Adapt                  | Code first: works when the email opens on another device or in an in-app browser; the link stays as a shortcut |
| Supabase: Identity linking               | Automatic linking joins identities with the same **verified** email into one user; removes unconfirmed identities to stop pre-account takeover                                      | Adopt                  | One person who uses Google today and LinkedIn tomorrow keeps one account and one CV                            |
| Supabase: User management (profiles)     | `public.profiles` keyed to `auth.users.id`, filled by an `after insert` trigger, `security definer set search_path = ''`                                                            | Adopt                  | Standard pattern; keeps app data out of the `auth` schema                                                      |
| Supabase: Custom SMTP                    | Built-in mailer only sends to project team members, with a low hourly cap and no SLA; production needs custom SMTP (Resend, Postmark, SES, Brevo…); recommends CAPTCHA, prefers OTP | Adopt (as a limit)     | Email sign-in works for Flovet in development only until the transactional email decision is made              |
| Database Expert checklist (product-team) | RLS on, policies scoped `to authenticated`, `(select auth.uid())`, test zero rows for other users                                                                                   | Adopt                  | Brief's least-privilege rule                                                                                   |

Sources (opened 2026-11-21 via the Supabase docs search tool):

- https://supabase.com/docs/guides/auth/social-sign-in/auth-linkedin
- https://supabase.com/docs/guides/auth/auth-identity-linking
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/auth/auth-smtp
- Search results listing https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/social-sign-in/auth-google (titles only; their detail is from 0004's research)

## Options

**Email method**

1. **Email code + magic link, no passwords.** Pros: nothing to forget or leak; Supabase's own guidance prefers OTP against sign-up abuse; the code works across devices. Cons: every sign-in sends an email, so it depends on custom SMTP.
2. **Email + password.** Pros: no email on every sign-in. Cons: reset flow, password storage, credential stuffing; more screens to build.
3. **Both.** Cons: double the flows for an MVP.

**Account data**

1. **One `profiles` row per user, created by trigger, owner-only RLS.** Minimal columns: `id`, `full_name`, `avatar_url`, `created_at`, `updated_at`. Email stays in `auth.users` only (one source of truth).
2. **Copy email and provider data into `profiles`.** Cons: duplicated personal data that can drift; more to delete.

## Decision

Email option 1 and account option 1.

- **Methods:** as in 0004. The magic-link email also shows a 6-digit code, so it works when the email opens on another device or in an in-app browser. No passwords.
- **One account per person:** Supabase's automatic identity linking by verified email stays on; manual linking stays off for now.
- **Profiles:** `public.profiles` as in account option 1. `full_name` and `avatar_url` are filled from provider metadata on sign-up (`full_name` or `name`, `avatar_url` or `picture`) and the user can edit them. `on delete cascade` from `auth.users`, so deleting the auth user deletes the profile (supports the brief's deletion rule).
- **RLS:** enabled; `select` and `update` only for `authenticated` where `id = (select auth.uid())`. No `insert` or `delete` policies (the trigger inserts; deletion goes through `auth.users`). No access for `anon`.
- **Redirect URLs** allowed in Supabase: `http://localhost:3000/**` and the production and Vercel preview origins, ending at the callback from 0004.
- **LinkedIn scope:** sign-in only. It does **not** replace MVP feature 2 (LinkedIn import by paste or PDF); LinkedIn's OIDC gives no work history.

## Consequences

- **Flovet's setup (outside the code):** a LinkedIn app tied to a LinkedIn Page, with the OIDC product approved; the Google OAuth client; both credentials entered in Supabase > Authentication > Providers.
- **Email sign-in is development-only** until the "Transactional email" decision picks an SMTP provider for `jubileecv.com` (SPF, DKIM, DMARC). Until then, real users can only use Google or LinkedIn. CAPTCHA is worth considering in that decision.
- Every later table that holds user data references `profiles.id` (or `auth.users.id`) with `on delete cascade` and its own RLS, so account deletion stays one step.
- Reviews check: RLS on, no `anon` grant, the trigger function has `search_path = ''`, and a second user reads zero rows.
