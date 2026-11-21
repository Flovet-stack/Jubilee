# 0013: CV data model and PDF rendering

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, Database Expert, Backend, Frontend, Product Designer)
- **Approved:** 2026-11-21 by Flovet (in chat)
- **Builds on:** 0002 (data access only in `queries.ts` / `actions.ts`), 0003 (CV language is separate from UI language), 0004 and 0006 (RLS on every table, user data cascades from `profiles`), 0005 (market follows the target job)
- **Specs:** none yet (issue #10, CV schema, RLS and data access layer, is next)

## Context

Issue #5. The resume builder (#14), PDF export (#15), LinkedIn import (#16), country formats (#17), en/fr CVs (#18), tailoring (#20) and the tracker all share one CV shape, so it has to be settled before #10 builds the tables.

Brief:

- "**CV:** the master document a user builds. **Version:** a CV tailored to one job."
- "AI must never invent experience; every AI change to a CV is visible and reversible."
- "Personal data (CVs, contact details) is sensitive: least privilege, RLS on every table, data export and deletion from day one."
- "Keep pages light: mobile data and mid-range phones are common."
- MVP feature 1: "Resume builder (free, ATS-readable)."

Three questions: how a CV is stored, how versions and AI changes are kept reversible, and how the PDF is made so an ATS reads it.

## Research

| Reference                                                                          | What they do                                                                                                                                                                                                                                                                                                                                                                                                          | Adopt / adapt / reject                | Why                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON Resume schema (v1.7.1 on the site)                                            | Open schema: `basics`, `work`, `education`, `skills`, `languages`, `projects`, `certificates`, `awards`, `volunteer`, `publications`, `interests`, `references`, all optional. Work entry: `name`, `position`, `location`, `url`, `startDate`, `endDate`, `summary`, `highlights[]`. Partial ISO dates (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`); no `endDate` = current. `custom` objects allowed. No multi-language content | Adapt                                 | Proven section and field names; partial dates suit CVs (most give month and year). We add ids per entry, section order and visibility, and one language per document. Using its names keeps an export to JSON Resume trivial (data export rule) |
| Reactive Resume v6 (open source, Drizzle on Postgres)                              | `resume` table with one `data` jsonb column typed by a Zod schema; name, slug, sharing and `trashedAt` as columns. `resume_version` keeps a full `data` snapshot per version. PDF via Forme (WebAssembly) in browser and server; dropped Chromium/Browserless in v6                                                                                                                                                   | Adopt (storage); reject Forme for now | Closest open product to ours. One document per CV keeps the editor, AI and import simple. Their move off Chromium matches our reasoning. Forme is new and we found no independent docs on it                                                    |
| OpenResume (open source)                                                           | Builds the PDF with react-pdf, says it is ATS-friendly for Greenhouse and Lever. Its parser uses pdf.js: rebuilds lines from x/y positions, treats single bold all-caps lines as section titles, built for single-column resumes                                                                                                                                                                                      | Adopt                                 | Confirms react-pdf output extracts as text, and gives us a test method: extract with pdf.js and check reading order                                                                                                                             |
| react-pdf (`@react-pdf/renderer`, MIT, docs v4, renderer 4.9.0 on GitHub releases) | React components to PDF; `renderToBuffer` / `renderToStream` in Node; React 19 since 4.1.0; Yoga (flexbox) layout; TTF and WOFF fonts registered and embedded, no variable fonts; hyphenation callbacks; `Link`; document `title`, `author`, `language` metadata; PDF/A options                                                                                                                                       | Adopt                                 | Real text with embedded fonts, server-side, no browser binary, fits Vercel easily. Limits (flexbox only, a CSS subset, static font weights) suit a single-column CV                                                                             |
| Headless Chromium on Vercel (`puppeteer-core` + `@sparticuz/chromium`)             | 250 MB function limit; Chromium is ~131 MB uncompressed (33 MB Brotli), or a `-min` pack downloaded to `/tmp` on cold start; 1,600 MB memory recommended; no fonts on Lambda; stock build makes untagged PDFs; Linux-only binary (no local Windows run)                                                                                                                                                               | Reject                                | Heavy, slow cold starts, costly memory, and a Linux-only binary that Flovet can't run locally. Its one gain (reusing HTML/CSS) isn't worth it for one-column templates                                                                          |
| Browser print CSS (`window.print()`)                                               | The user's browser makes the PDF                                                                                                                                                                                                                                                                                                                                                                                      | Reject                                | Output differs per browser and phone, headers/footers and margins are the browser's, can't be generated on the server for attaching to applications (#29)                                                                                       |
| Jobscan: ATS formatting mistakes; tables and columns                               | PDF is "the safest way to preserve your layout"; parsers read linearly, so two-column and table layouts merge lines; headers, footers and text boxes are often ignored; standard headings ("Work Experience", "Education", "Skills"); web-safe fonts, icons and odd fonts parse as garbage; dates like "Jan 2021 – Mar 2023"; skills as commas or bullets, not bars                                                   | Adopt (as test rules)                 | Commercial guidance, not ATS vendor docs (Greenhouse's and Indeed's pages were gone). Consistent with OpenResume's parser. Becomes the ATS checks in #15                                                                                        |
| PostgreSQL 19 docs, JSON types                                                     | Prefer `jsonb`; GIN `jsonb_path_ops` for containment; any update locks the whole row; keep documents a manageable size and atomic                                                                                                                                                                                                                                                                                     | Adopt                                 | A CV is a few kB, edited by one person: whole-row locks don't matter. A size cap keeps it manageable                                                                                                                                            |

Sources (opened 2026-11-21):

- https://jsonresume.org/schema
- https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json
- https://github.com/reactive-resume/reactive-resume (README) and https://github.com/reactive-resume/reactive-resume/blob/main/packages/db/src/schema/resume.ts
- https://docs.rxresu.me/contributing/architecture and https://docs.rxresu.me/self-hosting/upgrading-to-v6
- https://github.com/xitanggg/open-resume and https://open-resume.com/resume-parser
- https://react-pdf.org/, https://react-pdf.org/fonts, https://react-pdf.org/node, https://react-pdf.org/docs/v4/compatibility, https://react-pdf.org/docs/v4/components/document, https://react-pdf.org/docs/v4/components/link
- https://github.com/diegomura/react-pdf and https://github.com/diegomura/react-pdf/releases
- https://github.com/Sparticuz/chromium and https://vercel.com/docs/functions/limitations
- https://www.jobscan.co/blog/ats-formatting-mistakes/ and https://www.jobscan.co/blog/resume-tables-columns-ats/
- https://www.postgresql.org/docs/current/datatype-json.html

Tried and failed (404): Indeed's ATS resume format guide, Greenhouse's resume parsing article. So no ATS vendor page backs the format rules; we test extraction ourselves instead.

## Options

**Storage**

1. **Normalised tables** (`cvs`, `cv_sections`, `cv_entries`, `cv_bullets`). Pros: each row editable and indexable. Cons: every edit, import, AI change and version copy touches many rows; ordering columns everywhere; versions mean deep copies across four tables; snapshots for undo become hard.
2. **One `jsonb` document per CV, validated by a Zod schema** (as Reactive Resume). Pros: one read, one write; version = copy one value; undo = keep old values; the AI and import produce one object we validate. Cons: the database can't enforce inner fields (Zod in `actions.ts` does); schema changes need a `schema_version` and a migration in code.
3. **Hybrid:** columns for what we filter and join on, `jsonb` for the content. Option 2 with the few query fields lifted out.

**Versions and AI changes**

1. **Revisions as full snapshots:** every saved change that matters (AI accepted, import, restore, user "save point") appends the whole content with its source. Undo = restore a snapshot.
2. **JSON Patch log** (RFC 6902) with inverse patches. Smaller, but harder to read and replay, and a bug corrupts history. At a few kB per CV, snapshots cost little.

**PDF**

1. **react-pdf on the server** (route handler, `renderToBuffer`).
2. **Headless Chromium** on Vercel.
3. **Browser print CSS.**
4. **Forme (WebAssembly).**

## Decision

Storage option 3, versions option 1, PDF option 1.

**Tables** (all `user_id uuid not null references profiles(id) on delete cascade`, indexed, owner-only RLS for `authenticated` with `(select auth.uid()) = user_id`, no `anon` grants; `user_id` is on every table so no policy needs a join):

| Table          | Holds                                    | Key columns                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cvs`          | The master CV(s) a user builds           | `id`, `user_id`, `title`, `language` (`en` \| `fr`, 0003), `market` (`FR` \| `US`, 0005), `template` (text, set by the templates decision), `content jsonb`, `schema_version int`, timestamps                                       |
| `cv_versions`  | A CV tailored to one job (brief)         | as `cvs`, plus `cv_id` (the master it came from, `on delete set null` so a version survives its master's deletion) and `job_id` (nullable until the jobs tables exist)                                                              |
| `cv_revisions` | Append-only history of one CV or version | `id`, `user_id`, `cv_id` or `cv_version_id` (exactly one, checked), `content jsonb`, `schema_version`, `source` (`user` \| `ai` \| `import` \| `restore`), `note` (short, e.g. what the AI changed), `created_at`. No update policy |

**Content** (`content jsonb`): one object validated by a Zod schema in `src/features/cv/schemas.ts`, using JSON Resume's section and field names where they exist: `basics` (name, headline, email, phone, location, links), then ordered `sections`, each with an `id`, a `kind` (`work`, `education`, `skills`, `languages`, `projects`, `certificates`, `awards`, `volunteer`, `custom`), a `hidden` flag and `entries` with their own `id`s. Dates are partial ISO strings (`YYYY` or `YYYY-MM`; no end date = current); how they read on the page ("janv. 2021", "Jan 2021") is the renderer's job per market (#13). A check constraint caps `content` at 256 kB. No photo, date of birth or marital status fields until the country format decision (#13) asks for them.

**Reversible AI:** the AI never writes `content` directly. It proposes; the user sees the change and accepts; accepting writes the new `content` and a `cv_revisions` row with `source = 'ai'` and a note. Restoring any revision is one action and itself appends a `restore` revision, so nothing is lost. Plain typing autosaves `content` without a revision; the editor writes a `user` revision at most once per editing session. How AI proposals are shown and stored before acceptance is left to the AI decision (#11) and the tailoring spec (#20).

**PDF:** `@react-pdf/renderer` (MIT) renders on the server in a Node route handler under `src/features/cv/`, returning the file. One column, contact details in the body (no page header or footer), standard section headings per language, real text with embedded static TTF fonts, document `title`, `author` and `language` set. CV templates are React components for react-pdf; which templates and fonts is the "CV templates and their typography" decision.

**ATS check:** the export spec (#15) adds a test that extracts each template's PDF text with pdf.js (`pdfjs-dist`, dev dependency) and checks that every field comes out, in content order, with no garbled characters, in English and French (accents).

**New dependencies:** `@react-pdf/renderer` (runtime) and `pdfjs-dist` (dev, tests only). Versions pinned when #15 is built, after checking the current release.

**Trade-offs the team weighed:** the Database Expert preferred normalised tables for integrity; the Tech Lead chose `jsonb` because every write path (editor, import, AI, versions, undo) is a whole-document operation, and Zod validation at the one write path (`actions.ts`) gives the same guarantee. Frontend noted react-pdf means templates aren't HTML, so the builder's live preview must show the real PDF or a separate HTML view; that choice goes to the builder spec (#14).

## Consequences

- #10 can build three tables, RLS, `queries.ts` / `actions.ts` / `schemas.ts`, and the cross-user tests now, with no PDF work.
- Changing the content shape later means bumping `schema_version` and writing a migration function in code; old revisions stay readable through it.
- Data export (#36) is one query per table and maps to JSON Resume. Account deletion cascades through all three tables.
- No search inside CV content in the MVP. If matching (#19) needs it, a GIN `jsonb_path_ops` index can be added then.
- No Chromium anywhere. If a template ever needs layout react-pdf can't do, that is a new decision.
- react-pdf also runs in the browser. The builder spec (#14) may render the same templates there for the live preview and download (as Reactive Resume v6 does, so the preview always matches), keeping the server render for files attached to applications (#29). The cost is a heavier builder page on phones; #14 weighs it against the brief's "keep pages light".
- DOCX export is out of scope for the MVP (Jobscan: PDF is the safe default).
- Untested: whether react-pdf makes tagged (accessible) PDFs. The PDF/A options exist; the export spec should check, and the result is noted, not assumed.
- Reviews check: RLS on all three tables with a zero-rows test for another user; no `anon` grants; revisions have no update or delete policy; `content` always passes the Zod schema; AI code paths never write `content` without an accepted proposal; the extraction test passes for every template.
