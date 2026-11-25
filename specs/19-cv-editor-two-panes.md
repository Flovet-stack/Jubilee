# 19: CV editor in two panes, top bar, review without AI

Status: Done (95/100, 2026-11-25; screen reader, a 50-entry section and a long French name not run in the browser) · Written: 2026-11-25

## Goal

Redesign the CV editor as Flovet asked: a top bar with a renamable name and a More menu, two panes instead of three, and a Review that flags what's lacking on each section. This is phase 1 of 0031: no AI, nothing sent to a third party.

## User lens

0031's lens (Aminata, a data analyst in Paris, editing on a laptop in the evening before applying):

1. **Why she opens it:** to get her CV in shape for a job tonight, and to know what's weak.
2. **How she uses it:** a laptop, 20–40 focused minutes. She scans the sections, opens one, edits, and checks the page.
3. **What she wants next:** "Is it good enough?" The Review tab answers it, and each finding opens the exact place to fix.
4. **What we leave out:** AI, a score, Export and Find jobs until #15 and feature 7 ship.

## Decisions

Implements [0031](../docs/decisions/0031-cv-editor-two-panes-and-review.md) §1, §2 and §3 (phase 1).

Builds on:

- [0024](../docs/decisions/0024-cv-builder-editor.md): first pass, autosave, tree, guidance; the parts 0031 doesn't supersede.
- [0008](../docs/decisions/0008-interaction-disclosure-and-space.md), [0029](../docs/decisions/0029-type-spacing-for-every-control.md), [0030](../docs/decisions/0030-icon-size-from-font-size.md): disclosure, type spacing, icon size.

## Acceptance criteria

1. **Top bar** (0031 §1):
   - Left: the Back button, then the name as a button. Clicking it shows a field. Enter or blur saves, Escape cancels, and an empty value restores the last name.
   - The automatic name is "{headline} · {name}", falling back to the name, then to the default word. It follows the content until the user renames it.
   - Right: the save status, then a More menu with **Duplicate** and **Delete**. There is no Export or Find jobs item.
   - **Duplicate** creates "{title} (copy)" with the same language, market and content, then opens it.
   - **Delete** asks in a dialog, then deletes and goes to Home. The sidebar's saved-CV list updates after either action.
2. **Two panes** (0031 §2), from a 56rem content window:
   - **Left:** the section list, or one section's form. Each list section shows its entries under it, one line each. With a mouse, an entry's Edit, Move up/down and Delete appear on hover and on focus; on touch they're always visible.
   - Edit on an entry opens its section's form with that entry open. The form has "Back to sections" at the top and keeps the first-pass "Next: …" button.
   - **Right:** tabs Preview and Review. While a form is open, a Guidance tab appears first and is selected. It holds the section's hint, tips and example, moved out of the form. Closing the form returns to the tab that was open before.
3. **Narrow windows:** the list or form fills the screen, and a "Preview" button opens a sheet with the same tabs.
4. **Review** (0031 §3):
   - Pure checks in `src/features/cv/review.ts`, covering exactly 0031's first set.
   - The Review tab says "{n} things to look at" or "Nothing to fix" and groups findings by section. Each finding has a "Go to it" link that opens the form at the entry.
   - The list shows a marker on each row with findings, and the entry's finding on its line. Findings use a muted tone with an icon, never red.
5. **Copy:** all strings are in en, en-GB and fr. The US says "resume".
6. **Tests:** every check, including no findings on a complete CV; the automatic name; and the follow-until-renamed rule.

## Out of scope

Phase 2 (any AI), Export (#15), Find jobs (feature 7), a score, and changes to the forms' fields.

## Edge cases

- A brand-new CV: Review lists the contact and summary findings; there's no finding for empty optional sections.
- A hidden section isn't reviewed.
- A long or French name truncates in the bar, with the full name in its `title`.
- A duplicate that fails, or a failed delete: an error toast, and nothing changes.
- A section with 50 entries: the list stays usable.

## Files and patterns to follow

- `src/features/cv/components/cv-editor.tsx`, `section-forms.tsx` and `fields.tsx` (`RowActions`).
- Actions go in `actions.ts` plus thin `editor-actions.ts` wrappers (0002).
- `Tabs`, `Menu`, `Dialog` and `Sheet` from `src/components/ui/`.

## Boundaries

- **Always:** type-spacing on every control; the no-ai-slop skill.
- **Ask first:** dependencies, migrations, any AI call.
- **Never:** send CV text off the server; show buttons for features that don't exist.

## Check

- `pnpm check`.
- Screenshots at 390 px and 1440 px of the list, a form with Guidance, and Review.
- Rename by keyboard, duplicate, and delete, in the browser.
- Reviewer skill: 90 or more.
