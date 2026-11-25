# 17: Type spacing in every control

Status: Done (96/100, 2026-11-25) · Written: 2026-11-25

## Goal

Every control that holds text or icons is spaced by the same type-based rule, exactly as in Flovet's notes, and each size is set by its font size.

## Decisions

Implements [0029](../docs/decisions/0029-type-spacing-for-every-control.md), which supersedes part of [0028](../docs/decisions/0028-button-spacing-from-type.md). Keeps [0020](../docs/decisions/0020-control-sizes-and-density.md)'s touch floor and [0022](../docs/decisions/0022-corner-radius-by-size.md)'s radius. The rule is in `.claude/skills/type-spacing/SKILL.md`.

## Acceptance criteria

1. **Shared classes.** `components.css` holds `jb-type`, `jb-type-icon`, `jb-type-square`, and the field classes (`jb-field`, `jb-field-box`, `jb-field-icon`), plus the fallback. `jb-button` uses the same variables with `--py: 0.5em` and `line-height: 1.5` at every size.
2. **Sizes.** Tokens are 40 / 35 / 30 px on mouse and 44 px on touch; buttons are 16 / 14 / 12 px text. `sizes.test.ts` asserts them.
3. **Fields.** `Input` (with start icon and end slot), `Textarea` and the `Select` trigger use the field classes: 16 px text, the height of their size, `--px` from the formula, icons `1lh`.
4. **Rows.** `Select` options, `Menu` items and `Tabs` use `jb-type` with their 44 px minimum kept; sidebar items use `jb-type` (40 px, 44 on touch). Their icons are `1lh`.
5. **Small parts.** `Badge` (`--py: 0.15em`), `Tooltip`, the toast action (`jb-type`) and toast close (`jb-type-square`).
6. **No hand-picked padding or gap** remains on these controls.
7. **Rules.** The `type-spacing` skill exists; CLAUDE.md and the reviewer skill point to it.

## Out of scope

Layout containers (cards, wells, dialogs, sheets, toasts' body), the calendar grid, the logo row, and the phone/date field internals beyond their triggers.

## Edge cases

- Touch: no control under 44 px; padding unchanged, content centred.
- Fallback: same heights without `lh`/`cap`.
- Long labels wrap; icons stay centred.

## Check

- `pnpm check` passes.
- Measured on `/design-system` at 1440 px and 390 px (touch): heights, icon → edge = `--py`, squares.
- Reviewer run scores 90 or more.
