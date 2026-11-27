# 0048: Skills by category as pills, and section headers on the desk colour

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UX, UI, Frontend), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet (given as a direct instruction in chat)
- **Supersedes:** 0043's row list for the Skills section only; 0039's section header colour (`--card`) and its follow-up title size (16 px)
- **Specs:** specs/27-cv-editor-collapsible-sections.md (follow-up)

## Context

Flovet (2026-11-27):

- Skills should show as pills, each with a show/hide icon. Skills are grouped in categories. Each category gets its own heading, and each skill under it gets its own pill that can be shown or hidden.
- The section title bars should have the same background as the dashboard.
- The section title should be the primary colour, one font size down.

## User lens

Aminata, on a laptop, tidying her skills before an application.

| Question                     | Answer                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Why does she open it?**    | To see which skills the CV shows, and drop the ones that don't fit this job.                                    |
| **How is she using it?**     | She scans short words. One pill per skill, under its category, fits several to a line.                          |
| **What does she want next?** | To hide one skill, or a whole category, in one click; or open the category to add, rename or delete skills.     |
| **What do we leave out?**    | Dragging pills or categories to reorder, and delete on the pill. Adding and deleting stay in the category form. |

## Research

| Reference                       | What they do                                       | Adopt / adapt / reject | Why                                                                   |
| ------------------------------- | -------------------------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| Our `Badge` (rounded-full pill) | The product's pill shape and neutral border.       | **Adapt**              | Same shape and `--line` border, but interactive and with an eye.      |
| 0043's entry eye toggle         | `aria-pressed` eye per entry; eye-off when hidden. | **Adopt**              | The same control, always visible, so hidden is never hover-only.      |
| WCAG 2.2 SC 1.4.1               | State is never colour alone.                       | **Adopt**              | A hidden pill shows eye-off and a dashed border, not only muted text. |
| The app shell (`--desk`, 0027)  | The dashboard sits on `--desk`.                    | **Adopt**              | Headers on `--desk` set them apart from the white bodies.             |

Sources: our Badge, 0027, 0043, WCAG 2.2 1.4.1. No new outside research.

## Decision

- **Skills section:** each category (a skills entry) is a small heading: its name opens the form, and its eye hides the whole category. Under it, each skill is a pill with its own eye. Pills wrap. A hidden pill is muted, dashed and shows eye-off; pills in a hidden category look muted too.
- **Data:** a skills entry gains an optional `hiddenKeywords` list (by skill name). No migration: the CV content is JSON, and old CVs read as all shown. When every skill in a category is hidden, the category leaves the CV.
- **Section headers:** `bg-desk` in both themes. Titles are `--violet` (the primary colour, over 4.5:1 on `--desk` in both themes) at `text-base` (14 px). Hidden sections keep the muted title.

## Consequences

- Renaming a skill in the form shows it again (hidden is stored by name).
- Categories can't be reordered from the list. If that's missed, a follow-up adds it.
