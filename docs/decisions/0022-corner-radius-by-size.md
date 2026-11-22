# 0022: Corner radius by size

- **Status:** Proposed
- **Proposed:** 2026-11-22 by the product team (roles: UI, UX, Frontend)
- **Approved:**
- **Supersedes:** the radius values for controls and cards in 0007's "Radius by role" line (8 px controls, 12 px cards). Wells, sheets, dialogs, the CV paper and pills stay as 0007 set them.
- **Specs:** (the spec that implements it)

## Context

Flovet asked whether large radii on fields, buttons and containers work against screens that show a lot of information and must stay very readable (the CV editor, the tracker).

Today, from 0007:

- 8 px on every control, whatever its height.
- 12 px on wells and cards.
- 16 px on sheets and dialogs.

0020 now gives controls three heights (48, 40 and 32 px), so a single control radius no longer fits all of them.

## Research

| Reference                    | What they do                                                                                                                                    | Adopt / adapt / reject | Why                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| Atlassian, radius            | 4 px compact buttons and tags; 6 px buttons, inputs, selects; 8 px cards, in-page containers, menus; 12 px full-page containers, modals, tables | Adopt the mapping      | The closest match to a dense product UI: smaller radius on smaller, denser elements |
| GitHub Primer, size          | Radius tokens 3, 6 (default), 12 px and full                                                                                                    | Adopt as a check       | 6 px is the default in a dense product too                                          |
| Microsoft Fluent 2, shapes   | 4 px default; 2 px under 32 px; 8 px large components; 12 px popovers and sheets. Rounding avoids awkward gaps inside one container             | Adopt the size rule    | Small elements get small radius                                                     |
| Adobe Spectrum, rounding     | 4 px small; 8 px default; 10 px cards and panels; 16 px dialogs; rounding scales with component size                                            | Adopt the principle    | Radius grows with the element, and nested corners should look balanced              |
| IBM Carbon, Material 3, NN/g | Carbon's shape page returned 404, Material's didn't render, and NN/g has no article at the URL tried                                            | Not used               | Nothing read, so nothing claimed                                                    |
| Our 0007 research            | Clemta: 12 px wells and cards; Ownr: 6 px buttons, 12 px cards                                                                                  | Keep the wells         | The grey-well look is part of the approved direction                                |

Sources (links actually opened):

- https://atlassian.design/foundations/radius
- https://primer.style/foundations/primitives/size
- https://fluent2.microsoft.design/shapes
- https://spectrum.adobe.com/foundations/styles/object-styles/rounding
- Tried, but no content: https://carbondesignsystem.com/elements/shape/overview/ (404), https://m3.material.io/styles/shape/corner-radius-scale (didn't render), https://www.nngroup.com/articles/rounded-corners/ (404)

**What the evidence says, objectively:**

- None of the sources claims radius affects how readable text is. Readability comes from type size, line length, contrast and spacing (0007, 0008).
- What the sources do agree on is **proportion**. Systems built for dense product UI use 4–8 px on controls and 8–12 px on containers. Radius shrinks as elements get smaller.
- Flovet's instinct is right about how a dense screen **looks**: an 8 px radius on a 32 px button reads as a pill-like bubble, and many rounded boxes in one view add visual noise. It isn't about reading the text.

## Options

1. **Keep 0007 as is.**
   - Pros: no change.
   - Cons: an 8 px radius on 32 px buttons looks bubbly; dense views look softer than the content needs.
2. **Shrink everything** (4 px controls, 8 px containers).
   - Pros: crisp.
   - Cons: loses the friendly grey-well look Flovet chose in 0007, even on the simple screens where it works.
3. **Radius scales with size.**
   - Pros: matches Atlassian, Fluent and Spectrum; simple screens keep their look while dense screens tighten automatically.
   - Cons: one more rule to follow, though it's built into the components.

## Decision

**Option 3.** Radius follows the element's size, not the screen:

| Element                                   | Radius                 | Token                             |
| ----------------------------------------- | ---------------------- | --------------------------------- |
| `lg` controls (48 px)                     | 8 px                   | `--radius-control-lg`             |
| `md` controls (40 / 44 px)                | 6 px                   | `--radius-control`                |
| `sm` controls (32 px), tags, inline marks | 4 px                   | `--radius-control-sm`             |
| Checkbox, CV paper                        | 4 px, 2 px (unchanged) | `--radius-mark`, `--radius-paper` |
| Cards, menus, popovers, the calendar      | 8 px                   | `--radius-card`                   |
| Wells (page-level groups)                 | 12 px (unchanged)      | `--radius-box`                    |
| Dialogs and sheets                        | 16 px (unchanged)      | `--radius-sheet`                  |
| Badges, avatars, switch                   | full (unchanged)       | `rounded-full`                    |

- A card sits inside a well, so 8 inside 12 keeps the nested corners balanced (Spectrum).
- On touch, an `md` control grows to 44 px (0020) and keeps 6 px.
- The focus ring follows the element's radius.

## Consequences

- Easier: dense screens look tighter without a separate "dense mode". Simple screens keep 0007's friendly wells.
- Harder: components must take their radius from their size, never a hard-coded `rounded-control`.
- The CV editor and tracker get their density from 0020's sizes and this scale, not from smaller text.
- Implementation goes in the same spec as 0020 (sizes and radius change together): tokens in `globals.css`, `cn()` theme names, `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Card`, `Menu`, and `/design-system`.
- Reviews check: radius matches size; no card in a card; no raw radius values.
