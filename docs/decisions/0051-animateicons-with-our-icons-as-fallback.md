# 0051: AnimateIcons as the icon source, with our icons as fallback

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: Tech Lead, UI, Frontend), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet
- **Supersedes:** none. 0030 and 0045 (icon sizes, stroke) still apply.
- **Specs:** specs/30-animateicons-fallback.md

## Context

Flovet (2026-11-27): move the icon library to AnimateIcons (animateicons.in), and use the current icons as the fallback.

Right now we have 33 icons in `src/components/icons/`. We drew them from the shapes of `@hugeicons/core-free-icons` and animated them ourselves. They share `use-control-hover`, which plays an icon when its whole control is hovered, and `use-icon-accessibility`. About 20 files import them from `@/components/icons`. Adding a dependency needs approval (CLAUDE.md).

## Research

| Reference                                           | What they do                                                                                                                                                                                                                        | Adopt / adapt / reject        | Why                                                                                                                                                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@animateicons/react` 0.13.0 (npm, MIT, Avijit Dey) | 1,500 animated SVG icons, as Lucide (999) and Huge (501). One import path per icon. `motion` is bundled. React 18 and 19 peers.                                                                                                     | **Adopt** as the first source | MIT licence. It adds no peer dependency beyond React, and per-icon imports keep the bundle small.                                                                        |
| Its API                                             | `size`, `color` (default currentColor), `duration`, `isAnimated`. A ref handle has `startAnimation()` and `stopAnimation()`. Reduced motion is honoured with no setup.                                                              | **Adopt**                     | The handle lets our `use-control-hover` play the icon when the whole button is hovered, so the behaviour stays the same.                                                 |
| Its stroke                                          | `strokeWidth="2"` is hard-coded in the source. There is no prop for it.                                                                                                                                                             | **Adapt**                     | 0045 set our stroke at 1.75. A CSS override `[data-icon-source="animate"] * { stroke-width: 1.75 }` keeps every icon at one weight.                                      |
| Coverage, checked against the package files         | About 15 of our 33 icons match a "Huge" file name exactly, including check, chevrons, copy, download, eye, search, send, user and filter. The rest (home, bell, x, plus, settings, trash and others) differ in name or are missing. | **Adapt**                     | The fallback is needed, as Flovet expected. Lucide versions are not used, so every icon keeps the Hugeicons look.                                                        |
| Its THIRD_PARTY_NOTICES                             | Lists Lucide and Feather. It does not name Hugeicons for the "Huge" set.                                                                                                                                                            | **Flag**                      | We keep our own notices for the fallback icons. The Tech Lead marks the origin of the "Huge" set as unconfirmed; it is not a blocker, because the package itself is MIT. |

Sources (opened): animateicons.in, animateicons.in/icons/docs, animateicons.in/icons/docs/react, github.com/Avijit07x/animateicons LICENSE, the npm registry entry and the package tarball.

## Options

1. **Replace everything with AnimateIcons.** One source. But it lacks about half our icons and would mix in Lucide shapes. Rejected.
2. **AnimateIcons first, our icons as fallback, behind one wrapper (chosen).** The import path stays `@/components/icons`. Each name uses the Huge icon if there is one, and ours if not.
3. **Keep ours, borrow only their animations.** No dependency, but it isn't what Flovet asked for. Rejected.

## Decision

Option 2:

- Add `@animateicons/react`, Huge set only, imported per icon.
- `@/components/icons` keeps the same names and props. Each icon either wraps the AnimateIcons component, mapping `size` from 0030/0045 (`1em` sized by `--icon`) and passing `color: currentColor`, or re-exports our current icon.
- A typed source map (`icon-sources.ts`) records which source each icon uses. A test checks that every exported icon resolves to one source.
- `use-control-hover` calls the handle's `startAnimation` and `stopAnimation`, so hovering the control plays the icon.
- The stroke is forced to 1.75 by CSS (0045).
- Labels and `aria-hidden` stay with `use-icon-accessibility`.

## Consequences

- The animations come from someone else for the matched icons. Adding an icon is cheaper if the Huge set has it.
- It's a young package (first published 2026-04-30, 0.x). Pin the exact version; the fallback means we can drop it quickly.
- Both sets ship at once, so a review should check:
  - matching shapes;
  - one stroke weight;
  - no movement under reduced motion;
  - the change in bundle size;
  - a design-system gallery that shows each icon's source.
