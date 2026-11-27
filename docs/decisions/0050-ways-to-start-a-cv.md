# 0050: Ways to start a CV, on the Resumes page

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: Product, UX, UI, Copy, Database, Tech Lead, Frontend, Backend), revised the same day from Flovet's direction
- **Approved:** 2026-11-27 by Flovet (in chat)
- **Supersedes:** 0032's `/cvs/new` create screen (the options move to the top of the Resumes page) and 0024's "Create a CV" step (language and market stay, inside each option).
- **Specs:** —

## Context

Flovet (2026-11-27), after approving 0049, then revising the team's first draft:

- **Where:** the sidebar's plus, "Create resume" on the Resumes page and the one on Home all lead to the **Resumes page**. Its top holds the ways to start.
- **The options:** blank (a fresh, empty CV), import from LinkedIn, upload an existing CV, and **create from a job description** ("very important"). "Describe my experience" is cut: too many options.
- **A base of her information:** built from all her existing CVs, so she never types her experience again for a new CV. Personas may come later.
- **Step 2 depends on the option chosen in step 1.**

What limits the answer:

- **Brief:** "AI must never invent experience." A CV holds only facts she gave us.
- **0049:** AI changes are proposals; "Tailor to a job" shows the match score in a Job tab.
- **0036:** `cv.import`, `job.extract`, `cv.tailor`; contact details stripped from prompts; per-user caps.
- **0032:** no greyed-out "coming soon" options, and one violet action per screen (0007).

## User lens

**User:** Aminata, 29, data analyst in Paris. She has an old CV in a file, a LinkedIn profile, and, after her first week, two CVs in Jubilee. Tonight she found a job ad she likes.

1. **Why she opens it:** the first time, "Get my CV in without typing it all." After that, "Make me a CV for this job," without retyping her experience.
2. **How she uses it:** laptop, evening, a few minutes. She clicks the plus out of habit and expects to land somewhere obvious, with the job ad in her clipboard.
3. **What she wants next:** her CV open in the editor, filled in, and for a job, whether she fits it and what to change.
4. **What we leave out:** "Describe my experience" (Flovet), a CV from a job ad when she has no facts yet, sample CVs, a chat, keeping uploaded files, and personas for now.

## Research

| Reference                                                   | What they do                                                                                                                                                                                        | Adopt / adapt / reject                  | Why                                                                                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Teal, "Resume Syncing" (help centre)                        | All resumes "pull from the same content". A new bullet is "instantly available in all your resumes. You just toggle it on or off for each version." Edits can apply to all resumes or just this one | **Adopt the idea, adapt the mechanics** | It's Flovet's "base": her facts are entered once. We start simpler (below): read the base from her CVs when a new CV is made, with no syncing of edits |
| Teal, re-import (help centre)                               | Re-importing with overwrite deletes all resumes; Teal discourages two separate work histories                                                                                                       | **Adopt as a warning**                  | Importing must add to her CVs, never overwrite. Two histories in one account is the "personas" question, deferred                                      |
| Teal, Kickresume, Rezi (0032, first draft of this decision) | A resumes home with "New resume" offering several starts: blank, upload, LinkedIn, from a job description, from a template                                                                          | **Adopt**                               | The common set; Flovet's list matches it                                                                                                               |
| Kickresume, from a job ad (vendor page)                     | Builds a whole CV from a pasted job ad, with no CV of yours needed                                                                                                                                  | **Reject**                              | That CV has no real experience in it. Ours builds from her base; with no base yet, she brings her facts first                                          |
| Rezi, create resume (docs, from 0032)                       | Import options live inside the create form                                                                                                                                                          | **Adopt**                               | Every way to start in one place                                                                                                                        |

Sources: help.tealhq.com/en/articles/9457698-making-changes-across-resumes, help.tealhq.com/en/articles/9535263-can-i-have-multiple-resumes-that-aren-t-connected, help.tealhq.com/en/articles/9457681-re-import-your-resume-data, tealhq.com/post/master-resume (search summaries); 0032's opened sources; the first draft's sources (Kickresume, Rezi). Vendor claims discounted.

## Options for the base

1. **Read it from her CVs when a new CV is made** (no new table). When she creates from a job, we gather the entries from all her CVs, remove duplicates (same employer, title and start date; the most recently edited wins), and that's the base. Pros: no schema change, nothing to keep in sync, matches "gotten from all the existing CVs". Cons: duplicates are matched by rule, and a fact only exists while some CV holds it.
2. **A profile table that every CV draws from** (Teal's syncing). Pros: one true source; edits flow everywhere; personas fit later. Cons: a schema change (Ask first), a sync model to design (edit here or everywhere?), and every existing CV to migrate.

**The team recommends 1 now and 2 as its own decision when personas or syncing are needed.** Option 1 gives her "never retype" today; option 2 can be built later on the same idea, from the same data.

## Decision

### Where

- The sidebar's plus, "Create resume" on the Resumes page and on Home all go to the **Resumes page** (0032), scrolled to the top. `/cvs/new` redirects there.
- The top of the page is a row of **start cards**, above the list. On a phone they stack in a 2×2 grid. The list of her CVs follows, as today.
- With no CVs yet, the cards are the page; the empty list's message is not repeated.

### The four starts, and each one's step 2

| Card                       | Step 2 (depends on the card)                                                                | Then                                                                                                                                                                                                                                                                                               | AI                         |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Blank CV** (the default) | None. Language and market are prefilled from the locale (0024) and changeable in the editor | The editor opens on the guided first pass (0024)                                                                                                                                                                                                                                                   | none                       |
| **For a job**              | Paste the job ad. Language and market follow the job (0005)                                 | We read the job, take her **base** (option 1 above), and create a CV with her entries in the order that fits the job, titled after the job ("Data Analyst · Doctolib"). The editor opens with the **Job tab** (0049): match score, missing keywords and rewording proposals she accepts one by one | `job.extract`, `cv.tailor` |
| **Import from LinkedIn**   | Paste the profile text, or upload LinkedIn's "Save to PDF"                                  | A new CV opens with the sections filled. Each imported section is marked "Imported: check it" until she opens it                                                                                                                                                                                   | `cv.import`                |
| **Upload a CV**            | Pick a PDF file                                                                             | The same as LinkedIn. The file is read, then discarded                                                                                                                                                                                                                                             | `cv.import`                |

- **Step 2 shows in a dialog** (a sheet on phones), titled after the card, with one primary button ("Create CV", "Import", "Upload"). Blank has no dialog: one click, and the editor opens.
- **"For a job" with no base yet** (her first CV): the dialog says her CV needs her experience first and offers **Upload a CV**, **Import from LinkedIn** or **Start blank**, keeping the pasted job. After her facts are in, the Job tab opens on that job. Nothing is written from the job ad alone.
- **Facts come only from her:** from her base, her LinkedIn or her file. The job changes order and wording (as proposals), never facts. Anything an import can't read is listed for her, not guessed.
- **Failures:** a file it can't read, or a cap reached: the calm message (0036), and "Start blank instead" with nothing lost.
- **Copy:** cards are a noun and a short line ("Blank CV · Start from an empty page", "For a job · Paste a job ad, we build from your experience"). Sentence case; no "AI" labels (0031, web.dev).

### Not now

- **From a template:** Flovet listed it first. There's one template today (0025), so the card would do what Blank does; per 0032, no option that doesn't work yet. It joins the row when a second template exists.
- **Describe my experience:** cut (Flovet).
- **Word files:** PDF first; a Word converter is a new dependency (Ask first).
- **Personas and a synced profile:** option 2 above, its own decision.

### Order of building

1. "Suggest a rewrite" (0049).
2. **Start cards with Blank, Import from LinkedIn and Upload a CV** (one spec: the cards, the dialogs, `cv.import`).
3. **For a job**, with 0049's Job tab and tailoring (it needs the base and the match score).

## Where roles disagreed

- **Base now or a profile table.** Database preferred the profile table for one true source. Tech Lead and PM chose reading from her CVs: no migration, nothing to sync, and it delivers "never retype" with the data we already have. Revisit with personas.
- **"For a job" first or Blank first in the row.** Product wanted "For a job" first (Flovet: "very important"; why she's here tonight). UX kept Blank first as the default Flovet asked for, with "For a job" second and as the row's one violet card once she has a CV (before that, it can't work alone, so Blank is violet).

## Consequences

- **Easier:** every new CV starts from one place; importing and creating from a job reuse 0036's tasks and 0049's Job tab.
- **Harder:** duplicate detection across CVs (rules in the spec, with tests); the first "For a job" needs a gentle detour to bring her facts in.
- **Needs Flovet:** approval; the base as option 1; PDF only first; Template waiting for a second template.
- **Privacy page (0011):** uploaded files and LinkedIn PDFs go to the named AI provider and aren't stored.
- **A review checks:** every create path ends in the editor; no fact on a CV that isn't in her base or source; files not stored; no card for a start that doesn't work yet.
