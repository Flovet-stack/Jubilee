# 0028: Button spacing from the type, and shorter controls on mouse

- **Status:** Approved
- **Proposed:** 2026-11-25 by the product team (roles: UI, Frontend, UX)
- **Approved:** 2026-11-25 by Flovet (in chat). Revised the same day, before the build merged: Flovet set `lg` to 40 px; `md` and `sm` follow in 8 px steps.
- **Supersedes:** the height table in 0020 (mouse heights only). 0020's touch floor, size-by-screen rule and "never mix sizes" stand. 0022's radius-by-size stands.
- **Specs:** specs/16-button-spacing.md

## Context

On a large screen, Flovet finds the buttons too tall (2026-11-25). Today every size has a fixed `min-h` and hand-picked padding (`px-4 py-1.5`, `px-5 py-2`, `px-3 py-1`), and icons get `gap-2` whatever the size. So the space around the label, around an icon and between them doesn't match: on a button with a trailing icon, the icon sits closer to the top edge than to the side edge.

We already have both pieces Flovet asked about: `Button` takes `icon` and `iconEnd`, and `IconButton` is the icon-only button (required label, tooltip). What's missing is one spacing rule behind all three.

## Research

| Reference                                               | What they do                                                                                                                              | Adopt / adapt / reject         | Why                                                                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Typography-based button spacing (video, Flovet's notes) | `--py: 0.5em; --px: calc(var(--py) + (1lh - 1cap) / 2)`; padding `py px`, gap `px`; icon `1lh` square with `margin-inline: calc(py - px)` | Adopt, with our sizes          | The visible text gets equal space on all sides; an icon sits `py` from the edge and from the text |
| MDN, CSS `<length>`                                     | `lh` = the element's computed line-height; `cap` = the font's cap height                                                                  | Adopt                          | Both are standard units; `1lh - 1cap` is the empty space in the line box                          |
| caniuse, `cap` and `lh`                                 | `cap`: Chrome/Edge 118, Firefox 97, Safari 17.2 (93.9 % global). `lh`: Chrome/Edge 109, Firefox 120, Safari 16.4 (95.6 %)                 | Adopt with a fallback          | Older phones in our markets still exist; a fixed-px fallback keeps the layout without the units   |
| 0020 research (Carbon, Primer, NN/g, WCAG 2.5.8)        | Carbon's 24/32/40/48 scale; 44 px touch floor; 24 px WCAG minimum                                                                         | Adopt 24/32/40, keep the floor | Our three sizes are Carbon's lower three steps; `sm` sits on WCAG's 24 px; touch stays at 44 px   |

Sources (links actually opened):

- https://developer.mozilla.org/en-US/docs/Web/CSS/length
- https://caniuse.com/mdn-css_types_length_cap
- https://caniuse.com/mdn-css_types_length_lh
- Flovet's pasted notes and screenshots of the technique (2026-11-25); the video itself was not opened.

## Options

1. **Keep the sizes, only fix the spacing.** Pros: no visual change in height. Cons: doesn't answer "too tall".
2. **Shrink the tokens, keep hand-picked padding.** Pros: small change. Cons: spacing stays guessed and still drifts with icons and font size.
3. **Height comes from the type: line box + 2 × `py`, padding and icon spacing from the formula, smaller mouse sizes.** Pros: one rule for text, text + icon and icon-only; the heights follow from it. Cons: needs a fallback for old browsers; inputs move with the shared tokens.

## Decision

**Option 3.** Every button, `IconButton` and `ButtonLink` uses:

```css
--px: calc(var(--py) + (1lh - 1cap) / 2);
padding: var(--py) var(--px);
gap: var(--px);
/* icon */
width: 1lh;
height: 1lh;
margin-inline: calc(var(--py) - var(--px));
```

Icon-only buttons use `padding: var(--py)`, so they're square at the same height.

| Size | Text  | Line box (`1lh`) = icon | `py`         | Mouse height       | Touch (`pointer: coarse`) |
| ---- | ----- | ----------------------- | ------------ | ------------------ | ------------------------- |
| `lg` | 16 px | 24 px                   | 8 px (0.5em) | **40 px** (was 48) | 44 px (was 48)            |
| `md` | 14 px | 20 px                   | 6 px         | **32 px** (was 40) | 44 px                     |
| `sm` | 14 px | 16 px                   | 4 px         | **24 px** (was 32) | 44 px                     |

- The tokens `--control-h-lg / --control-h / --control-h-sm` become 40 / 32 / 24 on mouse, so inputs and selects keep the same height as buttons in a row. Input text stays 16 px (0020).
- On touch all three tokens are 44 px, used as a `min-height`; the padding doesn't change, the extra space just centres the content.
- **Fallback:** under `@supports not (height: 1cap)`, `--px` is a fixed px value per size (worked out for Plus Jakarta Sans), and the icon uses the fixed line-box size.
- **One icon button, two roles.** `Button` with `icon` / `iconEnd` covers text + icon. `IconButton` stays as the icon-only API, because it forces an accessible label and the tooltip (0008: no mystery icons); internally it uses the same variants.

## Consequences

- Easier: no per-button padding guesses; adding an icon never needs a manual tweak; dense screens get shorter controls on desktop.
- Harder: `md` labels drop from 16 to 14 px; `sm` has a tight 16 px line box, so long French labels that wrap look crowded (keep `sm` labels short). An `sm` field is 24 px with 16 px text, so it has almost no inner padding on mouse.
- Implementation needs its own spec: `button.tsx`, the size tokens in `globals.css`, the field heights that use them, the touch floor, the fallback, and `/design-system` showing text, text + icon (start and end) and icon-only at each size.
- Reviews check: no hard-coded button padding or gap left; icon-to-edge equals icon-to-text equals `py`; touch never under 44 px; layout holds with `cap` disabled.
