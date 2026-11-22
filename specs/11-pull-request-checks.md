# 11: Pull request checks

Status: In progress · Written: 2026-11-22

## Goal

Every pull request to `main` runs `pnpm check` on GitHub, so a broken format, lint, type, test or build shows up before merge instead of after (issue #7).

## Decisions

Implements [0023](../docs/decisions/0023-pull-request-checks.md). Builds on [0001](../docs/decisions/0001-stack-and-tooling.md) (pnpm 11, `pnpm check`) and [0004](../docs/decisions/0004-auth-database-and-env.md) (`src/env.ts`).

## Acceptance criteria

1. `.github/workflows/check.yml` exists and follows 0023: triggers, runner, timeout, permissions, concurrency, setup, build cache, pinned actions and placeholder env as listed there.
2. Every `uses:` names a full 40-character commit SHA from the action's own repository, with the version in a trailing comment.
3. The workflow references no secrets and no repo variables.
4. With only the placeholder env set (no `.env.local`), `pnpm check` passes locally.
5. The workflow's first run on this PR is green.

## Out of scope

Branch protection (Flovet's call), Dependabot, deploys, Supabase database tests, end-to-end tests, other operating systems or Node versions, any change to `src/`.

## Edge cases

- `next build` must not need a live Supabase. If a page calls Supabase during prerender, the build fails on the placeholder URL; that's a finding to fix in the page, not a reason to add real values (0023).
- `pnpm-lock.yaml` out of date: the frozen install fails the run. That's intended.
- A new push to the PR cancels the older run.

## Files and patterns to follow

- `.github/workflows/check.yml` (new). AniKansou's `.github/workflows/catalog-import.yml` for layout and comment style.
- `.env.example` for the env names.

## Boundaries

- Always: run the workflow file through Prettier (`pnpm format:check` covers YAML).
- Ask first: any secret, repo variable or extra job.
- Never: change branch protection or repo settings.

## Check

- `pnpm check` passes with the placeholder env and no `.env.local`.
- The `Check` run on the PR is green (link in the PR).
- Reviewer skill score of 90 or more, recorded above. One entry in `docs/log.md`.
