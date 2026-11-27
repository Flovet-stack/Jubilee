# 0047: The editor fills the window and each pane scrolls on its own

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UX, Frontend), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet (given as a direct instruction in chat)
- **Supersedes:** 0042's sticky right pane in a scrolling content window
- **Specs:** specs/27-cv-editor-collapsible-sections.md (follow-up)

## Context

Flovet (2026-11-27): the editor shows two scroll bars, one on the content window and one in the preview. The section list makes the whole page scroll. He wants the editor to stay on screen, with the left and right panes each scrolling on their own.

## User lens

Aminata, on a laptop. The top bar (name, Download) and both panes stay in place while she scrolls a long section list or a two-page preview. Left out: any change on narrow windows, where one pane fills the screen and the page scrolls as before.

## Research

| Reference                                       | What they do                                                                               | Adopt / adapt / reject | Why                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------- |
| 0024's references (Kickresume, Reactive Resume) | A split editor: the form and the preview scroll separately, and the app frame stays fixed. | **Adopt**              | This is the convention for split editors.                              |
| Our shell (0027)                                | From `lg`, the content window is a fixed-height box that scrolls.                          | **Adapt**              | The editor fills that box with `min-h-0` and leaves no overflow to it. |

Sources: decisions 0024 and 0027. No new outside research.

## Decision

- **From the two-pane width (`@4xl`):**
  - The page's `main`, the editor root and its inner column take `min-h-0`. The inner column also hides overflow.
  - The grid has one row, `minmax(0, 1fr)`.
  - Each pane scrolls on its own, with `overscroll-behavior: contain`.
  - The tab bar stays sticky inside the right pane.
- **Below `@4xl`:** unchanged; the page scrolls in the content window.

## Consequences

- The content window shows no scroll bar on the editor at two-pane widths.
- Focus moves (opening a form, going back to the list) scroll inside the left pane.
