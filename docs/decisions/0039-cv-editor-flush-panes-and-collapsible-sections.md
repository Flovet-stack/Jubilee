# 0039: CV editor with flush panes, collapsible sections, drag to reorder and a show toggle per entry

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UX, UI, Frontend, Product, Copy)
- **Approved:** 2026-11-27 by Flovet
- **Supersedes:** parts of 0031 §2 (the list's look, the entry row actions) and 0024's per-row "Done / To do" status
- **Specs:** specs/27-cv-editor-collapsible-sections.md

## Context

Flovet's asks for the CV editor (2026-11-27):

1. **Remove the padding and gaps.** The editor sits in the content window with padding and gaps between its parts. Remove them.
2. **Top bar:** equal top and bottom padding, keeping its bottom border.
3. **Panes:** the left and right panes are split by a border, not a gap.
4. **Left pane:** no padding of its own, and no "Sections" title.
5. **No grey box.** Remove the box around the sections, with its padding and gaps.
   - Each section has its own padding and a bottom border.
   - Each section collapses: an icon left of the title shows this, and a plus on the right adds an item.
   - The header may take a different colour from the body.
6. **Drag to reorder** entries instead of the up and down buttons, with a handle on the left that shows on hover.
7. **Status:** "do we really need" the entry count and "Done" on each section?
8. **Show toggle:** a show icon on each entry decides whether it appears on the CV, in the space the arrows used.
9. **Design system:** use our components. Flovet likes the card under "Coordinated" in the design system's "Undo line and marked change" well. That's the `MarkedChange` surface: `rounded-card`, `bg-card`, `p-3`, a 1 px `--line` ring.
10. **Sections:**
    - A fresh CV opens with default sections, chosen by research on what a resume must have.
    - "Add section" spans the full width.

## User lens

The user is Aminata, a data analyst in Paris (0031's lens). She's on a laptop in the evening, tailoring her CV before applying.

| Question                     | Answer                                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why does she open it?**    | She wants to shape this CV for one job. She drops an old internship, puts the relevant job first and adds a project.                                                             |
| **How is she using it?**     | A mouse, 20–40 minutes. She scans the section titles, opens the one she wants and moves or hides an entry. She doesn't want to delete something she might need for the next job. |
| **What does she want next?** | Whether the page reads well now. The preview updates as soon as an entry is hidden or moved, and the Review tab still flags what's weak.                                         |
| **What do we leave out?**    | A per-section done state and entry count, dragging whole sections (they keep their menu), keeping a section's collapsed state between visits, and a hidden-entries filter.       |

## Research

| Reference                                                                                              | What they do                                                                                                                                                                       | Adopt / adapt / reject | Why                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resume.com, Kickresume, Novorésumé, resume.co help centres                                             | Reorder sections and entries by dragging a handle. Several also have arrow or menu fallbacks.                                                                                      | **Adopt** the handle   | This is the convention in resume builders.                                                                                                               |
| A CV builder's docs (Mintlify, tariqahmaad/CV-Builder)                                                 | An eye icon toggles visibility; an eye-off icon marks a hidden item.                                                                                                               | **Adopt**              | Users already know the eye icon. Hiding keeps the entry for the next application, where deleting loses it.                                               |
| WCAG 2.2 SC 2.5.7, technique G219, failure F108                                                        | A list that can be reordered only by dragging fails. A single-pointer alternative is required, and a menu ("Move up / Move down") counts.                                          | **Adopt**              | We use the handle as both: drag it, or click it for a small menu with Move up and Move down. That also covers the keyboard. It costs no extra row space. |
| NN/g, "Accordions on desktop"                                                                          | Accordions suit long pages where users don't need many panels open at once. The cost is lower visibility and extra clicks.                                                         | **Adapt**              | All sections start open, so nothing is hidden until she chooses. Collapsing is for focus, not the default.                                               |
| Purdue OWL, UMN CLA career services, Monster, Coursera                                                 | Every resume has contact information, experience, education and skills. Most add a summary; Purdue's minimum is contact, education and relevant experience.                        | **Adopt**              | These become the defaults (below).                                                                                                                       |
| Our own: 0037 surfaces, `Card`, `MarkedChange`, Base UI `Collapsible` 1.9.0, `motion` 13.1.1 `Reorder` | All are already installed.                                                                                                                                                         | **Adopt**              | No new dependency.                                                                                                                                       |
| Emil Kowalski / better-ui skills                                                                       | Animate only `transform`, `opacity` and height for occasional actions, under 300 ms, ease-out. No animation on keyboard actions. Keep the hover-only handle behind `hover: hover`. | **Adopt**              | Collapse: 200 ms ease-out, none under reduced motion. Drag: Motion's spring with no bounce.                                                              |

Sources (from web searches on 2026-11-27; read through search summaries, not opened page by page):

- https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements
- https://www.w3.org/WAI/WCAG22/Techniques/general/G219
- https://www.w3.org/WAI/WCAG22/Techniques/failures/F108
- https://www.nngroup.com/articles/accordions-on-desktop/
- https://owl.purdue.edu/owl/job_search_writing/resumes_and_vitas/introduction.html
- https://cla.umn.edu/undergraduate-students/career-services/getting-job-or-internship/resume/resume-content
- https://www.monster.com/career-advice/resume/resume-sections
- https://www.coursera.org/articles/resume-sections
- https://www.resume.com/help/how-do-i-rearrange-sections-and-entries/
- https://intercom.help/kickresume/en/articles/3545491-how-to-reorder-sections-on-my-resume
- https://www.mintlify.com/tariqahmaad/CV-Builder/guide/managing-sections

## Options

**For the section surface (ask 5 and 9)**

1. **Header on `bg-well`, body on `bg-card` with flat entry rows.** Simple, but it doesn't use the card Flovet picked.
2. **Header on `bg-card`, body on `bg-well`, each entry a compact card (chosen).** Each entry is the `MarkedChange` surface: `rounded-card`, `bg-card`, `p-3`, the `--line` ring.
   - The header and body differ in colour, as asked.
   - The entries read as objects you can pick up and drag.
   - The grey wrapper around the whole list goes.
3. **Each whole section as a card in a stack.** This brings back gaps and nested boxes, which asks 4 and 5 remove.

**For drag**

1. **`@dnd-kit`.** Strong keyboard support, but it's a new dependency, which needs approval.
2. **`motion`'s `Reorder` with a drag handle (chosen).** Already installed. The handle's menu covers keyboard and single pointer (2.5.7).

## Decision

**Layout**

- The editor root has no padding or gap.
- **Top bar:** the same block padding above and below, with its existing bottom border and inline padding.
- **Two panes:**
  - From `@4xl`, they're split by a 1 px `--line` border, with no gap.
  - The left pane has no padding.
  - The right pane keeps its own padding and stays sticky.
- The "Sections" heading goes. The list keeps an `aria-label` for screen readers.
- Under `@4xl`, the list fills the width, edge to edge.

**Sections**

- A flat list, with each section separated by a bottom border.
- **Header** (`bg-card`, its own padding):
  - Left: the collapse icon (a chevron that rotates).
  - Then the title and its finding marker (0031 §3).
  - When the section is hidden, a muted eye-off icon.
  - Right: a plus (for list sections) and the section's More menu, which keeps move, rename, hide and delete.
  - Clicking the title row toggles the section.
- **Plus:**
  - For list sections, it adds an empty entry and opens the form at it.
  - Contact and Summary have no plus. Their body is one compact card with the summary line, and clicking it opens the form.
- **Body** (`bg-well`, its own padding):
  - The entries stack as compact cards with a small gap.
  - An empty list section shows one muted line ("No entries yet") and nothing else; the plus is the way to add one.
- **Collapse:**
  - Base UI `Collapsible`. Every section starts open.
  - The open state isn't saved between visits.
  - The height animates over 200 ms ease-out, with no animation under reduced motion.
- **Status:**
  - "Done / To do" and the count come off the header.
  - Section-level findings stay in the body; entry findings stay on their card.
  - The team's answer to ask 7: the entries are visible when the section is open, and Review answers "what's weak" better than a done flag.

**Entry cards**

- **Left:** a drag handle (grip icon).
  - With a mouse, it shows on hover and focus; on touch, it always shows.
  - Dragging reorders within the section through `Reorder`.
  - Clicking it opens a menu with Move up and Move down, the 2.5.7 and keyboard path.
- **Middle:** the entry's label and its finding lines. Clicking opens the form at the entry.
- **Right:**
  - The show toggle: an eye button with `aria-pressed`. When hidden, it shows eye-off at all times and the label turns muted.
  - Delete keeps the existing undo (0008).
  - The up and down buttons go.

**Hidden entries (data)**

- Each entry gets `hidden: boolean`, optional and defaulting to `false`. Existing CVs parse unchanged.
  - The content is JSON in the existing column. There's no database migration and no version bump.
- The preview, the PDF (0038) and Review skip hidden entries.

**Default sections for a new CV**

- Contact, Summary, Experience, Education and Skills.
- This matches the research above and today's `emptyCvContent`, so nothing new is added.
- The research doesn't support a universal fifth list section, so Languages stays a one-click add.
  - Assumption to revisit for France: French CVs often list languages.

**Add section**

- A full-width quiet button at the end of the list, inside its own padded row. It keeps the existing menu.

## Consequences

- **No new dependency.**
  - `Reorder` drives layout animation on the main thread, which is fine at 50 entries at most.
  - A review drags in a 50-entry section to check it.
- **The schema change is additive.** Tests cover:
  - parsing old content without `hidden`;
  - the renderer and PDF skipping hidden entries;
  - Review skipping them.
- **The spec should check:**
  - Keyboard: Tab to the handle, open its menu and move an entry; toggle the show button; collapse a section with Enter or Space.
  - The 2.5.7 path, using only clicks.
  - Screenshots at 390 and 1440 px, light and dark.
- **The surfaces** reuse `Card` styling and the 0037 tokens. No new tokens.
- **Ruled out for now:** dragging sections; dragging entries across sections; remembering collapsed state.
