# Project log

One dated entry per task: what was built, the review score, and what was left.

## 2026-11-21: Codebase initialised

- Next.js 16.4.6 scaffold with pnpm, Prettier (Tailwind plugin), ESLint + Prettier config, Vitest and one smoke test; `pnpm check` script.
- Project brief, decision log (0001–0004 Proposed), spec 01 (Blocked on those decisions), product docs, product-team and reviewer skills.
- Left: Flovet to approve 0001–0004; then build spec 01. Design, AI, job sources, payments and email decisions still to research.

## 2026-11-21: Skills moved into .claude/ (issue #2)

- Moved `claude-setup/skills/*` to `.claude/skills/` and `claude-setup/agents/*` to `.claude/agents/`; removed `claude-setup/`. The paths in CLAUDE.md, README and the skills now resolve.
- No spec (tooling only). Not reviewed (no spec to score against).

## 2026-11-21: Decision 0005, launch markets (issue #3)

- Researched and logged 0005 as Proposed: Cameroon and France. Default UI and CV languages set per market. Main risk: no licensed job feed confirmed for Cameroon yet (fallback: saved and pasted jobs).
- Left: Flovet to approve 0001–0005. Sources came from web-search summaries and need re-checking in the job-sources and payments decisions.
