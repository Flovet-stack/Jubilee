# 25: PDF export

Status: Done (93/100, 2026-11-26; reviewer fixes applied after grading) · Written: 2026-11-26 · Issue: #15

## Goal

Amina downloads her CV as a PDF an ATS can read, from the editor, in one click. It's the last part of MVP feature 1 (resume builder).

## User lens

The lens is in [0038](../docs/decisions/0038-pdf-download-flow.md): she has an application form open and needs a file with her name on it, often on a phone.

## Decisions

Implements [0038](../docs/decisions/0038-pdf-download-flow.md) and the PDF parts of [0016](../docs/decisions/0016-cv-data-model-and-pdf-rendering.md) and [0025](../docs/decisions/0025-first-cv-template-and-typography.md). Reads only the semantic tree from [0024](../docs/decisions/0024-cv-builder-editor.md) §3, with the four corners from [0026](../docs/decisions/0026-cv-entry-layout.md). The menu item goes in [0031](../docs/decisions/0031-cv-editor-two-panes-and-review.md)'s More menu. Locales and file words follow [0017](../docs/decisions/0017-regional-locales-and-cv-naming.md). Controls are spaced by [0029](../docs/decisions/0029-type-spacing-for-every-control.md).

## Acceptance criteria

1. **Dependencies:** `@react-pdf/renderer` 4.9.1 (dependency) and `pdfjs-dist` 6.5.438 (dev dependency), pinned. Nothing else.
2. **Fonts:** `Carlito-Regular.ttf` and `Carlito-Bold.ttf` are committed in `src/features/cv/templates/classic/fonts/` next to `OFL.txt`. The PDF registers them from disk, with hyphenation off (the whole word is returned).
3. **Template:** `templates/classic/classic-pdf.tsx` renders a `CvTree` with react-pdf using only `constants.ts`. It follows 0025 and 0026: page size from `tree.paper`, 54 pt margins, one column, no page header or footer, the four corners, bullets with a hanging indent, and section headings in uppercase with a rule. Entries don't split across pages where they fit on one (`wrap={false}` on the corners block); headings never sit alone at the foot of a page (`minPresenceAhead`).
4. **Metadata:** `title` is the file name without `.pdf`, `author` is the name, `language` is the CV's language. `creator` and `producer` are set to the name (or "") so nothing says Jubilee.
5. **File name:** a pure `pdfFileName(...)` in `src/features/cv/` gives "{name} - {word}.pdf", falling back to the CV's title, then to the word alone. It removes the characters 0038 lists, collapses spaces and caps the base at 100 characters. A pure `contentDisposition(name)` gives the ASCII `filename` (accents folded, other non-ASCII dropped) plus `filename*=UTF-8''…`. The word comes from `cv.document.fileWord.{US,FR}` in the CV's language's messages: en "Resume" / "CV", fr "CV" / "CV".
6. **Route:** `GET /api/cvs/[id]/pdf` (`src/app/api/cvs/[id]/pdf/route.ts`, Node runtime) reads the CV with `getCvDocument` (RLS), builds the tree and passes it to `renderCvPdf` in `src/features/cv/pdf.tsx`, which only renders. The route:
   - returns 401 when signed out, 404 for a bad id, another user's CV or a missing one, and 500 for any other failure;
   - on success, sends `application/pdf`, `Content-Disposition: attachment`, `Content-Length` and `Cache-Control: private, no-store`.
   - Errors are logged with the error code only, never the content.
7. **Menu item:** "Download PDF" / "Télécharger en PDF" is the first item in the editor's More menu, with a download icon, above Duplicate.
   - When pressed, it waits for autosave (`flush`). If edits are still unsaved after that (an invalid field held back, offline, conflict, too large), it stops and shows a toast: "Some changes aren't saved yet. Fix them, then download again."
   - Otherwise it fetches the route, reads the file name from `Content-Disposition`, and saves the blob through a temporary link.
   - While it runs, the item reads "Preparing…", is disabled and keeps the menu open (`closeOnClick={false}`). The menu closes when the file is handed to the browser. A second press does nothing.
   - On a failed request: a toast "We couldn't make the PDF. Try again." with a Try again action. 401 and 404 use the existing "signed out" and "not found" messages.
8. **`Menu` component:** `MenuEntry` gains `keepOpen?: boolean` (maps to `closeOnClick={false}`), and `Menu` gains optional `open` and `onOpenChange`. Existing menus behave as before.
9. **Copy:** every new string is in `en.json` and `fr.json` (en-GB inherits). No hard-coded user-facing text.

## Tests

- **Extraction (0016):** render the tree of an English US CV and a French FR CV (accents, œ, « », a long bullet that wraps, every section kind) through `renderCvPdf`'s render function, extract the text with `pdfjs-dist` in Node, and check that every string from `treeText(tree)` appears in that order, with no replacement characters. If Carlito fails this, switch to Liberation Sans (0025) and say so here.
- **Parity (0024):** the same `treeText` order is what `ClassicPreview` prints. The test asserts the PDF side; the HTML side is already covered by `tree.test.ts`.
- **Page size:** US is 612 × 792 pt, FR is 595.28 × 841.89 pt (read from the PDF).
- **Metadata:** title, author and language are set; producer and creator don't contain "Jubilee" or "react-pdf".
- **File name and header:** accented name, no name (title fallback), nothing (word alone), forbidden characters, a 200-character name, and each language and market.
- **Route:** 401 signed out, 404 for a bad UUID (no database call).

## Edge cases

- An empty CV (no name, no sections) gives a valid one-page PDF with only what exists. There's no placeholder name.
- Long words or URLs with no spaces wrap inside the margin and are never cut off.
- Hidden sections and blank entries are left out (the tree already does this).
- A CV of 4 or more pages renders and downloads. Rendering takes under 2 s locally for a 2-page CV; record the time.
- iOS Safari and Android Chrome: blob download through a temporary `<a download>`. Record what each does.

## Out of scope

Other formats, print, share links, a file-name field, downloads outside the editor, versions (`cv_versions`) and attaching to applications (#29), caching, rate limits, PDF/A, tagging. Record whether the output is tagged; don't fix it.

## Files and patterns to follow

- New: `src/features/cv/templates/classic/classic-pdf.tsx`, `src/features/cv/templates/classic/fonts/Carlito-{Regular,Bold}.ttf`, `src/features/cv/pdf.tsx`, `src/features/cv/file-name.ts`, `src/app/api/cvs/[id]/pdf/route.ts`, and their tests.
- Changed: `src/features/cv/components/cv-editor.tsx` (menu item), `src/features/cv/components/use-autosave.ts` (report whether everything is saved), `src/components/ui/menu.tsx`, `src/messages/en.json`, `src/messages/fr.json`, `package.json`, `pnpm-lock.yaml`, `next.config.ts` (`serverExternalPackages` or `outputFileTracingIncludes` only if the build needs them).
- Server code that reads the CV stays in `queries.ts` (0002).

## Boundaries

- Always: the template reads only the tree and `constants.ts`, never `CvContent`.
- Ask first: any other dependency, or a font other than Carlito or Liberation Sans.
- Never: Chromium, rendering in the browser, storing the PDF, logging CV content.

## Results (2026-11-26)

- **Font:** Carlito passed the extraction test in English and French (accents, œ, « »). No switch to Liberation Sans.
- **Size and time:** 24–29 KB per file (react-pdf embeds only the glyphs used). In dev, warm renders take 0.7–1.9 s per CV across the 12 test CVs. The first, cold render took 9.7 s while the route compiled.
- **Over-long words:** with whole words only, a 140-character URL ran past the right margin and its end was clipped. Words over 40 characters may now break after `/`, `?`, `&` or `=`. react-pdf always draws a "-" at a break, and that can't be turned off, so a wrapped URL reads "…segment/-a-very…". This is an exception to 0025's "no hyphenation", for over-long words only. Flovet confirmed it in chat (2026-11-26).
- **Tagging:** the output isn't tagged. It has no `StructTreeRoot` or `MarkInfo`, but it does set `/Lang`. Noted, not fixed (out of scope).
- **Mobile download:** blob download wasn't tried on a real iPhone or Android phone. Only the browser pane at 390 px was checked.

## Check

- `pnpm check` passes.
- In the browser, at 1440 px and 390 px:
  - download an en-us CV and a fr-fr CV with accents;
  - open each file and show a screenshot of page 1;
  - show the file names;
  - force a failure (offline) and show the toast.
- Reviewer score of 90 or more, recorded above. One entry in `docs/log.md`.
