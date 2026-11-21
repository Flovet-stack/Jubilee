# Project log

One dated entry per task: what was built, the review score, and what was left.

## 2026-11-21: Codebase initialised

- Next.js 16.4.6 scaffold with pnpm, Prettier (Tailwind plugin), ESLint + Prettier config, Vitest and one smoke test; `pnpm check` script.
- Project brief, decision log (0001–0004 Proposed), spec 01 (Blocked on those decisions), product docs, product-team and reviewer skills.
- Left: Flovet to approve 0001–0004; then build spec 01. Design, AI, job sources, payments and email decisions still to research.

## 2026-11-21: Skills moved into .claude/ (issue #2)

- Moved `claude-setup/skills/*` to `.claude/skills/` and `claude-setup/agents/*` to `.claude/agents/`; removed `claude-setup/`. The paths in CLAUDE.md, README and the skills now resolve.
- No spec (tooling only). Not reviewed (no spec to score against).

## 2026-11-21: Decision 0006, launch markets (issue #3)

- Researched and logged 0005 as Proposed: Cameroon and France. Default UI and CV languages set per market. Main risk: no licensed job feed confirmed for Cameroon yet (fallback: saved and pasted jobs).
- Left: Flovet to approve 0001–0005. Sources came from web-search summaries and need re-checking in the job-sources and payments decisions.

## 2026-11-21: Sign-in options and target markets revised (Flovet's input)

- 0004: sign-in is now email magic link, Google and LinkedIn (`linkedin_oidc`). Still Proposed.
- 0005 rewritten: the targets are the US, Canada, the UK, France and six African markets. Rollout is phased: France + US (MVP), then UK + Canada, then Africa one country at a time. Brief, MVP doc and index updated to match.
- Left: Flovet to approve 0001–0005; issue #9 (sign-in) scope updated to include LinkedIn.

## 2026-11-21: Decisions 0001–0005 approved (issues #1, #3)

- Flovet approved 0001–0005. Status lines, index and brief updated; spec 01 (Foundations) set to Ready.
- Left: build spec 01 (#6).

## 2026-11-21: Spec 02, auth database (96/100)

- Decision 0006 approved by Flovet (drafted as 0005, renumbered after main's 0005 landed). 0006: sign-in with email code, Google or LinkedIn; one `profiles` row per user.
- Migration `20261121033326_profiles` applied to the `jubilee` project: `public.profiles`, owner-only RLS (select and update for `authenticated`), no `anon` access, sign-up trigger filling name and photo from Google or LinkedIn metadata, `on delete cascade`.
- `supabase/tests/profiles.sql` passed on the remote project (rolled back, no data left). Security and performance advisors: no findings. Types in `src/types/database.types.ts`. `supabase/config.toml` enables email, `google` and `linkedin_oidc` with secrets from env.
- Not in 0006 but built: name capped at 200 characters and avatar URL at 2,048, so a long provider value can't block sign-up.
- Left for Flovet: `npx supabase login` and `npx supabase link --project-ref ylxywgfnfgopiielyqgn`; create the LinkedIn app (OIDC product, LinkedIn Page) and the Google client; enter both in Supabase > Authentication > Providers; add the redirect URLs. Email sign-in reaches team members only until custom SMTP is decided.
