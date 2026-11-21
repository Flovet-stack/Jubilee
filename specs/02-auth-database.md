# 02: Auth database

Status: Done (96/100, 2026-11-21) · Written: 2026-11-21

## Goal

Set up the Supabase database side of sign-in, so every user who signs in with email, Google or LinkedIn gets exactly one private account row that later features (CVs, applications) can hang off.

## Decisions

Implements [0004](../docs/decisions/0004-auth-database-and-env.md) (data, migrations, types) and [0006](../docs/decisions/0006-account-data-and-email-code.md).

## Acceptance criteria

1. Supabase CLI set up in `supabase/` (`config.toml`) and linked to the `jubilee` project; one migration in `supabase/migrations/` creates `public.profiles`, its RLS policies, the `updated_at` handling and the sign-up trigger exactly as 0006 describes.
2. Local `supabase/config.toml` enables email (OTP), `google` and `linkedin_oidc`, with secrets read from `env(...)`, never written in the file.
3. Migration applied to the remote `jubilee` project; `list_migrations` shows it.
4. `src/types/database.types.ts` generated from the remote schema.
5. SQL tests (or a script in the Check) prove: a new `auth.users` row creates one profile with name and avatar from Google-shaped and LinkedIn-shaped metadata; user A reads and updates only their own row; user B and `anon` read zero rows; deleting the auth user deletes the profile.
6. Supabase security advisors report no issue for `public.profiles`.

## Out of scope

Sign-in screens, the callback route and session code (spec 01 and the sign-in UI spec), custom SMTP, CAPTCHA, any CV or application table.

## Edge cases

- Provider metadata with no name or picture: profile created with nulls, no error (sign-up must never fail because of the trigger).
- Same email via Google then LinkedIn: one user, one profile (automatic linking).
- Email user with an unverified address then Google with the same address: the unconfirmed identity is removed, not linked.

## Files and patterns to follow

- `supabase/migrations/<timestamp>_profiles.sql`; Supabase "User management" trigger pattern.
- `supabase-postgres-best-practices` skill for policy and index style.

## Boundaries

- Always: RLS in the same migration as the table.
- Ask first: any column or table beyond 0006; changing provider settings on the remote project.
- Never: provider secrets in the repo; editing the migration once it has run remotely.

## Check

- `pnpm check` passes.
- RLS test output from criterion 5.
- `get_advisors` (security) output with no `profiles` findings.
- Reviewer skill run against this spec; score of 90 or more.
