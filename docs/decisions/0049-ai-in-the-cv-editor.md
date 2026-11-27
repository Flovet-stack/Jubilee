# 0049: Where AI goes in the CV editor, and in what order

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: Product, UX, UI, Copy, Tech Lead, PM, Frontend, Backend)
- **Approved:** 2026-11-27 by Flovet (in chat; the team's recommended order, rewrite first)
- **Supersedes:** 0036's "Order of AI specs" (steps 2–5) for the editor's tasks only. 0031 §4 and 0036's rules (proposals, no invention, caps, minimisation) stand unchanged.
- **Specs:** —

## Context

Flovet (2026-11-27): "We still need to incorporate the AI into the resume editor page. How, where, and how does it give the user value?"

What's already settled:

- **0036:** the AI layer (`runTask`, routing, caps, usage log) is built (spec 26). Seven tasks; four touch the editor: `cv.import`, `cv.rewrite`, `cv.tailor` (with `job.extract`), `cv.translate`.
- **0031 §4:** "Suggest a rewrite" on a finding, shown as old/new with a reason, Accept / Edit / Reject; new facts flagged. Never a pre-written rewrite of the whole CV.
- **0016 and the brief:** AI never writes `content` directly; every change is a proposal the user accepts, visible and reversible. AI never invents experience.
- **MVP:** the paywall moment is the first batch of tailored applications. Activation target: 60% finish a CV within 15 minutes.

## User lens

**User:** Aminata, 29, data analyst in Paris (0031, 0036). Laptop in the evening; 3–5 applications a week.

1. **Why she opens the editor:** first, to get a decent CV without typing it all ("I already have this on LinkedIn"). Later, to make one bullet sound stronger, or to fit the CV to one job before applying.
2. **How she uses it:** she works section by section, glancing at the preview and the Review tab. She will read a short before/after; she won't read an AI essay or chat. She wants to stay the author.
3. **What she wants next:** "Is this good enough?" then "Does it fit this job?" then "Write the letter" and "Send it". So every AI result ends in a clear next step: Accept, then back to the CV; or a tailored version, then the letter.
4. **What we leave out:** a chat, AI suggestions as she types, a whole-CV "make it better" button, a CV score out of 100, AI on contact details or dates, anything generated she didn't ask for.

## Research

Most of the research is in 0031 and 0036 (Reactive Resume, Rezi, Enhancv, Teal, web.dev). New for this decision:

| Reference                                                           | What they do                                                                                                                   | Adopt / adapt / reject                 | Why                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Teal, AI Resume Builder (vendor pages)                              | Attach a job description to any resume for a match score; the AI pulls the job's top skills and keywords; job-specific bullets | **Adapt**                              | Tailoring lives on a CV with a job attached. Our score is computed by code (0036), and changes are proposals |
| Rezi, 2026 review of Teal                                           | Says Teal's feedback "sometimes felt disconnected from reality", even on bullets that already had numbers                      | **Adopt as a warning**                 | AI review notes must point at something real in the text, or stay out. Rule checks (0031 §3) stay the base   |
| Kickresume (reviews via Zapier, Jobscan)                            | Drafts a summary and bullets from a job title; free tier limits AI bullets                                                     | **Reject** drafting from a title alone | A draft from a title invents content. We only reword, or import from her own LinkedIn                        |
| Zapier on Teal's free plan                                          | Free AI use is capped per feature (bullets, summaries, letters)                                                                | **Adopt**                              | Same as 0036's per-user caps: free users get a few rewrites a day; tailoring is the pass                     |
| arXiv 2504.08726, interaction-required suggestions (search summary) | Suggestions that need an explicit action keep writers' sense of ownership and awareness                                        | **Adopt**                              | On demand only; the user clicks to ask, and clicks again to accept                                           |
| arXiv 2603.10374 (search summary; also in 0031)                     | Reviewing AI suggestions becomes the main activity and crowds out the writer's own thinking                                    | **Adopt**                              | One item at a time, short reasons, no wall of proposals                                                      |

Sources: decisions 0031 and 0036 (with their sources); search results for tealhq.com/resume-builder, rezi.ai/posts/teal-review, zapier.com/blog/best-resume-builder, jobscan.co/blog/best-ai-resume-builders, arxiv.org/html/2504.08726v1, arxiv.org/html/2603.10374v1. These were read as search summaries; the pages themselves weren't opened. Vendor claims are discounted.

## Options

1. **An AI side panel or chat** in the right pane. Flexible, but open-ended, costly, and 0031 and 0036 rule out a chat.
2. **AI at four points where Aminata already is, all through one proposal card.** Each point answers one need; nothing runs unasked.
3. **One "Improve my CV" button** that rewrites everything. Fast, but it pushes her to accept text she didn't write, and it's the riskiest place to invent facts (0031).

## Decision

**Option 2.** Four places, one shared piece.

### The shared piece: the proposal card

- One component, used by every editor AI task: the old text struck through, the new text highlighted, a one-line reason, and **Accept**, **Edit**, **Reject**.
- Facts not found in the CV (a number, tool, employer, title or date) are marked "New detail: check it's true" and can't be accepted until she edits or confirms them (0031 §4).
- Accept saves through 0016's proposals and shows Undo. Calm failure and caps per 0036.
- It sits **in the open form, under the field it changes**, so she sees it where she'd edit it. The preview updates only after Accept.

### The four places

| #   | Where                                                                  | What she does                                                                                                                                                                                              | Task                       | Value to Aminata                                                                                                            | MVP      |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | **A finding, or a bullet or summary field**                            | "Suggest a rewrite" on a Review finding or next to a bullet or the summary. One proposal for that item.                                                                                                    | `cv.rewrite`               | A weak bullet becomes stronger in seconds, in her words, with no invented numbers                                           | 1 (0031) |
| 2   | **The empty CV and the guided first pass**                             | "Import from LinkedIn": paste the profile or upload its PDF. Sections fill in; she reviews each section before it's kept                                                                                   | `cv.import`                | A full first draft in minutes instead of an hour of typing; drives the 15-minute target                                     | 2        |
| 3   | **The top bar: "Tailor to a job"**                                     | Paste a job. A **Job** tab in the right pane shows the match score, missing keywords and proposals for the summary and bullets. Accepting writes to a **version** of the CV for that job, never the master | `job.extract`, `cv.tailor` | She sees if the job is worth it and gets a fitted CV without rewriting it; the paywall moment, and the bridge to the letter | 5        |
| 4   | **The More menu: "Make a French version" / "Make an English version"** | Creates a version in the other language as proposals, section by section                                                                                                                                   | `cv.translate`             | Write once, apply in both markets                                                                                           | 4        |

### The order

1. **Suggest a rewrite** (place 1). Smallest, already decided in 0031, and it builds the proposal card the other three reuse.
2. **Import from LinkedIn** (place 2).
3. **Tailor to a job** (place 3), which needs its own decision on versions in the editor (0016 has the `cv_versions` table) and the match score.
4. **Translate** (place 4).

### What stays out

- AI review notes in the Review tab beside the rule checks, until the rewrite has shown its notes are accurate (the Rezi warning). Then a short decision.
- AI notes in the Guidance tab (0031 allowed them; we keep the static tips for now).
- Suggestions while typing, a chat, a whole-CV rewrite, a score out of 100, drafting from a job title.

## Where roles disagreed

- **Order.** Product and PM wanted LinkedIn import first, as in 0036, because activation is measured first. The Tech Lead wanted "Suggest a rewrite" first because it builds the proposal card that import's review, tailoring and translation all reuse, and it's the smallest spec. The team recommends rewrite first; import follows straight after. **Flovet decides.**
- **Where the card shows.** UI wanted proposals in the section list rows (visible without opening a form). UX chose the open form: the list rows are one line and truncate (0043), and the form is where she would edit by hand.

## Consequences

- **Easier:** one component for every AI change; each place is its own small spec; nothing runs unless she clicks, so cost follows use.
- **Harder:** "Tailor to a job" brings versions into the editor (which CV am I editing?), and needs its own UX decision.
- **Needs Flovet:** approval of the four places and the order (rewrite first, or import first as in 0036); then the spec for place 1. The `cv.rewrite` prompt and eval replace its placeholder in `src/lib/ai/tasks.ts`.
- **A review checks:** every AI change goes through the proposal card; nothing generated without a click; new details flagged; no contact details in prompts; caps hit show the calm message.
