# 16: Button spacing from the type

Status: Done (94/100, 2026-11-25) · Written: 2026-11-25

## Goal

Make buttons shorter on mouse screens and space their text and icons by one rule, so a label, a label with an icon, and an icon on its own all sit evenly inside the button.

## Decisions

Implements [0028](../docs/decisions/0028-button-spacing-from-type.md). Keeps the touch floor and size rules of [0020](../docs/decisions/0020-control-sizes-and-density.md), the radius of [0022](../docs/decisions/0022-corner-radius-by-size.md), and the naming rule of [0008](../docs/decisions/0008-interaction-disclosure-and-space.md).

## Acceptance criteria

1. **Tokens.** `globals.css` holds 0028's mouse heights (40 / 32 / 24 px); the `pointer: coarse` block sets all three to 44 px. The unit test in `src/lib/sizes.test.ts` asserts the new values.
2. **Spacing rule.** `Button`, `IconButton` and `ButtonLink` set `--py` per size and use 0028's `--px`, padding, gap and icon margin. No hard-coded `px-*`, `py-*` or `gap-*` stays on the button.
3. **Type per size.** Text size, line box and icon size per 0028's table. Icons passed as `icon` / `iconEnd` are sized to `1lh` by the button, not by the caller.
4. **Icon-only.** `IconButton` uses `padding: var(--py)` and is square at every size; it keeps its required label and tooltip.
5. **Touch.** Under `pointer: coarse` every button is at least 44 px tall (and wide, if icon-only); horizontal spacing is unchanged.
6. **Fallback.** Under `@supports not (height: 1cap)`, `--px` falls back to a fixed value per size; the layout still holds.
7. **Fields follow.** Inputs and selects use the same height tokens, so they match the button at each size; input text stays 16 px.
8. **`/design-system`** shows, at each size: text only, icon + text, text + icon, icon only.

## Out of scope

New variants, colours or states. Changing which screens use which size. The toast's own action button (not a `Button`).

## Edge cases

- **Loading:** the spinner replaces the content without changing the width.
- **Wrapping label:** a long label wraps and the button grows; the icon stays centred on the block.
- **Mixed content:** both `icon` and `iconEnd` at once keep equal spacing.

## Files and patterns to follow

- `src/components/ui/button.tsx`: the `cva` sizes.
- `src/app/globals.css`: section 3 tokens and the touch block.
- `src/components/ui/field.tsx`: `controlHeight` (unchanged API).

## Boundaries

- Always: tokens and the formula; sizes from the `size` prop.
- Never: a button under 44 px on touch; per-call-site padding overrides.

## Check

- `pnpm check` passes.
- Screenshots of `/design-system` buttons at 390 px (touch) and 1440 px.
- Reviewer run scores 90 or more.
