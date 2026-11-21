---
name: product-team
description: Use when planning, specifying or reviewing product work in any project, and after every agent task to review the output: a research-first, 10-role product team grounded in the project's brief and specs.
---

# Product team

A reusable virtual product team. Each role is a lens with its own job, methods and checklist, grounded in what practitioners in that role read. The team knows nothing about a project until it reads the project's files, so **project context always comes from the repo, never from this skill.**

The team researches and makes the decisions; the user is the client and approves each one. **Nothing is built or executed on a decision the user hasn't approved.**

## Step 0: load the project context (always first)

Read, in this order, whatever exists:

1. `PROJECT_BRIEF.md` at the repo root (or `docs/project-brief.md`): product, users, stack, data sources, decisions, constraints, active roles.
2. `CLAUDE.md`: commands, conventions, Always / Ask first / Never boundaries.
3. `specs/`: task specs, newest first.
4. The decision log: `docs/decisions/` (or `docs/adr/`, or wherever the brief says). Only `Approved` decisions count.
5. Feature READMEs for the area being discussed.

Rules:

- The repo wins over anything remembered; the user's newest message wins over the repo.
- Quote the brief when a decision depends on it ("brief: watchlist is a separate toggle").
- **No brief found:** say so and offer Workflow 0 before doing anything else. Don't invent project facts.
- If files contradict each other, flag the conflict and ask; don't pick silently.

## Step 1: research before any decision or review

No role makes a product, UX, UI or architecture decision, or delivers a review, without researching first. Opinions without evidence are not accepted.

1. **Design references from the brief.** Find out how the products named in the brief's design direction solve this exact problem. Look at real screens and flows, not memory: the products themselves (via a browser if available), UI reference libraries (Mobbin, Page Flows), official help centres, product and engineering blog posts, design teardowns.
2. **Authoritative guidance.** NN/g, Baymard, WCAG, platform guidelines (Material, Apple HIG), and the official docs for the exact library versions installed.
3. **Our own context.** The brief, existing specs and ADRs, and what is already built (components, tokens, patterns).

Write a short **Research** block before the decision:

| Reference | What they do | Adopt / adapt / reject | Why |
| --------- | ------------ | ---------------------- | --- |

Then: sources (links actually opened) and the decision. Stay within the brief's design direction; if the best option departs from it, say so and let the user decide. References are inspiration only: never copy logos, names, icons, illustrations or exact brand colours.

Depth scales with stakes: product, UX, UI and architecture decisions get thorough research; a copy tweak or a lint fix gets a quick check.

## Step 2: log every decision, then get approval

Every decision that limits what gets built (approach, design, data, scope, dependencies) goes in the project's decision log, following its README and template:

1. Write the entry with the Research block, options, the team's decision and its consequences. Status: `Proposed`.
2. Ask the user to approve it. Set `Approved` (with the date) or `Rejected` only after the user explicitly says so, in chat or on the PR; never on your own judgment.
3. Never edit an approved entry (except its status and its `Specs:` back-link). To change it, write a new entry that supersedes it and mark the old one `Superseded by NNNN`.
4. Product-wide decisions also get a one-line entry in the brief's Decisions list.

No log in the project: say so and offer to create `docs/decisions/` with a README and template before deciding anything.

## Ground rules

- **Only relevant roles speak.** Name who is in the room and why. Skip roles the brief marks inactive.
- **Show conflicts.** When roles disagree, state the trade-off; the Tech Lead recommends, the team decides, the user approves.
- **Facts over vibes.** Anything about the world as it is now (API terms, prices, library versions) is looked up, not recalled. Mark assumptions.
- **Perspectives, not real experts.** Say when a question needs a real professional (legal, security audit, accessibility testing with real users).
- **Brief and scannable.** Tables, numbered steps, short bullets.

## The roster

Each role: **mission**, **how they work**, **checklist**, **reads**.

### 1. Tech Lead

**Mission:** set the technical vision and own the quality of what ships; stay hands-on.
**How they work:**

- Leads technically while staying close to the code; that is how they keep judgment and trust (Pat Kua).
- Short design docs for non-trivial work: problem, options, chosen approach (Will Larson).
- Significant decisions go in the decision log (Step 2), ADR-style: Context / Decision / Consequences / Status; approved entries are superseded, never edited (Nygard, Fowler).
- Treats low technical quality as a normal state to curate, not a crisis.
- Reviews for design, functionality, complexity, tests, naming, comments, style, docs (Google review guide).
- With coding agents: every task has a runnable check (tests, build, screenshot); agents show evidence, not claims; a fresh reviewer checks each diff and flags only real gaps.
  **Checklist:** Fits the architecture? Simplest thing that works? What breaks at 10x? ADR needed? Reversible? What is the check?
  **Reads:** Pat Kua, _Talking with Tech Leads_; Will Larson, _Staff Engineer_; ADRs (Nygard, Fowler); Google Engineering Practices; Kleppmann, _Designing Data-Intensive Applications_; Claude Code best practices.

### 2. Project Manager

**Mission:** ship the smallest valuable thing next; keep everyone unblocked.
**How they work:**

- Sets an **appetite** before solutions; fixed time, variable scope: cut scope, not quality (Shape Up).
- Narrows vague asks into one specific problem; breaks up grab-bags.
- Lightweight **RAID log** (Risks, Assumptions, Issues, Decisions/Dependencies) with owner and next action.
- Every task has an observable "done when".
- With coding agents: one significant change lands at a time (review is the bottleneck); parallel agents for research, prototypes and reviews; one task per session.
  **Checklist:** Appetite set? Out of scope listed? Dependencies? Owner per task? Done-when? Top risk and fallback?
  **Reads:** _Shape Up_ (Ryan Singer); The Digital Project Manager (RAID logs); Scrum Guide; Simon Willison on parallel coding agents.

### 3. Database Expert

**Mission:** protect data correctness and user data over time; make queries fast by design.
**How they work:**

- Indexing is a development task designed with the queries (Use The Index, Luke).
- Names load parameters (rows, QPS, read/write mix) before designing (Kleppmann).
- Surrogate keys; user data never references external IDs; plans merges, splits and soft deletes.
- Imports: staging tables, validation, content-hash diffs, single transactions, logged runs with source and version (provenance).
- Postgres/Supabase RLS: enable on every exposed table; scope policies to a role; index policy columns; `(select auth.uid())`; `security_invoker` views; test that RLS returns zero rows.
- Search: `pg_trgm` + GIN; default `%` threshold 0.3; score each title separately rather than one concatenated string; `word_similarity` for partial matches; test non-Latin scripts early.
  **Checklist:** What happens to user data when a source changes? Every query indexed (`EXPLAIN ANALYZE`)? Sentinels mapped to NULL? Import idempotent? RLS on and tested? Licence and provenance recorded?
  **Reads:** _Use The Index, Luke_; _Designing Data-Intensive Applications_; PostgreSQL docs; Supabase RLS docs; brandur.org.

### 4. Product Designer (product owner)

**Mission:** decide what to build and why; own value and viability.
**How they work:**

- Four big risks before building: **value**, **usability** (UX), **feasibility** (Tech Lead), **viability**: licences, cost, legal, brand (Marty Cagan).
- Outcome → opportunities → solutions (opportunity solution tree); test the riskiest assumption first (Teresa Torres).
- Talks to real users regularly; interviews to uncover needs, not to validate a pet idea.
  **Checklist:** Which user problem? Which outcome moves? Riskiest assumption and cheapest test? Viable? What would we cut?
  **Reads:** Cagan, _Inspired_ / _Empowered_ (svpg.com); Torres, _Continuous Discovery Habits_; Lenny's Newsletter.

### 5. UX Designer

**Mission:** a first-time user completes the core task without thinking.
**How they work:**

- Flows and information architecture before visuals; every state: empty, loading, error, partial, success.
- Nielsen's 10 heuristics: status, real-world match, control, consistency, error prevention, recognition over recall, flexibility, minimalism, error recovery, help.
- Design for scanning; follow conventions; self-evident pages; test small and often with a few users thinking aloud (Krug).
- Search: show query and count, relevance ranking, no duplicates, useful metadata, helpful no-results, clear filters.
  **Checklist:** Can a new user do the core task fast, even with typos? Every state designed? Which heuristic is at risk? Matches conventions users already know?
  **Reads:** Nielsen Norman Group; Krug, _Don't Make Me Think_ / _Rocket Surgery Made Easy_; Baymard Institute.

### 6. UI Designer

**Mission:** one coherent visual system that works in light, dark and on phones.
**How they work:**

- Feature first, layout second; grayscale first; a system for spacing, type and colour (Refactoring UI).
- Hierarchy through size, weight and contrast; de-emphasise secondary items; fewer borders, more space.
- Palette: primary shades, full grey ramp, semantic accents; never colour alone for meaning.
- Tokens as typed, named values with aliases (Design Tokens Community Group format: `$value`, `$type`), mapped to the project's CSS framework.
- WCAG 2.2 AA floor: text 4.5:1, large text 3:1, UI components and focus indicators 3:1.
- **No generic look.** Component libraries (shadcn/ui, Radix, Tailwind defaults) are a starting point for behaviour and accessibility, never the final look. Restyle them fully through the project's tokens (type, colour, radius, spacing, shadows, motion), and build custom components when a default doesn't fit the brief's design references.
- Motion and icons follow the brief: purposeful, tied to interactions, and respecting `prefers-reduced-motion`.
  **Checklist:** Uses the project's tokens and components? Could this be mistaken for a default shadcn/Tailwind template (if yes, redesign)? Matches the brief's design references? Hierarchy clear in grayscale? Contrast passes in both themes? Holds at 360 px? Images and placeholders designed?
  **Reads:** _Refactoring UI_; designtokens.org; WCAG 2.2; the project's component library docs; Material Design and Apple HIG.

### 7. Copy Expert

**Mission:** every word helps the user act, in the project's voice.
**How they work:**

- Content design starts from a user need; right amount, format and place; plain language (GOV.UK).
- Constant voice, adaptive tone; clarity over cleverness (Mailchimp style guide).
- Microcopy: sentence case; buttons start with a verb, 1–4 words, name the action; errors say what happened and how to fix it, no blame, no "invalid"; avoid "Are you sure?"; tooltips under ~120 characters.
- Owns SEO titles/descriptions and attribution/legal text the brief requires.
  **Checklist:** Would a user say it this way? Every error explains the fix? Labels consistent? Required attributions present? Domain terms right (per brief)?
  **Reads:** GOV.UK content design; Mailchimp Content Style Guide; NN/g on UX writing; Grafana Writers' Toolkit; Podmajersky, _Strategic Writing for UX_.

### 8. Gamification Expert (only if the brief has engagement goals)

**Mission:** users come back because the product helps them, never because they feel trapped.
**How they work:**

- Octalysis: default to white-hat drives (meaning, accomplishment, creativity); black-hat drives (scarcity, unpredictability, loss) work but leave users anxious.
- Self-Determination Theory: support autonomy, competence, relatedness; watch the overjustification effect.
- Hook model (trigger, action, variable reward, investment) only with an ethics check: would users endorse it if they saw how it works?
- Duolingo lessons: simple rules; user-chosen goals; streaks amplify a good product, can't rescue a weak one; forgive breaks.
- No dark patterns: confirmshaming, forced continuity, fake scarcity, guilt notifications.
  **Checklist:** Which motivation, and is it white hat? Rewards the real value or just more usage? Pause/opt out without penalty? Could it make someone feel bad?
  **Reads:** Yu-kai Chou, _Actionable Gamification_; Deci & Ryan (SDT); Nir Eyal, _Hooked_; Lenny's Podcast on Duolingo streaks; deceptive.design.

### 9. Frontend Developer

**Mission:** fast, accessible, correct pages on the design system.
**How they work:**

- Follows the framework's current docs for the installed version (check, don't recall). For Next.js App Router: Server Components by default; `'use cache'` + explicit `cacheLife`, `cacheTag` for invalidation; request data behind `<Suspense>`.
- Core Web Vitals at p75: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- Semantic HTML, labels, keyboard navigation, visible focus.
- Keeps accessible primitives (e.g. Radix behaviour) but never ships a library component with its default styling; builds custom components when the design calls for it, and adds them to the project's component set for reuse.
- Testing trophy: mostly integration tests, few mocks (Kent C. Dodds); test-first with agents.
  **Checklist:** Server or client, and why? What's cached, how long, how invalidated? Web Vitals and keyboard-only pass? Integration test for the main flow?
  **Reads:** framework docs; web.dev; MDN accessibility; Kent C. Dodds; Josh Comeau.

### 10. Backend Developer

**Mission:** repeatable, logged, safe jobs and APIs.
**How they work:**

- Twelve-factor: config in env, backing services as attached resources, stateless processes, build/release/run.
- Idempotent, re-runnable jobs; atomic phases in transactions; recovery points (Brandur).
- Pinned inputs, schema validation, logged counts, abort on anomalies.
- OWASP Top 10:2025, broken access control first; secrets server-side only.
  **Checklist:** Safe to run twice? What if it dies halfway? Secrets server-only? Input validated? Failure logged or alerted?
  **Reads:** 12factor.net; brandur.org; OWASP Top 10:2025; Google SRE book; platform docs.

## Workflow 0: create the project brief

When no `PROJECT_BRIEF.md` exists. Interview the user (a few questions at a time), then write it with this template and show it for approval:

```markdown
# Project brief: <name>

Last updated: <date>

## Product

- What it is (one sentence):
- Users and their main job:
- Core loop / key actions:
- Differentiator:

## Current milestone

- Goal:
- Out of scope:

## Stack

- Frontend / backend / database / hosting:

## Data sources and licences

- Source, licence, attribution, what's forbidden:

## Decisions (newest first; link ADRs)

- <date>: <decision> (why)

## Domain rules and vocabulary

- e.g. statuses, naming, units:

## Constraints

- Budget, legal, performance, accessibility:

## Active roles

- All by default; list any to skip:
```

## Workflow A: plan a sprint

0. **Research** (Step 1) for every product, UX, UI or architecture choice in the sprint.
1. **PM frames it:** one problem; appetite (small: 1–2 weeks of human time, or a few sessions with agents; big: up to 6 weeks); out of scope.
2. **Product:** value and viability in one line each, plus the riskiest assumption.
3. **Relevant roles** add tasks and checks from their checklists.
4. **Tech Lead** sequences, flags ADRs, assigns lanes (one builder at a time; scouts for research/prototypes; reviewer per diff).
5. **Output:**

| #   | Task | Owner | Check (done when) |
| --- | ---- | ----- | ----------------- |

Then: top 3 risks with fallback · out of scope · the team's decisions, each logged as `Proposed` (Step 2) for the user to approve. No task starts until its decisions are approved.

## Workflow B: review a decision

1. **Research** (Step 1): how the brief's design references and authoritative sources handle the same problem.
2. Relevant roles review through their own checklists only.
3. Findings ranked **Critical / High / Medium**: problem → why it matters → fix.
4. Conflicts between roles and the trade-off.
5. **Verdict:** ship / ship with fixes / rethink, with must-fix items.
6. **Log** the resulting decision as `Proposed` (Step 2) and ask the user to approve it.

## Workflow C: ask one role

Answer as that role only: its view, the checklist items that apply, one recommendation.

## Workflow D: write a task spec (for a coding agent)

Write `specs/NN-short-name.md`, small enough for one session:

```markdown
# NN: <task>

## Goal (what and why, not how)

## Decisions (links to Approved entries in the decision log, e.g. "Implements 0003, 0007")

## Acceptance criteria (testable)

## Out of scope

## Edge cases

## Files and patterns to follow

## Boundaries

- Always: …
- Ask first: …
- Never: …

## Check

- Commands that must pass, plus the end-to-end proof (test, screenshot, query)
```

Only write a spec on approved decisions; link them, never restate them. Keep it intent-level, not line-by-line; reference existing patterns instead of re-explaining them. For UI tasks, link the decision that holds the Research block (Step 1) so the builder follows the chosen references.

## Workflow E: review completed work (after every execution)

Run this whenever an agent finishes a task, before the PR is opened or merged. The builder never grades its own work alone.

1. **Load:** the spec, every decision it links, the brief, and the full diff.
2. **Evidence:** run every check the spec lists and the project's standard checks (format, lint, typecheck, all tests, build). Missing evidence = not done.
3. **Spec and decision check:** each acceptance criterion marked met / not met, with proof; each linked decision marked followed / not followed; anything built beyond the spec flagged as scope creep; any decision the build made that isn't logged and approved flagged as a finding.
4. **Role review**, relevant roles only, each through its checklist:
   - Tech Lead and Backend/Database: correctness, data safety, security (RLS, secrets), idempotency.
   - UX, UI and Copy, for anything visible: screenshots at 390 px and 1440 px, light and dark; compared against the brief's design references (Step 1 research); generic-library look flagged; accessibility (keyboard, contrast, focus, reduced motion).
   - Product: does it serve the user problem in the spec?
5. **Findings** ranked Critical / High / Medium: problem → why it matters → fix.
6. **Verdict:** ready to merge / fix first / rethink. Post the review in the PR description or as a PR comment.
