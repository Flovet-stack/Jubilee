# 18: Icon size from the font size

Status: Done (97/100, 2026-11-25) · Written: 2026-11-25

## Goal

Icons inside controls read as part of the label: about 110 % of the font size instead of 150 %, with the same even spacing and the same control heights.

## Decisions

Implements [0030](../docs/decisions/0030-icon-size-from-font-size.md), which supersedes [0029](../docs/decisions/0029-type-spacing-for-every-control.md)'s icon size. Everything else in 0029 stands.

## Acceptance criteria

1. **Token.** `.jb-type` and `.jb-field` set `--icon: 1.125em` and `--icon-inset: calc((1lh - var(--icon)) / 2)`; the fallback uses `1.5em` for `1lh`.
2. **Icons.** Every icon in a control (`jb-type-icon`, `jb-field-icon`, icon-only `svg`) is `--icon` square: 18 / 15.75 / 13.5 px at 16 / 14 / 12 px text; field icons 18 px.
3. **Spacing.** Icon → edge = icon → top = icon → text = `--py + --icon-inset` in text + icon controls; icon-only boxes padded `--py + --icon-inset`.
4. **Heights unchanged.** Controls stay 40 / 35 / 30 px, 44 px on touch; icon-only buttons stay square.
5. **Field slots.** The start icon sits `--py + --icon-inset` from the edge and the input's start padding makes the same gap to the text; end controls match.
6. **Rules.** The `type-spacing` skill shows the new icon size; `sizes.test.ts` asserts `--icon: 1.125em`.

## Out of scope

Icons outside controls (error lines, text links, page headings), avatars, the calendar grid.

## Check

- `pnpm check` passes.
- Measured on `/design-system` at 1440 px and 390 px (touch).
- Reviewer run scores 90 or more.
