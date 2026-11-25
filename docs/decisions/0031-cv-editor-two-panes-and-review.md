# 0031: CV editor in two panes, a top bar, and review flags on sections

- **Status:** Approved
- **Proposed:** 2026-11-25 by the product team (roles: Product, UX, UI, Copy, Frontend, Tech Lead, PM)
- **Approved:** 2026-11-25 by Flovet (in chat)
- **Supersedes:** in [0024](0024-cv-builder-editor.md), §2's "one section's form in place, beside the list" and §3's desktop layout (form left, preview right). The rest of 0024 stands: the guided first pass, autosave, the semantic tree, guidance without AI.
- **Specs:** [specs/19-cv-editor-two-panes.md](../../specs/19-cv-editor-two-panes.md) (phase 1)

## Context

Flovet asked for a redesign of the editor (in chat, 2026-11-25):

- A **top bar**: back button and the CV's name on the left; the name is made from the CV's headline and the user's name with a separator, and it is renamed by clicking it. On the right, **Find jobs** and a menu with **Export, Duplicate, Delete**.
- **Two panes instead of three:** the section list on the left, the preview on the right. Today there are three columns (list, form, preview).
- Entry actions **on hover**, as 0024 §2 already says.
- **Edit opens the form in place of a pane**, and while a form is open the other pane shows **guidance** on how to write that section.
- The preview pane gets **two tabs: Preview and Analytics** (an AI review of the CV).
- **AI suggestions on the sections themselves**, either shown inline with Accept / Reject, or a flag on what's lacking with a "Suggest an edit" button. Flovet asked the team to pick.

Three things limit what can ship now:

1. **No AI provider is decided** (README, "Still to decide"). Sending CV text to an AI is "Ask first" (CLAUDE.md), so any generated text waits for that decision.
2. **PDF export is #15** and isn't built. **Job matches are feature 7** and aren't built.
3. The brief: "AI must never invent experience; every AI change to a CV is visible and reversible", and 0016: "AI changes only through accepted proposals".

**Reading of the request.** Flovet said both "the form replaces the whole right section" and "when a form is active, this right side is replaced by guidance". Both can't take the same pane. Later he called the section list "the right side", so we read it as: **the form replaces the section list (left); guidance replaces the preview (right).** Flovet to confirm.

## User lens

**User:** Aminata, 29, a data analyst in Paris, editing her CV on a laptop in the evening before applying (brief: active job seeker; assumption: laptop for editing, phone for checking).

1. **Why she opens it:** "I need my CV in shape for this job tonight." She arrives with a CV mostly written and wants to know what's weak.
2. **How she uses it:** laptop, 20–40 minutes, focused. She scans the sections, opens one, edits, glances at the page. She knows her own experience; she doesn't know what recruiters look for.
3. **What she wants next:** "Is it good enough?" then "Where are the jobs for it?" The review tab answers the first; Find jobs (when feature 7 ships) the second; Export the last step.
4. **What we leave out:** a chat assistant, a score out of 100, pre-generated rewrites of everything, AI text before the provider decision, and buttons for features that don't exist yet.

## Research

| Reference                                                                           | What they do                                                                                                                                                                                                                                                                                                         | Adopt / adapt / reject                                                             | Why                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Reactive Resume**, AI in the builder (docs)                                       | The assistant opens "beside your document" and **replaces the editor panel**. "Nothing changes until you accept." Text edits show old struck through and new highlighted, with a reason. Accept, Edit, Reject, Reject all. Edits that add facts are flagged "New detail: check it's true" and left out of Accept all | **Adopt** the proposal card and fact warning; **reject** the chat                  | A pane that swaps content is the same model Flovet asked for. The accept-each, flag-new-facts rule is exactly the brief's "never invent experience". A chat is open-ended and costs more than our users need |
| **Rezi**, Rezi Score (docs)                                                         | Score 1–100 in five categories, updated live. Feedback is "tied to individual entries, like a particular job entry or bullet point", and each item links "directly back into the resume builder". Done items get a green check                                                                                       | **Adopt** feedback tied to entries with a jump; **reject** the number              | A finding that opens the exact entry is what makes a review actionable. A score out of 100 invites gaming and needs AI or a job to be honest; we have neither yet                                            |
| **Enhancv**, CV feedback (feature page; search summary of its help article)         | "Runs 16 crucial resume checks" in themes like content clarity. In the editor, mistakes are marked on the CV; each finding can be fixed by hand or handed to "AI Help"                                                                                                                                               | **Adopt** a set of named checks, flag on the section, fix by hand first, AI second | Many checks need no AI (missing numbers, long bullets, clichés), so the flags can ship before the AI decision. AI then becomes one button on a finding, not a rewrite of everything                          |
| **Teal**, Improve with AI (search summary; the help article returned 403)           | A button on a bullet in edit mode; review the suggestion, accept or regenerate. Warns that suggestions may include placeholder metrics to replace                                                                                                                                                                    | **Adopt** the on-demand button per item                                            | Generated only when asked: cheaper, and the user stays the author                                                                                                                                            |
| **web.dev**, AI UX patterns                                                         | "Users should be able to explicitly accept or edit results before it's saved." Preview before applying, regenerate, undo. Prefer "clear action labels" to "Ask AI"                                                                                                                                                   | **Adopt**                                                                          | Labels like "Suggest a rewrite" rather than "AI"; nothing written to the CV until Accept; Undo after                                                                                                         |
| **arXiv 2603.10374**, co-writing with AI (search summary)                           | Suggestions shown automatically are treated as the default path, and people accept them readily                                                                                                                                                                                                                      | **Adopt** as a reason for on-demand                                                | Auto-shown rewrites on every section would push users to accept text they didn't write, the opposite of the brief                                                                                            |
| **Google Docs, Notion, Figma** title bar (observed in daily use; not a page opened) | The document name sits top left; clicking it turns it into a field; Enter or leaving saves, Escape cancels. Actions in a "More" menu at the top right                                                                                                                                                                | **Adopt**                                                                          | The convention users already know (Krug)                                                                                                                                                                     |

Sources (opened 2026-11-25):

- https://docs.rxresu.me/guides/using-ai-in-the-builder.md
- https://www.rezi.ai/rezi-docs/the-rezi-score-explained
- https://enhancv.com/features/resume-feedback/
- https://web.dev/learn/ai/ux-patterns

Search summaries only (page not opened or refused): Teal's help article 14435954 (403), Enhancv help article 2812225 (redirect not followed), SAP AI placement (403), arXiv 2603.10374.

## Options

**Suggestions on sections**

1. **Pre-generated suggestions inline** (Flovet's first idea): the AI reviews the CV and writes a better summary, title and bullets, shown on each section with Accept / Reject. Fast to accept, but every review pays to generate text nobody asked for, users tend to accept what's shown, and generated text is the riskiest place to invent facts.
2. **Flags with an on-demand "Suggest a rewrite"** (Flovet's second idea): the review marks what's lacking on each section and entry; a button generates a proposal for that one item, shown as old/new with Accept / Reject. Cheaper, the user stays the author, and the flags can ship without AI.
3. **A chat assistant** (Reactive Resume): flexible but open-ended, slower, and more than the job needs.

**Where the form goes**

1. **Form replaces the list, guidance replaces the preview** (our reading of the request). Focused, but the live preview is gone while typing, and the preview is 0024's main feedback loop.
2. **Form replaces the list; the right pane gets a third tab, Guidance, selected while a form is open.** Same focus, and the preview is one click away.
3. **Keep three columns.** Rejected by Flovet.

## Decision

**Suggestions option 2, form option 2.** In two phases, because the AI provider isn't decided.

### 1. Top bar

- **Left:** a Back button (to Home), then the **CV name**.
  - A new CV is named "{headline} · {name}" (for example "Data analyst · Aminata Diallo"), with " · " as the separator. With no headline it's "{name}", with no name it's the current default word ("Resume" / "CV"). It follows the content until the user renames it (as 0024 §6 does today).
  - Clicking the name turns it into a field: Enter or leaving saves, Escape cancels, empty restores the last name. Same `renameCvDocument` as today.
- **Right:** the save status (0024 §4) stays, then a "More" menu:
  - **Duplicate:** a copy named "{name} (copy)", opened in the editor.
  - **Delete:** confirmed in a dialog (a whole CV is not a small reversible thing, 0008 §1b), then back to Home.
  - **Export** and **Find jobs** are added **when #15 and feature 7 ship**. Until then they are not shown, rather than shown disabled (no-ai-slop: no dead buttons).

### 2. Two panes

- **Left pane:** the section list (0024 §1 rows, summary line and Done / To do), with "Add a section" at the end.
  - Entries are listed under their section. Their actions (edit, move up/down, delete; and later "Suggest a rewrite") appear on hover and on keyboard focus with a mouse, and always on touch (0024 §2, unchanged).
  - **Edit** (or clicking a row) replaces the list with that section's form, with a "Back to sections" button at the top and the first-pass "Next: …" button at the bottom.
- **Right pane:** tabs **Preview** and **Review** (we call Flovet's "Analytics" "Review": it's a review of the CV, not usage numbers; Copy's call, Flovet to confirm).
  - While a form is open, a third tab, **Guidance**, appears first and is selected. It holds that section's hint, tips and example (today's "How to write this", moved here), and later the AI's notes for that section. Preview stays one click away.
  - Closing the form removes the Guidance tab and returns to the tab that was open before.
- **Under 896 px** (the content window's breakpoint today): one pane at a time. The list or form fills the screen; Preview, Review and Guidance open from a button as today's sheet, with the tabs inside it.

### 3. Review, phase 1: checks without AI

- The **Review tab** lists findings grouped by section, each with a plain sentence and a link that opens that section's form at the entry ("Go to it").
- The **same findings show on the section list:** a small marker on the row and one line under the entry saying what's lacking. No red; findings use the muted tone with an icon, so they read as advice, not errors (0024: "nothing is red").
- **Checks are pure functions** in `src/features/cv/`, tested, in the CV's language. The spec lists them; the first set:
  - Contact missing email or phone; no headline.
  - No summary, or a summary over about 600 characters.
  - A job or volunteering entry with no bullets.
  - A bullet with no number in it (Teal's XYZ, 0024 §5's tip).
  - A bullet over about 200 characters (two lines).
  - A job entry with no dates.
- **No score out of 100.** The tab shows "{n} things to look at" or "Nothing to fix".
- Nothing is sent to a third party.

### 4. Review, phase 2: AI (after an AI provider decision)

- A **"Suggest a rewrite"** button on a finding (in the Review tab and on the entry). It generates one proposal for that item only.
- The proposal shows **old struck through, new highlighted, and a reason**, in place on the entry, with **Accept**, **Edit** and **Reject**. Nothing is written until Accept; Accept goes through 0016's proposals and shows Undo.
- **A rewrite may only reword what the CV says.** Any number, tool, employer or date that isn't already in the CV is marked "New detail: check it's true" (Reactive Resume) and the user must edit or confirm it.
- The AI review may add its own findings beside the phase-1 checks, and AI notes in the Guidance tab. Never a pre-written rewrite of the whole CV.
- Phase 2 needs: the AI provider decision (provider, prompts, cost limits, data handling, privacy page update per 0011), and Flovet's approval of sending CV text to it.

**Where the roles disagreed:**

- **Guidance vs preview.** Product and UX wanted the preview visible while typing (0024's main loop). UI liked Flovet's full swap for focus. The Guidance tab, selected by default, gives the focus and keeps the preview one click away.
- **Inline vs on-demand.** Product liked pre-generated suggestions for speed. Tech Lead (cost per review) and Copy (users accept what's shown; invented facts) chose on-demand. Phase 1 gives the flags now at no cost.

## Consequences

- **Easier:** a calmer editor with one thing open at a time; review ships without waiting for AI; phase 2 adds one button and one card, not a new layout.
- **Harder:** the list and the form share one pane, so moving between sections is one more click than today. The first-pass "Next" button keeps the guided path fast.
- **Rules out:** three columns; a score out of 100; AI text shown without a request; Export and Find jobs as disabled placeholders.
- **Needs:** a spec for phase 1 (top bar, panes, tabs, duplicate, delete, checks). A separate decision for the AI provider before phase 2. Export joins with #15, Find jobs with feature 7.
- **Review checks:** 390 px and 1440 px, light and dark, French strings in the top bar and findings; rename with keyboard (Enter, Escape, empty); delete confirm; every check tested in both languages; hover actions reachable by keyboard and visible on touch; no CV text leaves the server in phase 1.
