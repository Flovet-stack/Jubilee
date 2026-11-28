# 31: Start cards, LinkedIn import and CV upload

Status: In progress (built; review pending) · Written: 2026-11-28

## Goal

Every new CV starts from one row of cards at the top of the Resumes page (0050). This spec builds that row:

- **Blank CV**
- **For a job** (shown, but disabled)
- **Import from LinkedIn**
- **Upload a CV**

The two import cards read the user's own LinkedIn profile (pasted or as a PDF) or her own CV PDF. A new CV then opens in the editor with its sections filled, and each imported section is marked "Imported: check it" until she opens it. This is MVP feature 2 (#16).

## User lens

Aminata (29, data analyst in Paris). Full lens in [0050](../docs/decisions/0050-ways-to-start-a-cv.md) and [0052](../docs/decisions/0052-linkedin-import-sources.md#user-lens).

1. **Why:** she wants a CV without retyping what's already on LinkedIn or in an old PDF.
2. **How:** on a laptop she clicks a card, uploads the file or pastes, waits up to about 30 s, and lands in the editor. On a phone the cards sit in a 2×2 grid and she pastes, because LinkedIn's app has no Save to PDF.
3. **Next:** "Did it get it right?" The marked sections tell her where to look. Opening each one clears its mark.
4. **Left out:**
   - For a job working (the card is disabled until its own decision and spec)
   - importing into an existing CV
   - Word files, the LinkedIn data export, URLs and re-sync

## Decisions

Implements:

- [0050](../docs/decisions/0050-ways-to-start-a-cv.md): where the cards go, the four starts, the dialogs, failures, copy, and `/cvs/new` redirecting to the Resumes page
- [0052](../docs/decisions/0052-linkedin-import-sources.md): the inputs, reading text first, privacy and the file never being stored. Its review-before-create step is replaced by 0050's "Imported: check it" marks (Flovet, 2026-11-28).
- [0049](../docs/decisions/0049-ai-in-the-cv-editor.md), place 2: `cv.import`, and no invented facts

Also builds on:

- [0036](../docs/decisions/0036-ai-provider-and-integration.md) and [0041](../docs/decisions/0041-groq-default-while-testing.md): `runTask`, caps, redaction
- [0016](../docs/decisions/0016-cv-data-model-and-pdf-rendering.md): the content schema and `cv_revisions`
- [0024](../docs/decisions/0024-cv-builder-editor.md): the guided first pass and the locale defaults
- [0032](../docs/decisions/0032-resumes-page-and-sidebar-cap.md): the Resumes page
- [0029](../docs/decisions/0029-type-spacing-for-every-control.md): spacing inside controls

Approved by Flovet in chat:

- 2026-11-27: `unpdf` (pinned, server-only); caps of a 5 MB PDF, 10 pages and 30,000 pasted characters
- 2026-11-28:
  - follow 0050's marks instead of a review screen
  - show all four cards, with **For a job disabled** until its decision and spec land; this must ship enabled before launch
  - an optional `imported` field in the content schema (no migration, as `hiddenKeywords` in 0048)

## Acceptance criteria

1. **Routes.**
   - The sidebar plus, "Create resume" on the Resumes page and on Home all go to `/[locale]/cvs`, scrolled to the top.
   - `/[locale]/cvs/new` redirects there.
   - `create-cv-form.tsx` is removed or folded into Blank.
2. **Start cards.**
   - A row above the list, in this order: Blank CV, For a job, Import from LinkedIn, Upload a CV.
   - A 2×2 grid under `sm`.
   - Each card has a noun title and a short line (0050 copy), with no "AI" labels.
   - Blank is the violet card.
   - With no CVs, the cards are the page, and the empty-list message isn't shown.
3. **Blank CV.** One click creates a CV with the language and market taken from the locale (0024) and opens the editor on the guided first pass. There's no dialog.
4. **For a job (disabled).**
   - Rendered with `disabled` and `aria-disabled`, not focusable as a button.
   - A short line says it's coming soon (message files).
   - No dialog and no handler.
   - A `TODO(spec: for-a-job)` comment names the missing decision.
5. **Import from LinkedIn dialog** (a sheet on phones, using `ui/dialog`).
   - Title: "Import from LinkedIn".
   - Tabs: **Upload PDF** (the default on fine pointers) and **Paste text** (the default on coarse pointers or under 640 px).
   - One help line per tab (More > Save to PDF, on a computer / copy the profile page), plus "Your own profile only."
   - One primary button: **Import**.
6. **Upload a CV dialog.**
   - Title: "Upload a CV".
   - One PDF file field and the line "Your own CV. The file is read, then discarded."
   - One primary button: **Upload**.
7. **File field.** If `ui/` has no file field, build one to the component quality bar (brief), with every state: empty, chosen (name and size, Remove), drag-over on fine pointers, invalid with its message, disabled and read-only. Light and dark.
8. **Server action** `importCv(formData)` in `src/features/cv-import/actions.ts`. It's shared by both dialogs, with `source: "linkedin" | "upload"`.
   1. Checks the user.
   2. Validates with Zod: a PDF by MIME type and magic bytes within the caps, or text within its cap.
   3. Extracts the text in memory (`unpdf`).
   4. Returns `no_text` if the text is under 200 characters.
   5. Calls `runTask("cv.import", { text, source, locale }, { userId })`.
   6. Validates the result against the 0016 schema.
   7. Creates the CV through the existing `createCv` path, with the content, `imported` set to the sections it found, and a language taken from the text (falling back to the locale).
   8. Appends one `cv_revisions` row with `source = 'import'` and the note "LinkedIn import" or "CV upload".
   9. Redirects to `/[locale]/cvs/[id]`.

   The file is never written to storage, the database or logs. The action is idempotent per submission (a token in the form), so a double click makes one CV.

9. **`cv.import` task.**
   - It replaces the placeholder in `src/lib/ai/tasks.ts`.
   - The input is `text`, `source` and `locale`.
   - The output reuses the 0016 content schema (fields nullable, not optional), plus `unread: string[]`, the parts it couldn't map.
   - The prompt:
     - extracts only what's in the text and never invents employers, dates or skills
     - keeps the source language
     - maps LinkedIn and common CV headings (Experience, Education, Skills, Languages, Certifications, Summary/About, and their French equivalents)
     - ignores page furniture
   - It runs on the default route (0041).
10. **Contact details** are redacted before the call (spec 26). Email, phone and LinkedIn URL are found in the original text by a server regex and set on the CV's contact fields. They're never sent to the model.
11. **Imported marks.**
    - Content gains an optional `imported?: SectionKey[]`.
    - The section list (0043) shows a small "Imported: check it" badge on those sections.
    - Opening a section's form removes it from `imported` and saves through the existing autosave.
    - `unread` items show once as a calm note at the top of the editor ("We couldn't place: …") that she can dismiss. They're never guessed into a section.
12. **Failures** in the dialog, with the input kept:
    - `limit`, `unavailable` and `failed` use the `ai.errors.*` copy
    - `too_large`, `not_pdf`, `too_long` and `no_text` get their own copy (what happened and the fix, with no "invalid")
    - each ends with **Start blank instead**

    Failed calls don't count toward the limit.

13. **Pending.**
    - The primary button shows its loading state and the inputs are read-only.
    - A status line says it takes up to about 30 seconds (`aria-live="polite"`).
    - The dialog can't be closed by an outside click while pending.
14. **Copy.**
    - All strings live in `src/messages/*.json` (`cv.start.*`, `cv.import.*`), in every locale, and the parity test passes.
    - Copy role review.
    - Privacy page (0011, 0050 consequences): it says LinkedIn PDFs, uploaded CVs and pasted text go to the named AI provider with contact details removed, and that files aren't stored. The "last updated" date changes.
15. **Eval.** Made-up fixtures in `src/lib/ai/fixtures/`: a LinkedIn-style profile in English and one in French, and one plain CV. `pnpm ai:eval cv.import` passes on all three. It checks no invented employers or dates and that the language is kept.
16. **Tests** (model mocked):
    - file validation (type, size, pages)
    - `no_text`
    - contact details absent from the model input but present on the CV
    - schema failure returns `failed`
    - success creates one CV, one `import` revision and the right `imported` list
    - a repeated token makes no second CV
    - opening a section clears its mark
    - `/cvs/new` redirects
    - For a job has no action

## Out of scope

- For a job working (the Job tab, match score, tailoring, the base of facts): its own decision and spec, needed before launch.
- Importing into an existing CV. Word files, OCR and scanned PDFs, sending the PDF itself to the model. The LinkedIn data export, URLs, extensions, re-sync and photo import.
- A From template card (0050: waits for a second template).

## Edge cases

- French or mixed text: keep the source language, and set the CV language from it.
- Dates like "Present", "aujourd'hui" or "2019 – 2021 (2 ans)", and month-only or year-only dates: kept as given in the schema's date shape.
- A long profile with more than 20 roles: keep everything within the caps.
- A PDF with a password, or a corrupt one: `not_pdf` copy.
- Pasted text with no headings: `failed`, with copy suggesting the PDF or Start blank.
- The limit is reached: the calm message, the input kept, and Start blank offered.
- A section in `imported` that the user deletes: drop it from the list.

## Files and patterns to follow

- `src/app/[locale]/(app)/cvs/page.tsx`, `cvs/new/page.tsx`, `src/features/cv/components/cv-index.tsx`, `section-list.tsx` and `cv-editor.tsx`.
- `src/features/cv/actions.ts` (`createCv`, `addRevision`) and `schemas.ts` (add `imported`, optional, as `hiddenKeywords`).
- `src/features/cv/rewrite-actions.ts` for calling `runTask` from a feature, and the ESLint AI-import rule.
- `src/lib/ai/tasks.ts`, `redact.ts`, `index.ts` and `fixtures/`.
- `src/components/ui/dialog.tsx`, `tabs.tsx`, `field.tsx`, `button.tsx`, `badge.tsx` and `feedback.tsx`.
- Next.js docs in `node_modules/next/dist/docs/` for Server Actions with `FormData` files and `serverActions.bodySizeLimit` (6 MB covers the 5 MB cap).

## Boundaries

- Always:
  - read files on the server and never store them
  - every model call goes through `runTask`
  - validate output before saving
  - copy goes in the message files
  - controls are spaced by the type-spacing skill
- Ask first:
  - any other dependency or a cap change
  - any migration or RLS change (none expected)
  - any body limit beyond 6 MB
- Never:
  - send contact details to the model
  - invent content
  - scrape LinkedIn
  - enable For a job in this spec
  - use `any` or `@ts-ignore`
  - push to `main`

## Check

- `pnpm check` passes.
- `pnpm ai:eval cv.import` passes on the three fixtures, with the output in the PR.
- End to end in the dev server, all three through the dialog to the editor:
  - a real LinkedIn PDF (Flovet's, not committed)
  - pasted text
  - an uploaded CV PDF

  Marks show and clear, and a `cv_revisions` row with `source = import` exists (query shown).

- Screenshots of the card row, both dialogs, the pending state, an error and the editor with marks, at 390 px and 1440 px, in English and French, light and dark.
- Reviewer skill at 90 or more. The score is recorded in this status line.

## Build notes (deviations, with reasons)

- **Model output is a flat import shape**, not the 0016 schema itself: the model never makes ids. `src/features/cv-import/map.ts` adds ids, keeps only `YYYY`/`YYYY-MM` dates, drops an end before its start and empty entries, then the content passes the 0016 schema in `createCv`.
- **`importUnread`** (optional, in content) holds the parts the import couldn't place, until she dismisses the note. A second optional field beside `imported`; no migration.
- **Idempotency** is the pending lock on the form (the button and inputs lock while it reads), not a server token: no table to store tokens in.
- **The action reads messages with `loadMessages`**: `getTranslations` reads `next/root-params`, which Server Actions don't allow (found in the browser).
- **`scripts/ai-eval.mjs`**: the task name was dropped when no `--provider` was given (pre-existing). Fixed.
- **`run-task-core.test.ts`** uses `letter.write` (still a placeholder) now that `cv.import` has its real shape.
- **For a job** is a disabled card with a `TODO(spec: for-a-job)`.
