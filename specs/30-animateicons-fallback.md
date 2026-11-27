# 30: AnimateIcons as the icon source, with our icons as fallback

Status: Built, in review (reviewer 84/100 before its must-fixes; touch fix and handle types applied; animation and 390/1440 screenshots not captured, browser pane hidden) · Written: 2026-11-27

## Goal

Every icon on the platform comes from AnimateIcons' Huge set where it has an equivalent. Where it doesn't, we keep our own icon. Code keeps importing from `@/components/icons` with the same names, so the hover behaviour, sizes and stroke stay the same.

## Decisions

Implements [0051](../docs/decisions/0051-animateicons-with-our-icons-as-fallback.md). Builds on [0009](../docs/decisions/0009-design-system-components-icons-motion.md) (animated icons), [0030](../docs/decisions/0030-icon-size-from-font-size.md) and [0045](../docs/decisions/0045-larger-icons-in-icon-buttons-and-heavier-stroke.md) (size and stroke).

## Acceptance criteria

1. `@animateicons/react` is pinned at exactly 0.13.0. Icons are imported one file per icon, from the Huge set only.
2. Every exported `Hugeicons*Icon` whose meaning has a Huge equivalent wraps that icon, and its vendored file is deleted. The old export name and props stay the same (`size`, span attributes, and a ref with `startAnimation`/`stopAnimation`).
3. In-house glyphs outside `components/icons` move to Huge icons where an equivalent exists:
   - the account menu: moon, language, log out, chevrons and check;
   - the sidebar panel icon;
   - the info mark in feedback;
   - the stage badges.
4. These are kept as the fallback, and listed in `icon-sources.ts`:
   - our own icons with no equivalent: grip, the continuously spinning loader, and the unfold chevrons;
   - component state drawings: the checkbox tick.
5. `icon-sources.ts` records the source for every export, and a unit test fails if an export isn't listed.
6. When the surrounding button or link is hovered or focused from the keyboard, the icon plays (`use-control-hover`). An icon outside a control plays on its own hover. Touch doesn't start it. Reduced motion means no movement.
7. Each AnimateIcons icon renders inside a span marked `data-icon-source="animate"`, and CSS forces stroke-width 1.75 (0045).
8. The design-system icon gallery shows each icon's source.
9. The package's MIT notice is added to `THIRD_PARTY_NOTICES.md`.

## Out of scope

New icons; using the Lucide set; changing icon sizes; the brand logo.

## Edge cases

- An icon with no surrounding control.
- An icon driven by a ref (password eye toggle).
- Reduced motion.
- Server components importing the icons: the wrapper is a client component.
- Dark and light themes.

## Files

- `src/components/icons/`: `animate.tsx` (the factory), `icon-sources.ts`, `index.ts`.
- `src/features/shell/components/menu-icons.tsx` and `sidebar-panel-icon.tsx`.
- `src/components/ui/feedback.tsx` and `badge.tsx`.
- `src/components/ui/components.css`.
- The design-system gallery.

## Check

- `pnpm check` passes.
- The design-system page and the sidebar render at 390 and 1440 px.
- Hovering a button plays its icon.
- Reviewer score of 90 or more.
