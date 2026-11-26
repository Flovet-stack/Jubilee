# 0038: PDF download: one menu item, a file named after the person

- **Status:** Approved
- **Proposed:** 2026-11-26 by the product team (roles: Product, UX, Copy, Frontend, Backend, Tech Lead)
- **Approved:** 2026-11-26 by Flovet (in chat)
- **Builds on:** 0016 (react-pdf on the server, pdf.js extraction test), 0025 (Classic template, Carlito, page size by market), 0024 §3 (one semantic tree), 0031 (Export lives in the editor's More menu), 0017 (CV language and market are separate from the UI locale)
- **Specs:** specs/25-pdf-export.md

## Context

#15 is the last piece of MVP feature 1: a user can build a CV but can't take it out of Jubilee. The renderer, font, page size and tests are already decided (0016, 0025). Four things aren't:

1. what the control is called and what it does when pressed;
2. how the file reaches the browser (link or fetch), and what the user sees while it's made or if it fails;
3. what the file is named, and what the PDF's metadata says;
4. exact dependency versions (0016 left them to #15).

## User lens

| Question                     | Answer                                                                                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why would she open this?** | Amina has finished or updated a CV and has an application form open in another tab that asks for a PDF.                                                                                                                          |
| **How is she using it?**     | Once per application, often on a phone (brief: mobile-first markets). She then picks the file from Downloads, so the name must say whose CV it is. The recruiter sees the same name.                                             |
| **What next, and how?**      | Attach it. The file appears in the browser's own download UI; we don't add a second "done" screen. Later, Find jobs (feature 7) takes her to applications from the same top bar.                                                 |
| **What do we leave out?**    | Word/DOCX, Markdown, JSON, print, share links, a file-name field, format options, a download count or paywall (the CV builder is free, brief). Attaching PDFs to applications (#29) reuses the route later but isn't built here. |

## Research

| Reference                                           | What they do                                                                                                                                                                                                                                                                                                                                                                                  | Adopt / adapt / reject                                                                                    | Why                                                                                                                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reactive Resume** (docs, "Exporting your resume") | A "Download PDF" button in the editor bar; one click. The button shows "Preparing…" while the file is made, then the browser saves it. The file is the full name plus the word for resume in the CV's language (`David-Kowalski-Resume.pdf`, `…-Lebenslauf.pdf`); falls back to the document name with no name. Hidden sections are left out. A menu adds other formats and a file-name field | **Adopt** (one click, pending label, name pattern, hidden sections); **reject** (format menu, name field) | Closest product to ours and the clearest documented flow. A name field and five formats are choices Amina doesn't need for an ATS upload; PDF is the safe default (0016)     |
| **Rezi** (docs, "Download resume")                  | Download from a "Finish Up & Preview" page, choosing PDF, DOCX or Google Drive. Advises saving "with a clear, professional filename" such as `FirstName_LastName_Resume.pdf`. Unlimited downloads are paid                                                                                                                                                                                    | **Adopt** (the name advice); **reject** (a finish page, paywall)                                          | Confirms the person's name belongs in the file name. We name it for her instead of asking. A separate finish page adds a step 0031 doesn't have; the builder is free (brief) |
| **Teal, resume.io, Kickresume** (help centres)      | Teal returned 403; resume.io and Kickresume have download articles we couldn't open or find                                                                                                                                                                                                                                                                                                   | —                                                                                                         | No evidence either way                                                                                                                                                       |
| **react-pdf 4.x** (docs: Node API, compatibility)   | `renderToBuffer` / `renderToStream` in Node; React 19 since 4.1.0; Node 18–21 tested. No mention of tagged (accessible) PDF on the Node or Advanced index pages                                                                                                                                                                                                                               | **Adopt** `renderToBuffer`                                                                                | A CV is one or two pages, so a buffer is simpler than a stream and gives a `Content-Length`. Tagged output stays untested, as 0016 said; the spec checks and notes it        |
| **npm registry** (`pnpm view`, 2026-11-26)          | `@react-pdf/renderer` 4.9.1, MIT, peer React ^16.8 – ^19. `pdfjs-dist` 6.5.438, Apache-2.0, Node ≥ 22.13 or ≥ 24                                                                                                                                                                                                                                                                              | **Adopt** both, pinned                                                                                    | CI runs Node 24 (0023), so pdf.js's engine range is met. Both licences allow use                                                                                             |
| **MDN, Content-Disposition**                        | "filename\* is preferred over filename when both are understood"; "It's recommended to include both"; the plain `filename` should replace non-ASCII characters with ASCII ones (é → e); avoid percent escapes in `filename` (Safari doesn't decode them)                                                                                                                                      | **Adopt**                                                                                                 | French names with accents ("Hélène Dupré") must keep their accents where browsers support it, and still download cleanly where they don't                                    |

Sources (opened 2026-11-26):

- https://docs.rxresu.me and https://docs.rxresu.me/guides/exporting-your-resume.md
- https://www.rezi.ai/rezi-docs and https://www.rezi.ai/rezi-docs/download-resume
- https://help.resume.io/en/categories/669568-resumes-cover-letters (index only)
- https://www.kickresume.com/en/help-center/ (index only)
- https://react-pdf.org/node, https://react-pdf.org/advanced, https://react-pdf.org/docs/v4/compatibility
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition
- `pnpm view @react-pdf/renderer` and `pnpm view pdfjs-dist`

Tried and failed: help.tealhq.com (403), npmjs.com package pages (403; the registry was read with `pnpm view` instead).

## Options

**Delivery**

1. **A plain link** (`<a href=… download>`) to a route handler. No client code, and the browser shows its own progress. But a failure navigates to an error page and loses the editor, and there's no way to save pending edits first.
2. **Fetch, then save the blob** from the menu item (Reactive Resume). The item can first wait for autosave, show "Preparing…", and show an error toast without leaving the editor. Costs a little client code; blob downloads work on current iOS Safari and Android Chrome.
3. **A server action returning bytes.** Server actions aren't meant for file responses, and the bytes would be serialised through React's protocol.

**File name**

1. **Person's name + the word for resume in the CV's language and market** (Reactive Resume, Rezi's advice).
2. **The CV's title** ("Product designer · Amina Diallo"). It's Jubilee's label for telling CVs apart, not something a recruiter needs; it can carry a role she'd rather not send.
3. **A name field** before download. One more step for no gain on an ATS upload.

## Decision

Delivery option 2, file name option 1.

**Control (0031's More menu)**

- The editor's More menu gets **Download PDF** as its first item (en-gb and fr-fr: "Download PDF" / "Télécharger en PDF"), above Duplicate and Delete. 0031's "Export" is this item; it's named for what it does. Same menu on narrow screens.
- No other format, no options, no file-name field.

**What happens when she presses it**

1. If autosave has unsaved edits, wait for that save to finish, so the file matches the screen. If the save fails, stop and show the save error that already exists; don't download an older version.
2. The item shows "Preparing…" and is disabled while the request runs (double presses do nothing). The menu stays open until the download starts.
3. `GET /api/cvs/{id}/pdf` (a Node route handler; logic in `src/features/cv/`). It reads the CV with the signed-in user's client, so RLS limits it to the owner; another user's or a missing id gets 404, signed out gets 401. Hidden sections are left out (the tree already does). Response: `application/pdf`, `Cache-Control: private, no-store`.
4. The client saves the blob with the file name from the response. The browser's own download UI confirms it; we add nothing.
5. On failure: an error toast, "We couldn't make the PDF. Try again." with Try again. Errors are logged server-side without CV content.

**File name**

- `{Full name} - {word}.pdf`, where the word follows the **CV's** language and market (0017), not the UI locale: English CV for the US market "Resume"; English CV for France "CV"; French CV "CV".
  - "Amina Diallo - Resume.pdf", "Hélène Dupré - CV.pdf".
- No name on the CV: the CV's title instead ("Product designer - CV.pdf"); if that's empty too, just "Resume.pdf" / "CV.pdf".
- Characters not allowed in file names (`/ \ : * ? " < > |` and control characters) are removed, spaces collapsed, length capped at 100 characters before `.pdf`.
- Header: `Content-Disposition: attachment; filename="Helene Dupre - CV.pdf"; filename*=UTF-8''H%C3%A9l%C3%A8ne%20Dupr%C3%A9%20-%20CV.pdf` (ASCII fallback, then the UTF-8 name).

**PDF metadata**

- `title` = the file name without `.pdf`; `author` = the person's name; `language` = the CV's language (0016).
- `creator` and `producer` don't name Jubilee: the CV is her document, not our advert (0025's reasoning on fonts).

**Dependencies (pinned):** `@react-pdf/renderer` 4.9.1 (runtime) and `pdfjs-dist` 6.5.438 (dev, tests only), as 0016 allowed. Carlito Regular and Bold TTFs are added next to the existing WOFF2 subsets (0025); the route loads them from disk.

**Trade-offs:** Frontend first proposed the plain link (no client code). UX chose fetch because a failed download must not throw away the editor, and the file must match the screen after a pending autosave. Copy wanted the CV's title in the file name; Product chose the person's name because the recruiter sees the file name and the title is our internal label.

## Consequences

- One click from the editor to a file an ATS can read. #29 (attaching to applications) reuses the same route or its render function.
- The route renders on every request; no caching or storage of PDFs (less personal data at rest). If renders get slow or costly, caching is a new decision.
- No rate limit in the MVP; a signed-in user can only render their own CVs. Revisit with analytics and abuse data.
- Out of scope: other formats, print, share links, a name field, downloads from the Resumes page or sidebar (a later decision if asked for).
- Reviews check: the item waits for autosave; "Preparing…" and the error toast work; 401/404 for signed-out and other users; the file name for an accented name, no name, and each CV language and market; metadata has no "Jubilee"; the pdf.js extraction test from 0016 passes in English and French; the HTML preview and the PDF print the same text in the same order (0024); tagged-PDF result noted.
