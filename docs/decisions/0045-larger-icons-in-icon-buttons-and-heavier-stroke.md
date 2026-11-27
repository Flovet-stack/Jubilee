# 0045: Larger icons in icon-only buttons, and a heavier stroke

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UI, Frontend), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet (given as a direct instruction in chat)
- **Supersedes:** 0030's icon size for icon-only controls (`1.125em` there). 0030 stands for icons next to text.
- **Specs:** specs/27-cv-editor-collapsible-sections.md (follow-up)

## Context

Flovet (2026-11-27): the icons, especially in icon buttons, look too small to be accessible, and the strokes are thin. Make them a little bigger, and heavier if the icon set allows.

## User lens

Aminata (0039's lens), on a laptop in the evening.

| Question                     | Answer                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Why does she open it?**    | To edit fast. Icon buttons (add, show, delete, more, back) are how she does it.                                               |
| **How is she using it?**     | She scans for the next icon. At 15.75 px with a 1.1 px stroke (14 px text), the icons blur together, especially in dark mode. |
| **What does she want next?** | To find the right button at a glance.                                                                                         |
| **What do we leave out?**    | Bigger buttons: their size stays (0020, 0029). Only the drawn icon grows.                                                     |

## Research

| Reference               | What they do                                                                                                                             | Adopt / adapt / reject  | Why                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0030's own options      | 1.25em was option 2: "our old 20 px at 16 px text; Carbon's upper pairing". It was rejected because it "reads large next to 12 px text". | **Adopt for icon-only** | With no text beside it, the "large next to text" objection doesn't apply.                                                                                                 |
| better-ui skill (icons) | A rendered stroke should track the text weight: 1.5 px at 400 to 2.5 px at 700.                                                          | **Adapt**               | Buttons are semibold (600). Our 1.5 stroke on a 24 grid draws about 1.1 px at 17.5 px; 1.75 draws about 1.3 px. That's heavier without looking bold next to regular text. |
| WCAG 2.2 SC 1.4.11      | Graphics needed to understand a control need 3:1 contrast. Thin strokes antialias to lighter greys.                                      | **Adopt**               | A heavier stroke keeps the drawn pixels closer to the ink colour.                                                                                                         |

Sources: decision 0030, the better-ui skill's icon guidance, and WCAG 2.2 1.4.11. No new outside research.

## Decision

- **Icon-only controls** (`.jb-type-square`): `--icon: 1.25em`.
  - The button size is unchanged; the inset shrinks to `(1lh − 1.25em) / 2`.
  - At 14 px that's a 17.5 px icon, up from 15.75 px.
- **Every icon in our set:** `strokeWidth` goes from 1.5 to 1.75 (on a 24 px grid). The one icon drawn at 1 stays.
- **Icons next to text** keep 0030's `1.125em`.

## Consequences

- Every icon in the product gets heavier, not only the editor's. A review checks the sidebar, menus and alerts in both themes.
- Hand-drawn static icons (`MoreIcon`, `GripIcon`) are filled dots, so only their size changes.
