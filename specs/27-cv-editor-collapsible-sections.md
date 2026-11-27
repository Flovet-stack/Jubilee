# 27: CV editor with flush panes, collapsible sections, drag and a show toggle

Status: Done (97/100, 2026-11-27; a 50-entry drag not run in the browser) · Written: 2026-11-27

## Goal

Give the editor's left pane more room and less chrome. Sections collapse, entries can be dragged into order, and each entry can be hidden from the CV without deleting it.

## User lens

0039's lens: Aminata, a data analyst in Paris. She is tailoring a CV on a laptop the evening before applying.

1. **Why she opens it:** to reshape this CV for one job. She hides an old internship and moves the relevant job first.
2. **How she uses it:** with a mouse, scanning the section titles, then dragging or hiding entries. The preview updates beside the list.
3. **What she wants next:** "Does it read well now?" The Preview and Review tabs answer that.
4. **What we leave out:** dragging whole sections, dragging entries across sections, a saved collapse state, and a per-section done flag.

## Decisions

Implements [0039](../docs/decisions/0039-cv-editor-flush-panes-and-collapsible-sections.md). Builds on:

- [0031](../docs/decisions/0031-cv-editor-two-panes-and-review.md) (top bar, tabs, review);
- [0029](../docs/decisions/0029-type-spacing-for-every-control.md) and [0030](../docs/decisions/0030-icon-size-from-font-size.md) (control spacing and icon sizes);
- [0037](../docs/decisions/0037-layered-control-surfaces-and-geist-trial.md) (surfaces);
- [0008](../docs/decisions/0008-interaction-disclosure-and-space.md) (undo).

Follow-up: [0048](../docs/decisions/0048-skills-as-pills-and-desk-section-headers.md) (skills by category as pills, headers on `--desk` with violet titles).

## Acceptance criteria

1. **Layout:**
   - The editor root has no padding and no gap.
   - The top bar has equal block padding and keeps its bottom border.
   - From `@4xl`, the panes are split by a 1 px border. The left pane has no padding; the right pane keeps its padding and stays sticky.
2. **List:**
   - There's no visible "Sections" title; an `aria-label` and the focus target stay.
   - There's no grey wrapper. Sections are flat and split by bottom borders.
3. **Section header** (card colour):
   - A chevron to collapse, the title, the finding marker, and an eye-off icon when the section is hidden.
   - A plus on list sections and the More menu.
   - No count and no "Done / To do".
4. **Section body** (well colour):
   - Entries show as compact cards.
   - Contact and Summary show one card that opens the form.
   - An empty list section reads "No entries yet".
5. **Collapse:**
   - Every section starts open and toggles with a click, Enter or Space.
   - The height animates over 200 ms, with no animation under reduced motion.
6. **Plus:** adds an entry and opens the form at it.
7. **Entry card:**
   - The handle shows on hover and focus, and always on touch. Dragging the handle reorders entries; clicking it opens Move up and Move down.
   - The label opens the form.
   - An eye toggle (`aria-pressed`) shows or hides the entry.
   - Delete keeps undo.
   - There are no up and down buttons.
8. **Hidden entries:**
   - The flag is optional in the schema.
   - The preview, the PDF and Review skip hidden entries.
   - In the editor, a hidden entry's label turns muted and its eye-off icon always shows.
9. **Add section:** a full-width button.
10. **Copy:** all new strings are in en, en-GB and fr.

## Out of scope

Dragging sections, cross-section drag, a saved collapse state, and changes to the forms.

## Edge cases

- Old content has no `hidden` flag and parses unchanged.
- A section whose entries are all hidden drops out of the CV.
- A section with 50 entries disables the plus.
- With reduced motion, there's no collapse or layout animation.

## Files

- `src/features/cv/components/section-list.tsx` (new)
- `cv-editor.tsx`
- `schemas.ts`
- `tree.ts`
- `review.ts`
- `src/components/icons/grip.tsx`

## Boundaries

- **Always:** type spacing; design-system components; the no-ai-slop skill.
- **Ask first:** new dependencies, migrations.
- **Never:** drag-only reordering (WCAG 2.5.7).

## Check

- `pnpm check`.
- Screenshots at 390 and 1440 px, in light and dark.
- In the browser: collapse, add, hide, drag, and the handle's menu by keyboard.
- Reviewer: 90 or more.
