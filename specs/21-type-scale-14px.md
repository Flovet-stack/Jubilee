# 21: 14 px base and type sizes by role

Status: Built, in review (reviewer 84/100; its four role fixes applied, not re-graded; CV paper and editor screenshots not taken) · Written: 2026-11-26

## Goal

Make every screen denser and its hierarchy obvious: 14 px body text, and every other size set by the item's role, the same on every page.

## User lens

The full lens is in [0033](../docs/decisions/0033-type-scale-from-14px.md#user-lens). In short: Amina scans lists and boards on a small laptop and wants more on screen; one size per role tells her eye where to go; phones never zoom when she taps a field.

## Decisions

Implements [0033](../docs/decisions/0033-type-scale-from-14px.md). Builds on [0029](../docs/decisions/0029-type-spacing-for-every-control.md) and [0030](../docs/decisions/0030-icon-size-from-font-size.md) (control spacing from font size), [0025](../docs/decisions/0025-first-cv-template-and-typography.md) (CV paper type, unchanged).

## Acceptance criteria

1. Tokens in `src/app/globals.css` match 0033's table: `text-xs` 12, `text-sm` 13, `text-base` 14, new `text-md` 16, `text-lg` 18, `text-2xl` 24, `text-3xl` 32, with the line heights listed. `text-xl` and `text-4xl` are removed.
2. `html` uses the 14 px base.
3. Fields (input, textarea, select, phone, date, password, search) are 14 px with a fine pointer and 16 px with a coarse pointer.
4. Every text size in `src/` maps to a role from 0033: app page titles 24, section titles 18, subsection 16, body 14, reading 16/1.6, secondary 13, caption 12. No `text-xl`, `text-4xl` or arbitrary `text-[…]` sizes remain outside the CV paper.
5. Long reading text (legal pages, help copy, job descriptions when they exist) uses the Reading role.
6. The CV paper and its preview look exactly as before.
7. Controls still meet the 0029 rules; touch targets stay at least 44 px.
8. The design-system page shows the type scale with each role's name, size and use.
9. Token contrast tests still pass; 12 and 13 px muted text meets 4.5:1.

## Out of scope

Fluid type, a user font-size setting, new fonts or weights, email templates, layout changes beyond what the smaller text causes.

## Edge cases

French text about 30% longer at the new sizes; 200% browser zoom (sizes stay in `rem`); a tablet with a fine pointer; the sidebar collapsed and expanded; empty and long lists.

## Files and patterns to follow

- `src/app/globals.css` (`@theme` type scale, base `html` styles).
- `src/components/ui/field.tsx` and the other field components (`controlClasses`, `fieldSpacing`).
- `src/components/ui/components.css` (the `jb-type` classes from 0029).
- Every page and component using `text-*` sizes: map by role, not by number.
- `src/app/[locale]/design-system/` for the scale demo.

## Boundaries

- Always: type-spacing skill for every control; tokens only.
- Ask first: any change to the CV paper's type or a new font.
- Never: `px` font sizes, disabling browser zoom, hard-coded copy.

## Check

- `pnpm check` passes.
- Screenshots of Home, Resumes, the CV editor, sign-in, a legal page and the design-system page at 390 and 1440 px, light and dark.
- On a touch viewport, a focused field reports a 16 px computed font size.
- Reviewer skill at 90 or more.
