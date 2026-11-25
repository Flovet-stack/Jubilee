# 0030: Icons sized from the font size, not the line box

- **Status:** Approved
- **Proposed:** 2026-11-25 by the product team (roles: UI, Frontend)
- **Approved:** 2026-11-25 by Flovet (in chat: "1.125em (110%)")
- **Supersedes:** 0029's icon size (`1lh`). 0029's padding, gap, sizes and exceptions stand.
- **Specs:** specs/18-icon-size.md

## Context

Flovet finds the icons in controls too big (2026-11-25). 0029 sizes every icon at `1lh`, as in Flovet's notes. With `line-height: 1.5`, that makes each icon **150 % of the font size**: 24 px next to 16 px text, 21 px next to 14 px, 18 px next to 12 px. Flovet asked for an icon close to the font size, about 110 %, and for research on the question.

## Research

| Reference                                    | What they do                                                                                                                                                                                                                | Adopt / adapt / reject | Why                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| IBM Carbon, icon usage                       | "16px and 20px icons are optimized to feel balanced when paired with 14px and 16px" text, i.e. about 1.0–1.25 × the font size. "Don't alter the icon-text size ratio." Icons centre-aligned to text, never baseline-aligned | Adopt the range        | The only source with a stated icon-to-text pairing; 110 % sits inside it |
| Atlassian, icon usage                        | Default icons are 16 px next to 14 px body text (about 1.14 ×); 12 px icons only for chevrons in buttons and menus                                                                                                          | Adopt                  | Same range as Carbon                                                     |
| Jubilee 0009                                 | Icons 20 px next to 16 px text (1.25 ×) before 0029                                                                                                                                                                         | Reference              | The top of the range; 0029's 1.5 × is well above all three               |
| Primer, button; Material 3; Apple SF Symbols | Primer's page states no icon sizes. M3 and Apple pages didn't render when fetched                                                                                                                                           | Not relied on          | Nothing checkable                                                        |
| Flovet's notes (0029)                        | Icon `1lh`, so the icon fills the line box and the padding math stays simple                                                                                                                                                | Adapt                  | Keep the slot and the spacing; shrink only the drawn icon                |

Sources (links actually opened):

- https://carbondesignsystem.com/elements/icons/usage/
- https://atlassian.design/components/icon/usage
- https://primer.style/product/components/button/
- Tried, title only: https://m3.material.io/styles/icons/applying-icons, https://developer.apple.com/design/human-interface-guidelines/sf-symbols

## Options

1. **1.125em (about 110 %).** 18 px at 16 px text, 15.75 px at 14 px, 13.5 px at 12 px. Pros: Flovet's ask; mid-range of Carbon and Atlassian. Cons: fractional sizes at md and sm (Hugeicons are strokes, so they stay sharp).
2. **1.25em (125 %).** 20 / 17.5 / 15 px. Pros: our old 20 px at 16 px text; Carbon's upper pairing. Cons: still reads large next to 12 px text.
3. **1em (100 %).** 16 / 14 / 12 px. Pros: simplest. Cons: icons look light next to semibold labels; Carbon calls 16 / 16 its smallest pairing.

## Decision

**Option 1**, chosen by Flovet: `--icon: 1.125em`.

The spacing keeps 0029's principle that **an icon sits as far from the edge as from the top and bottom**. A smaller icon leaves `(1lh − --icon) / 2` of space above and below it, so the same amount is added at its sides:

```css
.box {
  --icon: 1.125em;
  --icon-inset: calc((1lh - var(--icon)) / 2);
}
.icon {
  width: var(--icon);
  height: var(--icon);
  margin-inline: calc(var(--py) - var(--px) + var(--icon-inset));
}
.icon-only {
  padding: calc(var(--py) + var(--icon-inset));
}
```

- Heights don't change (40 / 35 / 30 px, 44 px on touch); icon-only buttons stay square at the same size.
- Icon → edge = icon → text = icon → top = `--py + --icon-inset` (at 16 px text: 8 + 3 = 11 px).
- Field start and end icons use the same `--icon`; fields keep 16 px text, so their icons are 18 px.
- Fallback without `lh`: `--icon-inset: calc((1.5em - var(--icon)) / 2)`.

## Consequences

- Easier: icons read as part of the label, as in Carbon and Atlassian.
- Harder: icons at md and sm are fractional pixels.
- Reviews check: every icon in a control is `--icon` wide; icon → edge equals icon → top; heights unchanged.
