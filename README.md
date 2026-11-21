# Jubilee

AI job-search assistant: country-ready CVs, tailored applications the user approves, a tracker, and follow-ups at the right time. Start with `PROJECT_BRIEF.md`.

## Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev                     # http://localhost:3000
```

`pnpm check` runs format, lint, typecheck, tests and the build.

## How work is done here

Research → decision (`docs/decisions/`) → spec (`specs/`) → build → review → log (`docs/log.md`). See `CLAUDE.md`.

## Layout

| Path                   | What lives there                                    |
| ---------------------- | --------------------------------------------------- |
| `PROJECT_BRIEF.md`     | Product, scope, stack, constraints, decisions index |
| `docs/decisions/`      | One file per decision, with its research            |
| `docs/product/`        | MVP, feature priorities, competitor research        |
| `specs/`               | One spec per task                                   |
| `src/`                 | The app (structure: decision 0002)                  |
| `supabase/migrations/` | Database migrations (decision 0004)                 |
| `.claude/`             | Product-team and reviewer skills, reviewer agent    |
