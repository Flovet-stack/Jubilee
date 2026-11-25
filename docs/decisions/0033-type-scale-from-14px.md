# 0033: A 14 px base and a type scale set by hierarchy

- **Status:** Proposed
- **Proposed:** 2026-11-26 by the product team (roles: UI, UX, Frontend, Product)
- **Approved:**
- **Supersedes:** 0007's type scale and body size (design brief: "body 400 at 16 / 1.5")
- **Specs:**

## Context

Flovet asked (2026-11-26) for a 14 px base, with every other size set by the item's place in the hierarchy. Today the base is 16 px (`--text-base: 1rem`), the scale is 12 · 14 · 16 · 18 · 20 · 24 · 32 · 40 (0007), and sizes were picked per screen: app page titles use 32 px, the sidebar 14 px, lists 16 px. Jubilee is becoming a dense working tool (sidebar, tracker, editor, lists), so more fits on a screen at 14 px.

Control padding, gaps and icon size are already computed from the font size (0029, 0030), so they follow the new sizes without hand-tuning.

## User lens

Amina, job seeker, small laptop in the evening and phone on the go.

| Question                       | Answer                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why does she open the app?** | To check where she stands and act: open a CV, scan the tracker, approve. She needs to see more at once without scrolling.                                  |
| **How is she using it?**       | Scanning lists and boards, short sessions, often on a 13" laptop; on a phone she taps fields and types.                                                    |
| **What next?**                 | The hierarchy guides the eye: page title, then section title, then the rows, then their details. One size per role makes that order obvious on every page. |
| **What do we leave out?**      | Fluid (viewport-based) type, a user font-size setting, and per-screen exceptions. The CV paper keeps its own type (0025); it is a document, not UI.        |

## Research

| Reference                                                 | What they do                                                                                                    | Adopt / adapt / reject | Why                                                                                                                     |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Material Design 3**                                     | Body medium and label large are 14; titles step up (16, 22); body large 16 for longer reading.                  | **Adopt**              | The same structure: 14 for UI and labels, 16 for long reading, larger steps only for titles.                            |
| **Dense SaaS (Linear, Notion, Teal, from 0027 research)** | 13–14 px UI text, page titles about 20–24 px.                                                                   | **Adopt**              | Matches the dashboard Flovet wants; app page titles drop from 32 to 24.                                                 |
| **iOS Safari auto-zoom**                                  | Focusing a field with text under 16 px zooms the page in. Disabling zoom is unreliable and hurts accessibility. | **Adapt**              | Fields are 14 px with a mouse and 16 px on touch (`pointer: coarse`), so phones never zoom and the desktop stays dense. |
| **WCAG 2.2 (1.4.4 Resize text)**                          | Text must survive 200% browser zoom; no minimum size, but sizes in `rem`.                                       | **Adopt**              | All sizes stay in `rem`, so browser zoom and user settings still scale everything.                                      |

Sources (opened or read in results, 2026-11-26):

- https://developer.android.com/reference/kotlin/androidx/compose/material3/Typography
- https://docs.rs/crate/bevy_material_ui/latest/source/src/typography.rs (M3 values, secondary)
- https://css-tricks.com/?p=339455 (iOS input zoom under 16 px)
- https://weblog.west-wind.com/posts/2023/Apr/17/Preventing-iOS-Textbox-Auto-Zooming-and-ViewPort-Sizing
- https://frontendchecklist.io/rules/css/viewport-zoom
- https://www.w3.org/WAI/WCAG22/Understanding/resize-text

## Options

1. **14 px everywhere, fields too.** The densest option, but every phone zooms in when a field is tapped.
2. **14 px base, one size per role, 16 px only where needed (chosen).**
3. **Keep 16 px and shrink only the dashboard.** Two scales to maintain; the hierarchy drifts again.

## Decision

Option 2. Base **14 px**; every text belongs to a role, and the role sets its size. The ratio is about 1.15 between body steps and wider for titles, so each level reads as clearly different.

| Role             | Used for                                                | Size / line height | Weight                      | Token       |
| ---------------- | ------------------------------------------------------- | ------------------ | --------------------------- | ----------- |
| Display          | Marketing hero, sign-in welcome                         | 32 / 1.15          | 700                         | `text-3xl`  |
| Page title       | One per app page ("Resumes", "Home")                    | 24 / 1.2           | 700                         | `text-2xl`  |
| Section title    | Wells, cards, dialog titles                             | 18 / 1.35          | 600                         | `text-lg`   |
| Subsection title | Groups inside a section, editor entry headings          | 16 / 1.4           | 600                         | `text-md`   |
| **Body (base)**  | UI text, rows, nav, buttons, labels, menus, table cells | **14 / 1.5**       | 400; labels and buttons 600 | `text-base` |
| Reading          | Long text: job descriptions, legal pages, help articles | 16 / 1.6           | 400                         | `text-md`   |
| Secondary        | Hints, muted details, sidebar section headings          | 13 / 1.45          | 400 or 600                  | `text-sm`   |
| Caption          | Timestamps, counts, badges, tags                        | 12 / 1.4           | 500                         | `text-xs`   |

- **Fields:** 14 px with a mouse, 16 px on touch screens (`pointer: coarse`). Placeholder and value use the same size.
- **Tokens:** `--text-base` becomes `0.875rem`; `text-sm` 13 px, `text-xs` 12 px; a new `text-md` 16 px; `text-xl` (20) and `text-4xl` (40) are retired, with existing uses mapped to the nearest role.
- **Every size is a role.** A review fails a size used outside its role (for example a 24 px card title).
- **Excluded:** the CV paper (0025) and email templates keep their own type.

## Consequences

- Every screen gets denser; controls shrink with their text (0029), so heights on mouse drop too. Touch targets stay at least 44 px (0029 rule unchanged).
- About 150 class uses need mapping to roles; it's one spec, checked screen by screen at 390 and 1440 px, light and dark.
- Contrast pairs don't change, but 12–13 px muted text must still pass 4.5:1 (existing token tests).
- The design brief's body line ("16 / 1.5") is updated to point here.
- Reverting is one token change plus the role mapping.
