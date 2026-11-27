# 0043: Entries grouped in one box, header hover, a flat drag handle and a labelled Download button

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UI, UX), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet (given as a direct instruction in chat)
- **Supersedes:**
  - 0039's "each entry is a compact card";
  - 0042's `--desk` section body and its icon-only Download.
- **Specs:** specs/27-cv-editor-collapsible-sections.md (follow-up)

## Context

Flovet's edits to the section list and top bar (2026-11-27):

1. **One box:** a section's entries sit in one box with a border, separated by bottom borders, not in separate cards with gaps.
2. **Section body:** no light background.
3. **Entry hover:** a very slight background, and the icons show.
4. **Section header hover:** the title underlines and the header's buttons take the bordered (raised) style.
5. **Drag handle:** flat, with no hover effect and no tooltip; its name is plain.
6. **Download:** a button labelled "Download PDF", not an icon.

## User lens

Aminata (0039's lens), scanning and tidying her CV on a laptop.

| Question                     | Answer                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Why does she open it?**    | To tidy entries and download. Separate cards made a section read as loose pieces; one box reads as one list.            |
| **How is she using it?**     | A mouse. Hover shows what's under the pointer: the row tints and its tools appear; the header tells her it's clickable. |
| **What does she want next?** | The download, named plainly so she doesn't have to guess an icon.                                                       |
| **What do we leave out?**    | A tooltip on the drag handle: the grip is a known affordance, and screen readers still get its name.                    |

## Research

| Reference                               | What they do                                                             | Adopt / adapt / reject | Why                                                            |
| --------------------------------------- | ------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------- |
| Our `ReviewPanel` list (`patterns.tsx`) | One bordered card with rows split by borders.                            | **Adopt**              | It's the same pattern already in our design system.            |
| NN/g, icon usability (known guidance)   | Icons without labels are ambiguous; a label helps for important actions. | **Adopt** for Download | Download is the last step, so it earns a label.                |
| WCAG 2.5.7 (0039)                       | The single-pointer alternative must stay.                                | **Keep**               | The handle still opens Move up / Move down on click and Enter. |

Sources: our own components and 0039's research. No new outside research; this is a visual follow-up.

## Decision

- **Section body:**
  - `bg-card` (no tint). The inset top shadow from 0042 stays.
- **Entries:**
  - One box per section: `rounded-card`, a 1 px `--line` ring, `overflow-hidden`.
  - Rows are separated by a `--line` bottom border (none after the last). Rows sit edge to edge, with no gap between them.
  - A row's hover fill is `--wash-hover` at half strength.
  - Its icons show on hover and focus with a mouse, and always on touch.
- **Header hover** (pointers that can hover):
  - The title underlines.
  - The plus and More icon buttons take the secondary (raised) surface.
- **Drag handle:** a quiet icon button with no hover or press fill, no press scale and no tooltip. It keeps its accessible name, its menu and the `grab` cursor.
- **Download:** a secondary `Button`, "Download PDF" with the download icon. While preparing, the label reads "Preparing…" and the button is disabled with a spinner.

## Consequences

- On phones the bar gains a labelled button. If space runs short, the label can hide under `sm` in a later change; for now the title truncates first.
- A review checks the hover states in both themes and the row borders in a 50-entry section.
