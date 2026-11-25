# 0020: Control sizes by screen type and pointer

- **Status:** Approved (mouse heights superseded by 0028)
- **Proposed:** 2026-11-22 by the product team (roles: UI, UX, Frontend, Product)
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Supersedes:** the two control-height values in 0009 (`--control-h` 48 px, `--control-h-sm` 44 px). The rest of 0009 stands.
- **Specs:** specs/12-control-sizes-and-radius.md

## Context

0009 set every button, input and select to 48 px (44 px for `sm`), on every device. That suits a focused screen with one task (sign-in, onboarding). It doesn't suit dense screens. The CV editor shows many fields and several actions per section. At 48 px, fewer fields fit on screen, the controls outweigh the text they act on, and every secondary action looks as heavy as the main one. Flovet raised this on 2026-11-22.

The brief still wants simple screens, mostly on mid-range phones, so touch targets must stay comfortable.

## Research

| Reference                                 | What they do                                                                                                                         | Adopt / adapt / reject | Why                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------- |
| WCAG 2.2, 2.5.8 Target Size (Minimum, AA) | Pointer targets at least 24 × 24 CSS px, or spaced so a 24 px circle on each doesn't overlap another. 2.5.5 (AAA) uses 44 × 44       | Adopt                  | 24 px is the legal floor; 44 px is our touch floor                                                 |
| NN/g, touch target size                   | Touch targets at least 1 cm × 1 cm (about 44 px), about 2 mm apart; larger for primary calls to action                               | Adopt                  | Sets the phone size and keeps big primary actions on focused screens                               |
| IBM Carbon, button and text input         | One scale for both: xs 24, sm 32, md 40, lg 48 px. Don't mix button sizes within a group                                             | Adopt the scale        | The same 32 / 40 / 48 steps fit our 4 px grid; inputs and buttons share heights so rows line up    |
| GitHub Primer, button                     | small, medium (default, "best for most interfaces"), large ("use sparingly to emphasize an action")                                  | Adopt the principle    | Large is for emphasis, not the default; dense product screens default to medium                    |
| Atlassian, button                         | Default spacing for most cases, `compact` for tables                                                                                 | Adapt                  | Compact belongs to dense rows (lists, tables, CV sections), not to whole pages                     |
| Material 3, Apple HIG                     | Pages didn't render when fetched. From memory, not checked: Material buttons 40 dp tall in a 48 dp touch target; Apple 44 pt targets | Reference only         | Same pattern: the visible control can be smaller than its touch area. Unverified, so not relied on |

Sources (links actually opened):

- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://www.nngroup.com/articles/touch-target-size/
- https://carbondesignsystem.com/components/button/style/
- https://carbondesignsystem.com/components/text-input/style/
- https://primer.style/product/components/button/
- https://atlassian.design/components/button/examples
- Tried, but no content returned: https://m3.material.io/components/buttons/specs, https://developer.apple.com/design/human-interface-guidelines/buttons

## Options

1. **Keep 48 px everywhere (0009).**
   - Pros: simple; generous everywhere.
   - Cons: dense screens look bulky and show less; secondary actions compete with the primary one.
2. **One smaller size everywhere (40 px).**
   - Pros: simple; fits dense screens.
   - Cons: focused screens lose their large, confident main action, and 40 px is under the 44 px touch floor on phones.
3. **A three-step scale chosen by screen type, with a touch floor.**
   - Pros: each screen gets the size that suits it; phones stay at 44 px or more.
   - Cons: builders must pick a size; that rule has to be written down and reviewed.

## Decision

**Option 3.** One scale for buttons, inputs and selects:

| Size | Mouse or pen | Touch (`pointer: coarse`) | Use for                                                                  |
| ---- | ------------ | ------------------------- | ------------------------------------------------------------------------ |
| `lg` | 48 px        | 48 px                     | The main action and fields of a single-task screen (sign-in, onboarding) |
| `md` | 40 px        | 44 px                     | The default, everywhere else, including the CV editor                    |
| `sm` | 32 px        | 44 px                     | Inline row actions in dense lists or sections ("Edit", "Remove", "Move") |

- **Phones never go below 44 px.** On touch, `sm` and `md` grow to 44 px. Mouse users get the smaller sizes, which still clear WCAG's 24 px with room to spare.
- **Input text stays 16 px at every size**, so iOS doesn't zoom into a field when it's focused.
- **Size by screen, not per control.** One size for the fields of a form. Never mix sizes inside a button group (Carbon).
- **Weight before height.** On dense screens, quiet and text buttons carry secondary actions; there is one primary button per section. That does more for "too heavy" than shaving pixels.

Tokens: `--control-h-lg` 48, `--control-h` 40, `--control-h-sm` 32, and inside `@media (pointer: coarse)` `--control-h` and `--control-h-sm` become 44. Icon-only buttons follow the same heights.

## Consequences

- Easier: the CV editor and other dense screens can show more without bulky controls; touch use is unchanged or better.
- Harder: each screen picks `lg` or `md` on purpose. The sign-in screen moves to `lg` so it looks the same as today.
- Implementation needs its own spec: the tokens in `globals.css`, a `size` of `lg` / `md` / `sm` on `Button`, `IconButton`, `Input`, `Textarea` and `Select`, the sign-in screen on `lg`, and `/design-system` showing all three sizes on mouse and touch.
- Reviews check: no control under 44 px on touch; no mixed sizes in one button group; `lg` only on single-task screens; input text at 16 px.
