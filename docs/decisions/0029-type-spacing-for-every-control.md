# 0029: Type spacing for every control, sizes set by font size

- **Status:** Approved
- **Proposed:** 2026-11-25 by the product team (roles: UI, Frontend)
- **Approved:** 2026-11-25 by Flovet (in chat: "Font sets size" and "Skill + CLAUDE.md line")
- **Amendment (Approved 2026-11-25 by Flovet, in chat: "Approve, push to PR"):** sidebar items 40 px with a mouse / 44 px on touch, superseding 0027's 36 px rows and 20 px icons; avatars and text/back links exempt.
- **Supersedes:** 0028's size table and its per-size `--py` (the formula, icon rule and fallback stand); 0027's sidebar row size (36 px rows, 20 px icons). 0020's touch floor and size-by-screen rule stand.
- **Specs:** specs/17-type-spacing-everywhere.md

## Context

Flovet asked for the technique in their notes (2026-11-25) to be applied exactly as given, and to every component, not only buttons. Re-reading the notes showed two drifts in the 0028 build:

1. The notes fix `--py: 0.5em` and `line-height: 1.5` for every size and say "avoid arbitrary padding adjustments for individual button sizes". 0028 used a separate `--py` per size (8 / 6 / 4 px) to land on 40 / 32 / 24.
2. Only buttons use the rule. Fields, select and menu rows, tabs, badges, tooltips, toast actions and sidebar items still use hand-picked padding.

With `--py: 0.5em` and `line-height: 1.5`, a control is always 2.5 × its font size, so a size is a font size.

## Research

| Reference                                          | What they do                                                                                                                        | Adopt / adapt / reject | Why                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| Flovet's notes (typography-based button spacing)   | `--py: 0.5em`, `line-height: 1.5`, `--px: calc(var(--py) + (1lh - 1cap) / 2)`, gap `--px`, icon `1lh` with `margin-inline: py − px` | Adopt as written       | Flovet's instruction; it also says to apply the system throughout the interface              |
| 0028 research (MDN `<length>`, caniuse `lh`/`cap`) | `lh` and `cap` widely supported; fallback needed for older browsers                                                                 | Keep                   | Same units; the fallback becomes one em value because `--py` and `line-height` are now fixed |
| 0020 research (WCAG 2.5.8, NN/g)                   | 24 px minimum target; 44 px on touch                                                                                                | Keep                   | Mouse sizes (30 px and up) clear 24 px; touch stays 44 px                                    |

Sources (links actually opened): those listed in 0028 and 0020; Flovet's notes and screenshots (2026-11-25).

## Options

1. **Font sets size.** `--py: 0.5em`, `line-height: 1.5` everywhere; lg 16 px → 40, md 14 px → 35, sm 12 px → 30.
2. **Keep 40 / 32 / 24** with a per-size `--py` (the 0028 build).
3. **Smaller fonts**: lg 16 → 40, md 13 → 32.5, sm 11 → 27.5.

## Decision

**Option 1**, chosen by Flovet.

| Size | Control text | Line box = icon | `--py` | Mouse height | Touch |
| ---- | ------------ | --------------- | ------ | ------------ | ----- |
| `lg` | 16 px        | 24 px           | 8 px   | 40 px        | 44 px |
| `md` | 14 px        | 21 px           | 7 px   | 35 px        | 44 px |
| `sm` | 12 px        | 18 px           | 6 px   | 30 px        | 44 px |

**The rule, for any padded box that holds text and/or icons:**

- `line-height: 1.5`; `--py: 0.5em`; `--px: calc(var(--py) + (1lh - 1cap) / 2)`; `padding: var(--py) var(--px)`; `gap: var(--px)`.
- Icons are `1lh` square with `margin-inline: calc(var(--py) - var(--px))`. Icon-only boxes use `padding: var(--py)`.
- Fallback without `lh`/`cap`: `--px: calc(var(--py) + 0.38em)` (Plus Jakarta Sans: cap height 0.744em), icons `1.5em`.

**Where the box can't follow its own text, it keeps the rule and declares the difference:**

- **Fields** (input, textarea, select trigger) keep 16 px text so iOS doesn't zoom (0020) and match the button height of their size. Their `--py` is `(height − 1lh) / 2` instead of `0.5em`; `--px` and icons use the same formula.
- **Rows** (menu, select options, tabs) keep their 44 px minimum on every pointer (0020 doc); the extra height centres the content. **Sidebar items** follow the rule at 16 px (40 px rows, 24 px icons, replacing 0027's 36 px / 20 px) and reach 44 px on touch only, as in 0027.
- **Avatars** are identity, not icons: they keep their own size.
- **Text links and back links** have no box, so the rule doesn't apply; they follow `TextLink`.
- **Badges** are labels, not targets: `--py: 0.15em`.

The rule is written once in `.claude/skills/type-spacing/SKILL.md`, which builders and the reviewer read for any component work.

## Consequences

- Easier: one rule, no padding guesses; icons are always proportional to the text.
- Harder: md and sm buttons use 14 and 12 px text; 12 px is the smallest text in the UI and is only for `sm` row actions. Heights 35 and 30 px are off the 4 px grid; that's accepted because the type sets them.
- Reviews check: no hand-picked padding or gap on a control; icons sized `1lh`; touch at least 44 px.
