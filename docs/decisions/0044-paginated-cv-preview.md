# 0044: A paginated CV preview, page by page as the PDF will print

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UX, UI, Frontend, Tech Lead)
- **Approved:** 2026-11-27 by Flovet
- **Supersedes:** 0024's "one long sheet with estimated page-break lines" in the preview
- **Specs:** specs/28-paginated-cv-preview.md

## Context

Flovet (2026-11-27): the preview shows one long sheet with dashed "Page 2 starts about here" lines. He wants it to show A4 (or Letter) pages as they'll look in the PDF: content breaks at the bottom of a page and carries on to the next. "More seamless that way." No full document viewer.

## User lens

Aminata (0039's lens), checking her CV before downloading.

| Question                     | Answer                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Why does she open it?**    | To see the CV a recruiter will see: is it one page or two, and does a job split badly across the break?               |
| **How is she using it?**     | A laptop: she glances at the right pane while typing, and scrolls it before downloading.                              |
| **What does she want next?** | To fix a bad break (trim a bullet, hide an entry) or to download. The pages update as she types.                      |
| **What do we leave out?**    | A viewer toolbar (zoom, page jump, thumbnails), page numbers on the sheets, and shipping a PDF engine to the browser. |

## Research

| Reference                                                              | What they do                                                                                                                                                                                        | Adopt / adapt / reject      | Why                                                                                                                                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reactive Resume** (0024's code read)                                 | Paints the real PDF in the browser (react-pdf to a blob, pdf.js canvases), re-rendered after 250 ms of quiet; about 230 ms for two pages.                                                           | **Reject** (again, as 0024) | Exact, but it ships react-pdf and pdf.js to every editor visit. The brief says to keep pages light.                                                                  |
| **OpenResume** (0024's code read)                                      | Renders the PDF template's elements as DOM in an iframe, because the PDF viewer was "too slow" for typing.                                                                                          | **Adopt the lesson**        | A typing-speed preview has to be HTML.                                                                                                                               |
| **react-pdf page wrapping** (official docs)                            | Text and views wrap across pages by default. `wrap={false}` keeps a block whole. `minPresenceAhead` keeps a heading with what follows. Text has `orphans` and `widows`, both defaulting to 2 lines. | **Adopt**                   | These are the rules our PDF uses (`classic-pdf.tsx`: entry corner lines `wrap={false}`, headings `minPresenceAhead={40}`), so the preview should break the same way. |
| **Word processors' page view** (Google Docs, Word; general convention) | Sheets stacked on a grey desk, with a gap between them.                                                                                                                                             | **Adopt**                   | Everyone knows what a page looks like there. It also fits the grey preview area from 0042.                                                                           |

Sources (opened through search results):

- https://react-pdf.org/docs/v4/advanced/page-wrapping
- https://react-pdf.org/docs/v4/advanced/orphans-and-widows
- https://react-pdf.org/advanced

## Options

1. **Paginate the HTML preview with the PDF's break rules (recommended).**
   - Lay the document out once, at the real width, in one flowing column.
   - Measure where each line, entry header and heading falls.
   - Choose each page's break by the PDF's rules, then show each page as a sheet that windows onto its slice.
   - Fast (no PDF engine), with no new dependency.
   - Breaks are a close estimate, not a guarantee: react-pdf's line wrapping can differ by a line now and then.
2. **The real PDF in the browser** (react-pdf + pdf.js on the client).
   - Exact.
   - Several hundred kB more on the editor, and a render per pause in typing. 0024 already rejected this.
3. **The server's PDF, painted with pdf.js.**
   - Exact, and reuses the existing route.
   - Lags behind typing (it waits for autosave and a round trip), and still ships pdf.js to the browser.

## Decision (proposed)

Option 1.

- **Sheets:** one paper-sized sheet per page (A4 for France, Letter for the US, as the PDF), stacked with a gap on the grey preview background, and scaled to the pane's width. The dashed break lines and their labels go.
- **Break rules, mirroring the PDF:**
  - A page holds its height minus the top and bottom margins.
  - A break may fall between lines of a paragraph or bullet, keeping at least 2 lines on each side (orphans and widows).
  - An entry's two corner lines never split.
  - A section heading moves to the next page when less than 40 pt would follow it on this one.
  - A line that doesn't fit moves whole.
- **How it renders:**
  - The document is laid out once, off-screen, for measuring.
  - Each sheet shows its slice by clipping a copy of that layout. Only the first copy is exposed to screen readers; the rest are `aria-hidden`, so the CV is read once, in order.
  - Pages recompute after the existing 150 ms preview delay.
- **Wording:** the preview stays an estimate; the PDF sets the real breaks (0024, 0038). No label says so on the sheets. That stays in Guidance, if anywhere.
- **Tests:** the break chooser is a pure function (block and line positions in, slice offsets out), unit tested for each rule. The DOM measuring is checked in the browser with a long CV against its downloaded PDF's page count.

## Consequences

- With an N-page CV, the preview renders the document N times. That's fine for one to three pages, the norm for CVs.
- If the preview and the PDF disagree on a page count for a real CV, that's a bug to fix in the measuring, not a reason to add a disclaimer.
- Option 2 stays open if exactness ever matters more than weight. It would be a new decision.
