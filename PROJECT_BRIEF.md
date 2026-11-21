# Project brief: Jubilee

Domain: jubileecv.com (to be registered). Owner: Flovet. Brief written 2026-11-21.

## Product

Jubilee is a multilingual AI job-search assistant that takes candidates from CV to job offer. It builds ATS-ready CVs in each country's format, tailors them and cover letters to every job, finds matching roles and applies only with the user's approval, tracks every application, and drafts follow-up and thank-you emails at the right time.

- **Users:** active job seekers, in English- and French-speaking markets. Target markets: the US, Canada, the UK, France and Africa (Cameroon, Nigeria, Côte d'Ivoire, Senegal, Kenya, South Africa), rolled out in phases; France and the US launch first (0005).
- **Job to be done:** "Help me get more interviews without spending hours on each application."
- **Business model:** free CV builder; paid job-search pass for the weeks someone is hunting.
- **Positioning:** recruiter-safe. No mass spam, no cheating tools; capped, honest, high-fit applications.

## How scope is delivered (rules for AI agents)

- Work follows research → decision → spec → build → review → log (`CLAUDE.md`).
- One spec per task. Build only what the current spec asks.
- Build only on `Approved` decisions. A missing decision is researched, logged as `Proposed`, and waits for Flovet.

## Current milestone: MVP

Source: `docs/product/mvp.md`. Ten features:

1. Resume builder (free, ATS-readable).
2. LinkedIn import (paste or PDF).
3. Country CV formats for the 2 launch markets (France, US).
4. French and English CVs.
5. Match score and AI tailoring per job.
6. Cover letter generator.
7. Job matches and alerts (1–2 sources per market).
8. Approval-based apply (daily queue; nothing is sent without approval).
9. Application tracker as a Kanban board, with auto-logging.
10. Timed follow-up and thank-you emails (drafted; the user sends).

Plus: free CV builder and paid job-search pass.

## Full scope

Must have, nice to have and not in scope: `docs/product/feature-priorities.md`. Competitor research and unmet needs: `docs/product/competitor-map.md`.

## Stack

Proposed in decision 0001 (Next.js 16, React 19, TypeScript, Tailwind 4, pnpm, Supabase, Vercel). Not final until approved.

## Data sources and licences

None chosen yet. Every job source needs a recorded licence or terms check in a decision before use. No scraping of sites whose terms forbid it.

## Design direction

Not decided. Needs its own decision (design brief, tokens, type) before any screen is built.

## Decisions (newest first)

See `docs/decisions/README.md`. Product-wide ones:

- 0005 (Proposed): phased rollout, starting with France + US, then UK + Canada, then Africa country by country; the market follows the target job.
- 0004 (Proposed): sign-in with email magic link, Google or LinkedIn via Supabase; RLS on every table.
- 0003 (Proposed): UI in English and French via next-intl; CV language is separate from UI language.
- 0002 (Proposed): single Next.js app, feature folders, data access only in `queries.ts` / `actions.ts`.
- 0001 (Proposed): stack and tooling.

## Domain rules and vocabulary

- **CV:** the master document a user builds. **Version:** a CV tailored to one job.
- **Application:** one job + the version and letter sent + its stage.
- **Stages:** saved, applied, interview, offer, rejected (tracker columns).
- **Approval:** the user's explicit yes for one application. Nothing is submitted without it.
- **Market:** a country whose CV norms and job sources Jubilee supports.

## Constraints

- Keep pages light: mobile data and mid-range phones are common in the African markets (phase 3), and many users job-hunt on their phones everywhere.
- Personal data (CVs, contact details) is sensitive: least privilege, RLS on every table, data export and deletion from day one.
- AI must never invent experience; every AI change to a CV is visible and reversible.

## Active roles

Product-team skill: Tech Lead, Project Manager, Database Expert, Product Designer, UX, UI, Copy, Frontend, Backend.
