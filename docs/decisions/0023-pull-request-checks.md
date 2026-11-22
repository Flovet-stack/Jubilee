# 0023: Run `pnpm check` on every pull request with GitHub Actions

- **Status:** Approved
- **Proposed:** 2026-11-22 by the product team (roles: Tech Lead, Project Manager, Backend)
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Specs:** specs/11-pull-request-checks.md

## Context

All work lands on `main` through pull requests (CLAUDE.md: never push to `main`), but nothing checks a PR before merge: `.github/` doesn't exist and `main` has no branch protection. Issue #7 asks for `pnpm check` on every PR to `main`, with pnpm 11 and placeholder values for the public env vars so `src/env.ts` passes at build time. 0001 fixed the tools (pnpm 11, `pnpm check`) but not where they run in CI, which actions run, or how the build gets its env. The repo is public.

## Research

| Reference                                                     | What they do                                                                                                                                                              | Adopt / adapt / reject | Why                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| AniKansou `.github/workflows/catalog-import.yml` (same owner) | `actions/checkout@v5`, `setup-node@v5` with Node 24, `corepack enable`, `pnpm install --frozen-lockfile`; `permissions: contents: read`; `concurrency`; `timeout-minutes` | Adapt                  | Same owner and stack; keep permissions, concurrency and timeout; drop Corepack (pnpm docs now say not to) |
| pnpm docs, Continuous integration                             | `pnpm/setup` installs pnpm (version from `packageManager`) and Node (`runtime: node@24`) in one step, `cache: true` for the store, then installs; "Do not use Corepack"   | Adopt                  | The official, current path for pnpm 11+; one step instead of three                                        |
| `pnpm/action-setup` README                                    | Supports pnpm ≤ 12; reads `packageManager`; needs `actions/setup-node` separately; points to `pnpm/setup` for v11+                                                        | Reject                 | Older two-step setup; `pnpm/setup` replaces it for our pnpm version                                       |
| `actions/setup-node` v7 README                                | `cache: pnpm` needs pnpm installed first                                                                                                                                  | Reject                 | Not needed once `pnpm/setup` installs Node and caches the store                                           |
| Next.js 16.4.6 docs, `ci-build-caching.md` (installed)        | Cache `.next/cache` with `actions/cache`, keyed on lockfile and source hashes; without it builds warn "No Cache Detected"                                                 | Adopt                  | Faster `next build` on repeat PR runs; official guidance for this exact version                           |
| GitHub docs, security hardening for Actions                   | Pin third-party actions to a full commit SHA (tags can move); default `GITHUB_TOKEN` to read-only contents                                                                | Adopt                  | Supply-chain safety for a public repo at no cost                                                          |
| GitHub docs, concurrency                                      | `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`                                                                                             | Adopt                  | A new push to a PR cancels the stale run                                                                  |
| GitHub docs, Actions billing                                  | Standard GitHub-hosted runners are free in public repos                                                                                                                   | Adopt                  | No cost; if the repo goes private, GitHub Free includes about 2,000 Linux minutes a month                 |
| Node.js release table                                         | 26, 24 and 22 are LTS lines                                                                                                                                               | Adopt 24               | Matches local dev (v24.15.0) and AniKansou; moving to 26 is its own change                                |

Sources (links actually opened):

- https://pnpm.io/continuous-integration
- https://github.com/pnpm/action-setup
- https://github.com/pnpm/setup (`action.yml`, release v3.2.0, 2026-11-12)
- https://github.com/actions/setup-node
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs
- https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
- https://nodejs.org/en/about/previous-releases
- `node_modules/next/dist/docs/01-app/02-guides/ci-build-caching.md`
- `../anikansou/.github/workflows/catalog-import.yml`

## Options

1. **GitHub Actions, one job running `pnpm check`, set up with `pnpm/setup`.** Free on a public repo, lives next to the PRs, and reuses the exact local command. Cons: one serial job (about the time of a local `pnpm check`).
2. **GitHub Actions, parallel jobs per step** (format, lint, typecheck, test, build). Faster wall-clock and clearer failure labels. Cons: installs five times, duplicates the `check` script's order in YAML, and drifts when the script changes.
3. **Rely on Vercel preview builds.** Already run `next build` per PR. Cons: no format, lint, typecheck or tests; needs real env in Vercel; not a merge gate.

## Decision

Option 1.

- **File:** `.github/workflows/check.yml`, workflow name `Check`, job `check`.
- **Triggers:** `pull_request` to `main`, plus `workflow_dispatch` for manual reruns. No push trigger (issue #7 scope).
- **Runner:** `ubuntu-latest`, `timeout-minutes: 15`, `permissions: contents: read`, concurrency per workflow and ref with `cancel-in-progress: true`.
- **Setup:** `actions/checkout` then `pnpm/setup` with `runtime: node@24` and `cache: true`. pnpm's version comes from `packageManager` (`pnpm@11.4.0`), so local and CI can't drift. No Corepack. Install is frozen (pnpm's CI default).
- **Build cache:** `actions/cache` on `.next/cache`, keyed on `pnpm-lock.yaml` and source file hashes, as the Next.js guide shows.
- **Actions pinned** to full commit SHAs with the version in a comment (`actions/checkout` v7.0.1, `pnpm/setup` v3.2.0, `actions/cache` v6.1.0).
- **Env:** placeholder values written in the workflow's `env:` block, not secrets or repo variables: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_placeholder`. They only satisfy `src/env.ts`; CI never talks to Supabase. `NEXT_TELEMETRY_DISABLED=1`.
- **Branch protection** (requiring `Check` before merge) is a repo setting and stays Flovet's call; the team recommends turning it on once the first run is green.

Tech Lead and PM agreed on one job: the repo's `pnpm check` is the single definition of "passes", and speed isn't a problem yet. Backend raised placeholders vs. real public values as repo variables: placeholders win because nothing at build time should need a live backend; if a page ever does, the build fails and that is a finding, not a reason to add real values.

## Consequences

- A PR shows a red or green `Check`; once Flovet turns on branch protection, a red one can't merge.
- Changing the `check` script changes CI with no YAML edit. Changing Node or pnpm is one line (`runtime`) or `packageManager`.
- Pinned SHAs need occasional bumps; Dependabot for actions is a separate decision.
- No deploys, secrets, database tests (`supabase/tests/`), end-to-end tests or other OSes in CI; each needs its own decision.
- Review should check: actions pinned to SHAs from the official repos; `contents: read` only; no secrets referenced; the placeholders pass `src/env.ts`; a green run on the PR itself.
