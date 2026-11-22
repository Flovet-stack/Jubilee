# 14: CV builder (guided editor, live preview, autosave)

Status: Done (91/100, 2026-11-22; offline, too_large and a 20-section CV not run in the browser) · Written: 2026-11-22 · Issue: #14

## Goal

MVP feature 1: a signed-in user creates a CV and fills it in a guided editor, with a live preview of the Classic template and autosave, so they finish a clean, ATS-readable CV in about 15 minutes (brief: activation target). It is the free hook that later features (PDF, import, tailoring) build on.

## Decisions

Implements:

- [0024](../docs/decisions/0024-cv-builder-editor.md): guided editor, live preview and autosave
- [0025](../docs/decisions/0025-first-cv-template-and-typography.md): the Classic template and Carlito
- [0026](../docs/decisions/0026-cv-entry-layout.md): entries in four corners, body line height 1.25

Builds on:

- [0016](../docs/decisions/0016-cv-data-model-and-pdf-rendering.md) and spec 09: the data model and `src/features/cv`
- [0008](../docs/decisions/0008-interaction-disclosure-and-space.md): disclosure, space, one thumb
- [0009](../docs/decisions/0009-design-system-components-icons-motion.md), [0020](../docs/decisions/0020-control-sizes-and-density.md), [0022](../docs/decisions/0022-corner-radius-by-size.md): components, sizes, radius
- [0021](../docs/decisions/0021-phone-date-and-password-fields.md) and spec 13: `DateRangeField`, `PhoneField`
- [0017](../docs/decisions/0017-regional-locales-and-cv-naming.md): "resume" on `/en-us`, "CV" elsewhere; the CV's language is separate from the UI's

## Acceptance criteria

1. **Routes** (in `(app)`, signed-in only, `noindex`):
   - `/[locale]/cvs/new`: the "Create a CV" form.
   - `/[locale]/cvs/[id]`: the editor. Another user's id, or an id that isn't a UUID, shows the not-found page.
2. **Home** (temporary until the app shell decision): lists the user's CVs (title, last edited) with links to the editor, and one primary "Create a CV" button. With no CVs, the empty state says the next step in one sentence (0008).
3. **Create a CV** (0024 §6):
   - Asks for language and market, both prefilled from the locale. `en-gb` gets English, US.
   - Calls `createCv`, then opens the editor on Contact with the first pass on.
   - The title defaults per 0024 once a name is entered, and the user can rename it in the editor header.
4. **Section list and first pass** (0024 §1):
   - The list shows Contact and every section in print order, each with a summary line and a "Done" / "To do" status that follows 0024's rules. "Add a section" sits at the end.
   - The first pass follows 0024's order, with buttons that name the next section. The last button is "See your CV".
   - Any section can be opened from the list at any time.
   - On ≥ 1024 px the list stays beside the form. On phones it's one tap away.
5. **Forms** (0024 §2):
   - Contact uses `PhoneField` for the phone and stores its E.164 value in `basics.phone`.
   - Every entry kind in `cvContentSchema` has a form. Dates use `DateRangeField` at month precision with "Current" where the schema has an end date.
   - Entry cards show one summary line, and one entry is open at a time.
   - Bullets: one field each, add, move up/down, character count from 150 characters.
   - Skills: pasting a comma-separated list adds one skill per item. A section can be renamed, hidden, removed or moved.
   - New entries go in date order. Delete acts at once and shows an Undo toast.
   - Entry and bullet actions: a hover-and-focus toolbar for fine pointers, always visible (or in a "More" menu) on touch (0024 §2).
6. **Guidance** (0024 §5): each section has a hint and a "How to write this" disclosure with 3–4 tips and one example, in en, en-GB and fr. No phrase bank, no score, no AI.
7. **Semantic tree** (0024 §3): one pure function in `src/features/cv/` turns `CvContent` plus `{ language, market }` into the printable tree:
   - sections in order, hidden and empty ones dropped;
   - default headings in the CV's language (0025's table);
   - dates formatted per 0025 ("Jan 2021 – Present", "janv. 2021 – aujourd'hui");
   - entries as four-corner slots (0026).
8. **Classic preview** in `src/features/cv/templates/classic/`:
   - An HTML component reads only the tree and follows 0025 and 0026 exactly: page size by market, margins, sizes, colours, line heights, spacing, the contact line and the four-corner entries.
   - It uses Carlito Regular and Bold through `next/font/local`, as Latin-subset WOFF2 files committed with `OFL.txt`, loaded only on the editor route. The `pyftsubset` command that made them is written in this spec's build notes.
   - The paper is scaled to fit, with approximate page-break lines labelled per 0024.
   - Desktop shows it sticky beside the form. Phones open it from a "Preview" button as a full-screen `Sheet`, and it renders only while open.
9. **Autosave** (0024 §4):
   - Saves about 1 s after typing stops, and when a field or section is left. There is no Save button.
   - The header shows each status: "Saving…", "Saved", the offline/error message with "Try again", the conflict message with "Reload", and "1 field not saved".
   - The leave-page warning appears only while changes are unsaved.
   - `saveContent` takes the `updatedAt` it last saw and refuses a stale save as a `conflict` error (a new `CvError` code). No migration.
   - Only valid content is sent. A field with an error keeps its last valid value in the saved document.
   - The first save of a visit calls `addRevision({ source: "user" })` first.
   - No CV content in localStorage or sessionStorage.
10. **Copy:** every string is in `en.json`, `en-GB.json` and `fr.json`, under a `cv` namespace. US English says "resume" where users see it (0017). French uses _vous_.
11. **Tests** (Vitest):
    - the semantic tree: order, hidden and empty sections, default headings in both languages, date formatting (year only, month and year, current), the four corners with missing slots;
    - section "Done" rules;
    - comma-list skill splitting;
    - the stale-save conflict in `saveContent` (logic level);
    - date-ordered insertion of new entries.

## Out of scope

- PDF export and download (#15). The react-pdf template comes then.
- Import from LinkedIn or a file (#16); the create page only starts from scratch.
- Country formats: photo, personal details, market date styles (#13).
- AI writing, scoring, tailoring, versions (#11, #19, #20).
- More templates, colour choices, a design mode.
- The app shell and navigation (its own decision). Home stays temporary.
- An undo stack beyond the delete toast and native field undo.

## Edge cases

- A brand-new CV with every section empty: the preview shows the name placeholder state, not a blank page. The list shows every row as "To do".
- A very long CV (20 sections, 50 entries): the editor stays responsive, and the preview shows several approximate page breaks.
- Going offline mid-typing: the status says so, and changes are sent when "Try again" is pressed or the connection returns.
- The same CV open in two tabs: the second save shows the conflict message and never overwrites.
- An invalid email or an end date before the start: an error at the field, the rest keeps saving, and the status says "1 field not saved".
- French strings at 360 px: buttons wrap, nothing is truncated (0008).
- A content size over 256 kB: `too_large` shows a plain message at the status, and nothing is lost from the screen.
- A `cvs` row whose content fails `migrateContent`: the editor shows an error page with a way back to Home, never a broken form.

## Files and patterns to follow

- Data access only through `src/features/cv/queries.ts` and `actions.ts` (0002); server actions wrap the plain functions there.
- UI from `src/components/ui/`, restyled through tokens (0009); no new UI library.
- `(app)` guard and next-intl usage as in `src/app/[locale]/(app)/home/page.tsx`.
- Read the Next.js 16 docs in `node_modules/next/dist/docs/` for server actions, `next/font/local` and `cacheComponents` before using them.

## Boundaries

- **Always:** follow 0024–0026 to the letter; test the tree and the autosave logic; run the `no-ai-slop` skill on every screen.
- **Ask first:** any new dependency (none is expected); any migration; any change to `cvContentSchema`.
- **Never:** write CV content to browser storage; prefill entries with invented example content; put CV text in a page header or footer; use `any` or `@ts-ignore`.

## Check

- `pnpm check` passes.
- Screenshots of the create page, the editor (first pass and the list) and the preview at 390 px and 1440 px, light and dark, in English and French.
- Keyboard only: create a CV and finish the whole first pass.
- Two tabs on one CV: the conflict appears, and the database row is unchanged.
- In Supabase, after an edit session: the `cvs` row passes `cvContentSchema`, and exactly one `user` revision was added for the visit.
- Reviewer skill: 90 or more.

## Build notes

- **Fonts (0025).** Carlito Regular and Bold from `google/fonts` (`ofl/carlito`, the `main` branch on 2026-11-22: 628,032 and 682,468 bytes), subset with fonttools in a throwaway virtual environment (not a project dependency):

  ```
  pyftsubset Carlito-<Weight>.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+0100-017F,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212" --layout-features='kern,liga,tnum' --flavor=woff2 --output-file=carlito-<weight>-latin.woff2
  ```

  Results: 36,896 bytes (Regular) and 39,288 bytes (Bold), in `src/features/cv/templates/classic/fonts/` with `OFL.txt`.

- **`saveContent`** takes an optional `expectedUpdatedAt` and returns a new `conflict` error; `renameCvDocument` was added for the editor's title. No migration.
- **`DateRangeField`** (spec 13): `value` is now omitted from the inherited single-date props, so a controlled range type-checks. The editor passes the first value as `defaultValue` too, because the field reads its first value from there.
- **`ButtonLink`** added to `button.tsx`, so server components can render a link styled as a button without calling `buttonVariants` on the server.
- **CV-language words** (headings, "Present") are read with `loadMessages` for the CV's language, because next-intl's request config always follows the page's locale.
- **Autosave** counts edits to know what's unsaved, and a rename waits for the save on the wire while later saves wait for the rename, so the version check never trips on one tab.
