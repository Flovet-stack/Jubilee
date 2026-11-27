# 28: Paginated CV preview

Status: In progress (reviewer 89/100 before fixes; known gap: the PDF never applies the heading rule, and Flovet chose to leave the PDF as is) · Written: 2026-11-27

## Goal

Show the preview as paper sheets, page by page, breaking where the PDF will. The aim is that Aminata sees a bad break or a second page before she downloads.

## User lens

0044's lens: Aminata, checking her CV beside the form before downloading.

1. **Why she opens it:** to see what the recruiter will see.
2. **How she uses it:** she glances at the pane while typing, then scrolls through the pages.
3. **What she wants next:** to fix a break, or to download.
4. **What we leave out:** viewer controls, page numbers, and a PDF engine in the browser.

## Decisions

Implements [0044](../docs/decisions/0044-paginated-cv-preview.md). It builds on:

- [0025](../docs/decisions/0025-first-cv-template-and-typography.md) and [0026](../docs/decisions/0026-cv-entry-layout.md), the template;
- [0042](../docs/decisions/0042-editor-top-bar-download-and-finding-severity.md), the grey preview area.

## Acceptance criteria

1. One sheet per page: A4 for France, Letter for the US. The sheets are scaled to the pane and stacked with a gap. The dashed break lines are gone.
2. Breaks follow the PDF's rules:
   - at least 2 lines stay on each side of a break inside a paragraph or bullet;
   - an entry's corner lines and the name block never split;
   - a heading moves on when less than 40 pt would follow it;
   - each page holds its height minus the top and bottom margins.
3. A pure `paginate()` function holds the rules and is unit tested for each one, plus a block taller than a page.
4. Screen readers read the CV once: only the first sheet's copy is exposed.
5. Pages recompute on edits (the existing 150 ms delay), on a resize, and once the fonts load.
6. The `pageBreak` message key is removed.

## Out of scope

Exact parity with react-pdf line wrapping, zoom, page numbers, and the PDF route.

## Edge cases

- An empty CV shows one sheet.
- A line longer than a page breaks by force.
- Switching the market from FR to US changes the paper size and the breaks.

## Files

- `src/features/cv/templates/classic/paginate.ts` (new) and its tests;
- `classic-preview.tsx`;
- `cv-editor.tsx`;
- the message files.

## Check

- `pnpm check`.
- In the browser: a long CV shows 2+ sheets, and its downloaded PDF has the same page count.
- Screenshots at 1440 and 390 px.
- Reviewer: 90 or more.
