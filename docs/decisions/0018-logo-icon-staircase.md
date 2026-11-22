# 0018: Logo icon redrawn as a staircase of dots ("the steps")

- **Status:** Proposed
- **Proposed:** 2026-11-22 by the product team (roles: Product Designer, UI, Frontend)
- **Approved:**
- **Supersedes:** the icon in [0010](0010-logo-and-brand-identity.md) only (the wordmark, the A + D family, proportions, colour rules and name rules stay)
- **Specs:** none yet

## Context

0010 (approved) gave Jubilee "the path": five rising dots that grow, the last one marigold. Flovet shared a reference icon on 2026-11-22, equal dots stacked as rising steps, and asked to update the icon after it. 0010's own review had flagged that the path's two smallest dots fade at 16 px.

## Research

| Reference                                 | What they do                                                                                                                    | Adopt / adapt / reject | Why                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| Flovet's reference (image shared in chat) | Six equal dots in three rising columns (1, 2, 3), lighter at the bottom left, solid at the top right, on a violet gradient tile | Adapt                  | Equal dots on a grid hold their shape at small sizes and still read as steps upward    |
| Same reference, the gradient              | Diagonal violet-to-purple gradient background                                                                                   | Reject                 | 0007: no gradients, glows or glass, ever                                               |
| GOV.UK logo elements (opened for 0010)    | A separate small version for favicons                                                                                           | Adapt                  | One shape at every size is simpler; bigger dots with less padding are enough for 16 px |

Sources (links actually opened): the reference image shared by Flovet in chat; https://brand.design-system.service.gov.uk/logo-system/logo-elements (opened 2026-11-21 for 0010).

## Options

1. **Keep 0010's path.** No change; the smallest dots stay weak at 16 px and the favicon needs a separate three-dot drawing.
2. **The steps (chosen).** Six equal dots, diameter 15 on a 20-unit grid, in three steps; violet dots step in opacity by diagonal (50, 65, 80, 95%); the top dot is marigold. The favicon is the same staircase with bigger dots.
3. **Copy the reference as-is.** Rejected: its gradient breaks 0007, and a mark too close to another product's icon is a risk.

## Decision

Option 2. The idea from 0010 stays (steps of a job search ending on the offer, one marigold dot); the drawing becomes the staircase. In the full logo the icon is as tall as the name from the top of "b" to the baseline, bottom row on the baseline, gap ½ x-height, as 0010's guidelines already say. Files and rules: [the brand guidelines](../design/brand-guidelines.md) and `docs/design/brand/logo/`.

## Consequences

- When approved: `src/components/brand/jubilee-icon.tsx` (sign-in page) is redrawn from `jubilee-icon.svg`; until then the app keeps 0010's path.
- The favicon no longer needs its own drawing.
- Before approving, check that the icon is not too close to the reference if the reference is another company's mark.
