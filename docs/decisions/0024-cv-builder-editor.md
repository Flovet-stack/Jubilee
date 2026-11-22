# 0024: CV builder: guided editor, live preview and autosave

- **Status:** Approved
- **Proposed:** 2026-11-22 by the product team (roles: Product, UX, UI, Copy, Frontend, Backend, Tech Lead, PM)
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Supersedes:** none. Builds on 0008 §2 (the CV editor is a section list, not a locked wizard), 0016 (data model, revisions, react-pdf) and 0021 (date and phone fields).
- **Specs:** (the builder spec, #14)

## Context

Issue #14 is MVP feature 1: "a guided editor that builds a clean, ATS-readable CV". It is free, it drives sign-ups, and the activation target is "60% of sign-ups finish a CV within 15 minutes" (brief, `docs/product/mvp.md`). Its scope is guided steps (contact, summary, experience, education and skills), autosave and a live preview. Tailoring, more than one template and scoring are out of scope.

Earlier decisions already settle some of this:

- **0008 §2:** the editor is "a list of sections the user can jump between (not a locked wizard)". Each section shows one summary line, and its form opens in place.
- **0016:** content is one Zod-validated document. Typing autosaves without a revision, and the editor writes at most one `user` revision per editing session. PDFs come from react-pdf on the server. 0016 left one question to this decision: should the preview show the real PDF or a separate HTML view?
- **0021:** month-precision `DateRangeField` with a "Current" box, and `PhoneField`.

Still open:

1. How "guided" fits with a free section list.
2. The editing model: forms or on-page editing.
3. How the preview is drawn, on phones and on desktop.
4. How saving works.
5. What guidance we give without AI (AI waits on #11).
6. How sections and entries are added and ordered.

## Research

Flovet asked us to reverse-engineer the larger products, starting with Teal. Teal's builder is behind sign-up, so we read its help centre (29 articles, opened in the browser) and didn't create an account. For the open-source builders we read the code.

| Reference                                       | What they do                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Adopt / adapt / reject                                                                       | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Teal**: content model                         | The "Teal resume" is a master library: every job, "15-20 bullet points per position", 2–3 summaries. Each sent resume is a view of it with checkboxes ("Toggling a bullet off doesn't delete it"). "Resume Syncing": new content appears in every resume, and edits offer "Save to all resumes", or else an "Update Available" flag. Auto-Select switches off items that don't fit a job. The match score is coloured by keyword: green (on the resume), yellow (in the library, switched off), red (missing)                                                                                                                                                      | **Reject for MVP; keep the door open**                                                       | It's Teal's core and it makes tailoring fast. But it asks for 15–20 bullets per job before the first CV is done, which works against our 15-minute target and first-time users (design brief §3). Our 0016 model copies the master into a version. A library with toggles is feature 2 in `feature-priorities.md` ("Work-history library") and fits later as per-entry `hidden` flags. Nothing here blocks it                                                                                                                  |
| **Teal**: editing                               | Sections listed down the page. "Add Work Experience" or a "+" at the top of a section. Hover and click a pencil to open a form. Bullets are added one by one ("Add Bullet") and saved with Save/Cancel. Edit mode shows a character and word count ("C: 199 W: 28"), aims for "100-150 characters", and has a red dot for unsaved changes. Drag handle (six dots) to reorder. Hover toolbar: improve with AI, edit, duplicate, delete. Delete is permanent and confirmed. Company and position are separate records, with a "+" for another role at the same company. Entries sorted by date by default, with a "Manual" option. Bold, italic and links in bullets | **Adapt**                                                                                    | Adopt: one field per bullet, a quiet character count, date order by default with manual moves. Reject: Save/Cancel per bullet (autosave is simpler and avoids losing work); hover-only controls on touch screens (no hover there). On desktop the hover toolbar is adapted: shown on hover and on keyboard focus; a permanent delete with a confirm (we use Undo, 0008 §1b); the company/position split (two entries do the job, and the template can group them later); rich text (an ATS risk, and the schema is plain text) |
| **Teal**: design and sections                   | Template and styling sit in a separate "Design Mode": template library, font, line height, accent colour, date format ("MM/YYYY", "Jan YYYY"…). Sections are reordered by drag and renamed with a pencil. "Teal does not offer the ability to create custom sections"                                                                                                                                                                                                                                                                                                                                                                                              | **Adapt**                                                                                    | One template in #14, so no design mode. The date format follows the market (#13), not a user setting. Our schema already has a `custom` section, so we keep it                                                                                                                                                                                                                                                                                                                                                                 |
| **Rezi**                                        | A guided builder: "guides you through each section one step at a time" with section tabs across the top, so users can also jump. Core order: Contact, Experience, Education, Skills, Summary, with the summary last. Extra sections come from a "three-dot menu". The template is chosen late, on "Finish Up & Preview", where sections are reordered and renamed. Onboarding is a short form (name, experience level, language, optional target job)                                                                                                                                                                                                              | **Adopt (order and guidance), adapt (layout)**                                               | It's the closest match to "guided steps" that still lets users jump, which is 0008's rule. Writing the summary after the experience is easier; it still prints at the top. Tabs across the top don't fit 360 px with 5 or more sections, so we use a list. Template choice is moot with one template                                                                                                                                                                                                                           |
| **Kickresume**                                  | The template is picked first, then a free section list in a left sidebar, split-screen with a live preview. "Your data is saved automatically every few seconds when online." Guides per section, and examples above the preview. Drag a section title to reorder, double-click to rename                                                                                                                                                                                                                                                                                                                                                                          | **Adopt (autosave, guides); reject (template first)**                                        | Autosave with no Save button is what users of Google Docs expect. Per-section guides fit our "guidance without AI". Picking a template first is a choice before any content, and we have one template                                                                                                                                                                                                                                                                                                                          |
| **Enhancv**                                     | Edits inline on the page itself ("Inline editing directly inside the resume layout"), with a toolbox, auto-save, and a "+" for a new section or entry. Account optional at the start                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **Reject (inline canvas)**                                                                   | Editing on a scaled A4 page is hard on a 360 px phone, hard to make accessible (labels, errors, keyboard), and ties the form to one template. Forms beside a preview survive new templates, import and AI                                                                                                                                                                                                                                                                                                                      |
| **Europass**                                    | Profile first: data is entered once, then each CV selects items from it and picks a design                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Reject for MVP**                                                                           | Same library model as Teal, same reasons                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Reactive Resume** (open source, code read)    | Live preview renders the **real PDF in the browser** (react-pdf to a blob, painted by pdf.js on canvases). It waits 250 ms of quiet typing, a render takes about 230 ms for two pages, and new renders cross-fade. On phones the preview hides behind the editor, and a "reflow" HTML view is built from a shared **semantic tree**, the same tree the PDF uses. Autosave is debounced 500 ms, with `expectedUpdatedAt`, so a save from a stale tab gets `RESUME_VERSION_CONFLICT` and keeps the local copy. Statuses: saving, saved, offline, error ("Not saved · Retry"), conflict. Unsaved work goes to localStorage. Full undo/redo, merging typing per field  | **Adapt (shared tree, save statuses, version check); reject (PDF in browser, localStorage)** | One semantic tree feeding both renderers keeps preview and PDF from drifting, so we adopt that. Version check and honest statuses are cheap and prevent silent overwrites between tabs. Shipping react-pdf and pdf.js to the browser conflicts with "keep pages light" (brief); estimated at several hundred kB, to be measured in #15. Keeping CV content in localStorage leaves personal data on shared devices (brief: sensitive data). Full undo is a later nicety; typing undo in fields is native                        |
| **OpenResume** (open source, code read)         | Renders the react-pdf template's elements as DOM inside an iframe for an "instant" preview, because the PDFViewer "is rendered too slow". It suppresses the console errors this causes. Saves the whole state to localStorage                                                                                                                                                                                                                                                                                                                                                                                                                                      | **Reject (the hack); adopt the lesson**                                                      | It confirms that a real-PDF preview is too slow for typing, and that one template source is worth having. Rendering react-pdf primitives as DOM is unsupported and noisy, so we share the semantic tree instead                                                                                                                                                                                                                                                                                                                |
| **NN/g, wizards** (Budiu)                       | Wizards for "novice users or infrequent processes", but they're "not gracefully interruptible". Show the list of steps and the current one, use descriptive buttons rather than "Next", and "Allow users to exit the wizard midway and save state"                                                                                                                                                                                                                                                                                                                                                                                                                 | **Adopt**                                                                                    | A first CV is a novice task, so we guide it. Editing later is repeated, so we let users jump. Buttons name the next section                                                                                                                                                                                                                                                                                                                                                                                                    |
| **GOV.UK, complete multiple tasks** (task list) | For tasks done "over a number of sessions". Show it at the start of each returning session. Allow "any order". Statuses start with "Completed" / "Incomplete", and completed rows get no colour, so open ones stand out. Errors are shown at the field, not as a status                                                                                                                                                                                                                                                                                                                                                                                            | **Adopt**                                                                                    | The section list is a task list with a summary line (0008) and a two-state status. No red status: errors live at the field                                                                                                                                                                                                                                                                                                                                                                                                     |
| **GOV.UK, dates**                               | Approximate dates are allowed ("December 2017"); typing always works, and a JS calendar is never the only input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **Adopt (already in 0021)**                                                                  | Month + year with "Current" covers CV dates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

Sources (opened 2026-11-22):

- Teal: https://help.tealhq.com/en/collections/9568976-resume-builder, https://help.tealhq.com/en/articles/14435724-how-to-build-your-resume-in-teal, https://help.tealhq.com/en/articles/9457698-making-changes-across-resumes, https://help.tealhq.com/en/articles/14435954-how-to-edit-resume-bullets-in-teal, https://help.tealhq.com/en/articles/10644765-sections-tab, https://help.tealhq.com/en/articles/12062117-using-auto-select, https://help.tealhq.com/en/articles/14435726-how-to-tailor-your-resume-for-a-specific-job, https://help.tealhq.com/en/articles/10620354-target-titles-professional-summaries, https://help.tealhq.com/en/articles/10620368-skills-interests, https://help.tealhq.com/en/articles/9510029-presentation-tab, https://intercom.help/tealhq-9a9274919b13/en/articles/10620365-work-experience, https://intercom.help/tealhq-9a9274919b13/en/articles/10620266-contact-information
- Rezi: https://www.rezi.ai/docs, https://www.rezi.ai/rezi-docs/create-resume, https://www.rezi.ai/rezi-docs/the-finish-up-tab, https://www.rezi.ai/rezi-docs/how-to-reorder-resume-sections, https://www.rezi.ai/rezi-docs/how-to-rename-resume-sections
- Kickresume: https://www.kickresume.com/en/help-center/resume/, https://www.kickresume.com/en/help-center/general/
- Enhancv: https://help.enhancv.com/en/collections/291278-getting-started-with-your-resume, https://help.enhancv.com/en/articles/1196303-how-we-save-your-resume-progress-while-you-work, https://help.enhancv.com/en/articles/2804992-how-to-rearrange-the-sections-on-your-resume, https://help.enhancv.com/en/articles/14432262-how-to-add-a-new-section-to-your-resume-in-the-new-editor-toolbox-on-top, https://enhancv.com/blog/enhancv-vs-resumebuilder/
- Europass: https://europass.europa.eu/en/create-europass-cv
- Reactive Resume (code, `main` at 2026-11-20): `apps/web/src/features/resume/builder/draft.ts`, `apps/web/src/features/resume/preview/preview.browser.tsx`, `apps/web/src/features/resume/preview/reflow.ts`, `apps/web/src/routes/builder/$resumeId/-components/page-canvas.tsx` in https://github.com/amruthpillai/reactive-resume
- OpenResume (code): `src/app/components/Resume/index.tsx`, `ResumeIFrame.tsx`, `ResumePDF/index.tsx`, `ResumeControlBar.tsx`, `src/app/lib/redux/local-storage.ts` in https://github.com/xitanggg/open-resume
- https://www.nngroup.com/articles/wizards/, https://design-system.service.gov.uk/patterns/complete-multiple-tasks/, https://design-system.service.gov.uk/patterns/dates/

Not read:

- **Teal's builder itself:** it needs an account.
- **Kickresume's redesign article:** it now redirects to the mobile-app page.
- **NN/g's autosave article and GOV.UK's "add multiple things" pattern:** both returned 404.

## Options

**Structure**

1. **Locked wizard** (one step per screen, Back/Next): the simplest first run. But it breaks 0008, and returning users can't jump.
2. **Free section list only** (Teal, Kickresume): fine for repeat editing, but first-time users get no path.
3. **Guided first pass over the section list** (Rezi, GOV.UK task list): a first CV walks through the core sections in order, and every section can always be opened from the list.

**Preview**

1. **Real PDF in the browser** (Reactive Resume): exact pages. But it's heavy to download, and needs pdf.js and a worker on phones.
2. **PDF from the server on each pause:** exact pages and light on the client. But a round trip per pause, server cost on every keystroke pause, and Android Chrome can't show a PDF inside the page.
3. **HTML preview from a shared semantic tree** (Reactive Resume's phone reflow, OpenResume's lesson): instant and light. Line breaks can differ slightly from the PDF, so page breaks shown in the preview are approximate.

## Decision

**Structure option 3, preview option 3.** The rules the spec builds on:

### 1. Guided first pass over a section list

- **The editor is a section list** (0008 §2, GOV.UK task list). It shows Contact, then the CV's sections in print order, with "Add a section" at the end. Each row shows the section name, a one-line summary and a status: "Done" in plain text, or "To do". Nothing is red.
  - Example summary lines: "3 jobs · latest: Analyst, Orange", "Not started".
  - **"Done" rules:** Contact needs a name and an email or phone. A list section needs one entry. The summary needs text.
- **First pass on a new CV:** the editor opens Contact. Each section ends with a button that names the next one ("Next: experience"). The order is **Contact → Experience → Education → Skills → Summary** (as Rezi does: the summary is easier to write once the experience is down). The summary still prints near the top.
  - Every section can be skipped and reopened from the list. The list stays visible beside the form on desktop and one tap away on phones.
  - There's no step counter. The list itself is the progress.
- **After the first pass,** returning users see the list first (GOV.UK: "at the start of each returning session"). The last button reads "See your CV", which opens the preview.

### 2. Forms beside a preview, never edits on the page

- **One section's form at a time,** in place (0008). List sections show their entries as cards with one summary line, for example "Analyst · Orange · Jan 2021 – now". Tapping a card opens its form inline, and only one entry is open at a time.
- **Fields** come in groups of 4–6 (0008), using 0021's `DateRangeField` (month precision, "Current") and `PhoneField`. The schema's limits are the field limits.
- **Bullets** (`highlights`) are one field each, with "Add a bullet" and move up/down. A quiet character count appears from 150 characters ("aim for 1–2 lines": Teal's 100–150 range). No rich text: bullets stay plain text for ATS.
- **Skills** are typed one by one, or pasted as a comma list that splits into one item each (Teal). Skills form a group only if the user adds a group heading.
- **New entries go in date order,** most recent first (the reverse-chronological rule: Europass, Teal's default). Users can move an entry up or down. Section order is changed the same way, with up/down buttons rather than drag only (no hover or drag dependency; works by keyboard and on phones).
- **Entry and bullet actions** (move up/down, delete) depend on the input (as 0020 sizes controls by pointer). With a mouse (`hover: hover` and `pointer: fine`), they appear in a small toolbar when the row is hovered or has keyboard focus (`:focus-within`), so the page stays quiet (Teal). On touch screens they are always visible, or sit in a "More" menu on the row. They are never reachable by hover alone.
- **Delete** removes an entry or bullet at once, with an Undo toast (0008 §1b: reversible things just happen, with Undo). Typing undo is the field's native undo. No undo stack.
- **Sections** offered under "Add a section": languages, certificates, projects, awards, volunteering and custom. Every section can be renamed; an empty title uses the default heading in the CV's language (the schema's rule). A section can also be hidden or removed.

### 3. Live preview: HTML from one semantic tree

- **One pure function** in `src/features/cv/` turns `CvContent` into a semantic tree: sections and entries in print order, hidden and empty ones dropped, headings in the **CV's** language, and dates formatted for the CV's market.
- **Two renderers read the tree:** an HTML preview component now, and the react-pdf template in #15. The HTML preview never formats on its own. A test checks that both renderers print the same text in the same order (#15 adds the PDF side).
- **Desktop (≥ 1024 px):** the form on the left, and the paper preview on the right, sticky and scaled to fit. It's the largest thing on the screen (design brief principle 1).
  - The paper is Letter for the US market and A4 for France.
  - Approximate page breaks are drawn as a dashed line labelled "Page 2 starts about here". The exact pages come from the PDF.
- **Phone:** the form fills the screen. A "Preview" button (bottom half, 0008 one-thumb rule) opens the preview full screen as a sheet. The preview re-renders only while it's visible (as Reactive Resume does).
- **Updates:** the preview follows typing with no network call. It's ordinary React state, re-rendered after a short pause, about 150 ms.
- **No PDF in the browser,** no pdf.js, and no new dependency in #14.

### 4. Autosave

- **No Save button** (Kickresume, Enhancv, Reactive Resume). Changes are saved through `saveContent` (0016, 0002) about 1 s after typing stops, and also when the user leaves a field or a section.
- **Status** in the editor header, as short text with no spinner:
  - "Saving…", then "Saved".
  - "Not saved. Check your connection." with "Try again" (offline or a server error).
  - "This CV changed in another tab." with "Reload" (a conflict).
  - The browser's leave-page warning appears only while changes are unsaved.
- **Version check:** each save sends the `updatedAt` it last saw. If the row has changed since, the save is refused as a conflict instead of overwriting.
  - This needs a change to `saveContent` only (an `updated_at` match on the update), not a migration.
- **Only valid content is saved.** Fields validate when they lose focus, with the error at the field, saying what to fix (the brief's copy rules).
  - A field with an error keeps its last valid value in the saved CV. The status then reads "1 field not saved".
  - This way the document in the database always passes `cvContentSchema`.
- **Revisions:** on the first save of a visit, the editor calls `addRevision(source: 'user')` first. That snapshots the CV as it was when opened, so "how it was before today" can always be restored. Later saves in the same visit add no revision (0016).
- **No CV content in localStorage or sessionStorage:** CVs are sensitive personal data and many people use shared devices (brief). Unsaved changes live in memory only.

### 5. Guidance without AI

- **Every section has a short hint** under its title, and a "How to write this" disclosure: 3–4 tips and one example, in the message files, en and fr.
  - Example tips: start bullets with a verb; add a number where you have one ("what, how, result", after Teal's XYZ); keep to 1–2 lines; most recent first.
- **Examples are clearly examples, never filled in.** No prewritten phrase bank, because Jubilee "must never invent experience" (brief).
- **No score, no AI button** (out of scope in #14). AI writing comes with #11 and #20.

### 6. Creating a CV

- **"Create a CV"** asks for the CV's language and market. Both are prefilled from the locale: `fr-fr` → French, France; `en-us` → English, US; `en-gb` → English, US until the UK market exists (0005, 0017).
  - The title defaults to "[Name] CV" once a name is entered.
  - Then the editor opens on Contact.
- **Import** (#16) is added to this screen later. #14 builds only "Start from scratch".

**Where the roles disagreed:**

- **Preview.** UI wanted the exact PDF in the preview. Frontend and the Tech Lead chose HTML for weight and speed on mid-range phones, and accepted approximate page breaks. The download (#15) is the exact version, and a test keeps the two renderers' text identical.
- **Content model.** Product weighed Teal's library model, which is faster tailoring later, against a first CV in 15 minutes. It chose the 15 minutes. The library is feature 2 and can be added through `hidden` flags without changing the schema version.

## Consequences

- **#14 needs two things decided first.**
  - The **first CV template and its typography**, the "CV templates and their typography" row in the README's "Still to decide": a one-column, ATS-safe layout that the preview draws and the PDF reuses.
  - 0021's fields must be built and merged (spec 11, PR #56).
  - The app shell (navigation) is not needed: the editor can live in the current `(app)` layout with a back link to Home.
- **Easier:**
  - #15 (PDF) only adds a renderer to an existing tree.
  - #16 (import) and #20 (tailoring) write into the same document and reuse the same forms.
  - Teal-style toggles can be added later.
- **Harder:**
  - The preview's page breaks are estimates.
  - Two renderers must stay in step, which the shared-tree test enforces.
- **Rules out:**
  - On-page (canvas) editing.
  - Rich text in bullets.
  - Per-user date formats (dates follow the market, #13).
  - Keeping CV content in browser storage.
- **Review checks:**
  - Every rule above.
  - The no-ai-slop skill.
  - Screenshots at 390 px and 1440 px with French strings.
  - Keyboard-only through the whole first pass.
  - A save conflict between two tabs.
  - The database row always passes `cvContentSchema`.
