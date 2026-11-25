# Jubilee: agent instructions

@AGENTS.md

## Before any task

- Read `PROJECT_BRIEF.md`, then the spec in `specs/` for the current task.
- Build only what that spec asks. Never work on several features at once, and never add a feature "while you're there".
- If no spec covers the task, write one (product-team skill, Workflow D) before building.
- Read the decisions in `docs/decisions/` that the spec links. Build only on decisions with status `Approved`. If the task needs a decision that isn't logged, research it with the product-team skill (Step 1), log it as `Proposed`, and wait for Flovet's approval.
- Read the Next.js docs in `node_modules/next/dist/docs/` for any API you're about to use (AGENTS.md). This Next.js has `cacheComponents` on.

## The order of work

1. **Research** the requirement (product-team skill, Step 1): references, sources actually opened.
2. **Decide**: log the decision in `docs/decisions/` with the research block. Flovet approves it.
3. **Spec**: write `specs/NN-name.md`, linking the approved decisions. Never restate them.
4. **Build** only what the spec asks.
5. **Review** with the `reviewer` skill against the spec and its decisions. Done at 90/100 or more.
6. **Log** one dated entry in `docs/log.md`.

The result is validated against both the spec and the decisions it links.

## Commands

| Task       | Command                                         |
| ---------- | ----------------------------------------------- |
| Everything | `pnpm check`                                    |
| Format     | `pnpm format` (check only: `pnpm format:check`) |
| Lint       | `pnpm lint`                                     |
| Typecheck  | `pnpm typecheck`                                |
| Unit tests | `pnpm test`                                     |
| Build      | `pnpm build`                                    |
| Dev server | `pnpm dev` (http://localhost:3000)              |

## Always

- Run the checks and show the evidence (command output; screenshots at 390 px and 1440 px for UI) before saying a task is done.
- After every task, run the `reviewer` skill (`.claude/skills/reviewer/SKILL.md`) against the spec. Record the final score in the spec's status line.
- Keep `docs/log.md` current: one dated entry per task.
- Keep UI copy in the message files (decision 0003). No hard-coded user-facing strings.
- Space every control by the `type-spacing` skill (`.claude/skills/type-spacing/SKILL.md`, decision 0029). Never hand-pick padding, gaps or icon sizes inside a control.

## Ask first

- Adding a dependency not named in an approved decision.
- Schema changes (new migrations, RLS policies).
- Auth, payment or environment variable changes.
- Anything that sends user data to a third party (AI providers, analytics, email).

## Never

- Submit a job application without the user's explicit approval (brief: approval-based apply).
- Invent experience, skills or dates in a CV or letter.
- Edit a migration that has already run. Add a new one instead.
- Use `any` or `@ts-ignore`.
- Commit secrets (`.env.local`, keys, tokens).
- Push to `main`. Work on a branch and open a PR.
