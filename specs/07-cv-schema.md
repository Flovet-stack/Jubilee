# 07: CV schema, RLS and data access

Status: Ready · Written: 2026-11-22 · Issue: #10

## Goal

Store CVs, their tailored versions and their history safely, with one validated content shape, so the builder, import, tailoring and export all build on the same model. No screens.

## Decisions

Implements [0013](../docs/decisions/0013-cv-data-model-and-pdf-rendering.md) (tables, content, revisions; not the PDF part). Builds on [0002](../docs/decisions/0002-project-structure.md), [0006](../docs/decisions/0006-account-data-and-email-code.md) (owner-only RLS, cascade from `profiles`) and [0014](../docs/decisions/0014-regional-locales-and-cv-naming.md) ("CV" in code and data).

## Acceptance criteria

1. **Migration:** one new migration in `supabase/migrations/` creates `public.cvs`, `public.cv_versions` and `public.cv_revisions` with the columns in 0013. `language` is checked to `en` or `fr`, `market` to `FR` or `US`, `source` to `user`, `ai`, `import` or `restore`. `content` is capped at 256 kB by a check constraint. Each table has an index on `user_id`; `cv_versions` on `cv_id`; `cv_revisions` on `(cv_id, created_at)` and `(cv_version_id, created_at)`.
2. **Keys:** `user_id` references `profiles(id) on delete cascade` on all three tables. `cv_versions.cv_id` is `on delete set null`. `cv_revisions` points at exactly one of `cv_id` or `cv_version_id` (check constraint), each `on delete cascade`. `job_id` on `cv_versions` is a nullable `uuid` with no foreign key yet.
3. **Ownership can't be faked:** a row's `user_id` must equal `(select auth.uid())` on insert; a version's `cv_id` and a revision's parent must belong to the same user (enforced in the database, not only in `actions.ts`).
4. **RLS:** enabled on all three tables; policies `to authenticated` with `(select auth.uid()) = user_id`; `select`, `insert`, `update`, `delete` on `cvs` and `cv_versions`; `select` and `insert` only on `cv_revisions` (append-only). No grants to `anon`. `updated_at` kept current with the existing `set_updated_at()` trigger.
5. **Content schema:** `src/features/cv/schemas.ts` defines the content with Zod as 0013 describes (`basics`, ordered `sections` with `id`, `kind`, `hidden`, `entries` with `id`s; partial ISO dates `YYYY` or `YYYY-MM`; no end date = current). Exports the TypeScript type and `CV_SCHEMA_VERSION = 1`. Field names follow JSON Resume where it has one.
6. **Data access** (`src/features/cv/queries.ts`, `actions.ts`, per 0002): list the user's CVs; get one CV or version; create a CV (empty content, language and market given); update a CV's or version's content (validates with Zod, rejects invalid content with a typed error, never writes partial content); create a version from a CV (copies content); add a revision; list revisions; restore a revision (writes the content and appends a `restore` revision); delete a CV or version. Every function returns a typed result, never throws to the caller for expected failures.
7. **Types:** `src/types/database.types.ts` regenerated from the remote schema after the migration.
8. **SQL tests** in `supabase/tests/cvs.sql` (same pattern as `profiles.sql`) prove: user A can do each allowed action on their rows; user B and `anon` read zero rows and can't insert, update or delete A's rows; nobody can update or delete a revision; a version can't point at another user's CV; deleting the auth user deletes all three tables' rows; deleting a CV keeps its versions with `cv_id` null.
9. **Unit tests** for the Zod schema: a full valid CV passes; bad dates, unknown `kind`, duplicate entry `id`s and over-long fields fail; the empty CV used by "create" passes.
10. **Advisors:** Supabase security and performance advisors show no new finding for the three tables.

## Out of scope

Any screen or route; the PDF and react-pdf (#15); AI proposals and how they're shown (#11, #20); LinkedIn import (#16); country format rules (#13); jobs tables and the `job_id` foreign key (#25); data export (#36).

## Edge cases

- Content that passes Zod but exceeds 256 kB: the database rejects it and the action returns a clear error.
- Two tabs saving the same CV: last write wins (one owner, 0013); `updated_at` changes. No locking.
- Restoring a revision whose `schema_version` is older than `CV_SCHEMA_VERSION`: with only version 1 there's nothing to migrate, but restore goes through one `migrateContent` function so version 2 has a place to go.
- A user with no CVs: list returns an empty array, not an error.

## Files and patterns to follow

- `supabase/migrations/20261121033326_profiles.sql` for grants, RLS style, `search_path = ''` on functions and comments.
- `supabase/tests/profiles.sql` for the SQL test pattern.
- `src/features/auth/{queries,actions,schemas}.ts` for the data-access shape and result types.
- Supabase RLS docs and the Database Expert checklist in the product-team skill.

## Boundaries

- Always: RLS on every table; `(select auth.uid())` in policies; functions `security invoker` unless a reason is written next to it.
- Ask first: applying the migration to the remote project (CLAUDE.md: schema changes); any dependency.
- Never: edit the profiles migration; give `anon` any grant; write `content` without Zod validation; use `any` or `@ts-ignore`.

## Check

- `pnpm check` passes.
- Output of the SQL tests in criterion 8.
- `list_migrations` shows the new migration on the remote project, after Flovet's go-ahead.
- `get_advisors` (security and performance) output.
- Reviewer skill run against this spec; score of 90 or more.
