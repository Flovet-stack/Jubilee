# 02: Design system foundations

Status: Done (96/100, 2026-11-21) · Written: 2026-11-21

## Goal

Give every screen the same tokens, icons, motion and components, so feature specs compose pages instead of styling controls one by one.

## Decisions

Implements [0005](../docs/decisions/0005-visual-foundations.md), [0006](../docs/decisions/0006-interaction-disclosure-and-space.md), [0007](../docs/decisions/0007-design-system-components-icons-motion.md).

## Acceptance criteria

1. `src/app/globals.css` holds every 0005 token for light and dark, plus 0007's component and motion tokens, exposed through Tailwind 4 `@theme`.
2. Plus Jakarta Sans loads through `next/font` (latin + latin-ext) as `--font-jakarta`.
3. `src/components/icons/` holds the vendored animated icons, their licence files and the shared accessibility hook; icons play on hover or keyboard focus of their control and never under reduced motion.
4. `src/components/ui/` holds every component in 0007's table, each with the states 0007 lists, styled only with tokens.
5. A unit test checks the WCAG contrast pairs 0005 promises, in both themes, by reading `globals.css`.
6. `/design-system` shows every component and state in light and dark, and returns 404 in production.
7. `docs/design/design-system.md` documents tokens, components, states, motion and how to add an icon.

## Out of scope

next-intl, the app shell and navigation, data table, date picker, combobox, feature screens.

## Edge cases

- French labels about 30% longer: buttons wrap to two lines rather than clip; badges truncate with a full `title`.
- A loading button keeps its width and blocks a second submit.
- An icon-only button without an `aria-label` fails the type check.
- Disabled controls that need an explanation stay focusable (`focusableWhenDisabled`) so a tooltip or hint can be read.
- A select with no options shows its empty text.
- Many toasts at once: three visible, the rest queued.

## Files and patterns to follow

- AniKansou `src/components/ui/button.tsx`, `use-control-hover.ts` for Base UI + cva patterns.
- Base UI docs in `node_modules/@base-ui/react/docs/react/`.

## Boundaries

- Always: tokens only; Server Components unless the component needs state or Base UI.
- Ask first: any further dependency.
- Never: hard-coded user-facing copy inside a component; `transition: all`.

## Check

- `pnpm check` passes.
- Screenshots of `/design-system` at 390 px and 1440 px, light and dark.
- Reviewer skill run against this spec; score of 90 or more.
