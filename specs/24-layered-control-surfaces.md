# 24: Layered control surfaces, and the Geist and radius trial

Status: Not started · Written: 2026-11-26

## Goal

Give buttons, icon buttons, fields and sidebar rows a crafted, raised (or recessed) surface built from layered shadows instead of flat fills and borders, so the next action reads at a glance in both themes; and let Flovet compare Geist and pill corners on the design-system page before deciding on them.

## User lens

The full lens is in [0036](../docs/decisions/0036-layered-control-surfaces-and-geist-trial.md#user-lens). In short: every action Amina takes passes through these controls; raised controls make the next press obvious without more colour; we leave out the reference's pills, blue, 12 px text and any size change.

## Decisions

Implements [0036](../docs/decisions/0036-layered-control-surfaces-and-geist-trial.md). Builds on [0007](../docs/decisions/0007-visual-foundations.md) (one violet action), [0022](../docs/decisions/0022-corner-radius-by-size.md) (radius), [0029](../docs/decisions/0029-type-spacing-for-every-control.md), [0030](../docs/decisions/0030-icon-size-from-font-size.md), [0033](../docs/decisions/0033-type-scale-from-14px.md) (sizes and type), [0027](../docs/decisions/0027-app-shell-and-sidebar.md) and [0035](../docs/decisions/0035-sidebar-header-and-account-menu.md) (sidebar).

## Acceptance criteria

1. Tokens in `globals.css`, light and dark (both dark blocks): `--control`, `--control-hover`, `--control-active`, `--field-well`, `--shadow-raised`, `--shadow-primary`, `--shadow-recessed`, with the values in 0036.
2. Primary button: violet fill, the five-layer shadow (drop, darker-violet outer ring, top glow, inner ring, bottom shade). No CSS border.
3. Secondary button and icon buttons (secondary and quiet-on-hover): `--control` fill and `--shadow-raised`; hover `--control-hover`. No CSS border.
4. Pressed: fill one step darker, top glow removed; reduced motion: no scale.
5. Fields (input, textarea, select trigger, phone, date, password): `--field-well` fill and `--shadow-recessed`; hover and focus keep the current violet focus ring; invalid keeps the danger ring; disabled and read-only stay distinguishable.
6. Sidebar rows: inactive no fill, muted text; active `--control-active` fill with `--shadow-raised`, ink text; the account trigger matches.
7. `@media (forced-colors: active)` restores a 1 px `ButtonBorder` on these controls.
8. Sizes, padding, icon sizes and type are unchanged (existing size tests pass).
9. Design-system page: two switches, Font (Plus Jakarta Sans / Geist) and Radius (Ours / Pill), scoped by a `data-` attribute on the page wrapper; nothing else in the app changes and nothing is saved.
10. Geist loads with `next/font/google` and is used only inside that page's trial scope.
11. Contrast: text 4.5:1 and focus ring 3:1 on every new fill in both themes (token tests).

## Out of scope

Changing the product font or radius, other components (cards, menus, tabs, badges, checkboxes), any layout or size change.

## Edge cases

Light mode (derived values, judged by eye); disabled primary; loading buttons; a field inside a well; collapsed sidebar rail; Windows high contrast; long French labels.

## Files and patterns to follow

- `src/app/globals.css` (tokens), `src/components/ui/components.css` (shared surfaces, forced-colors).
- `src/components/ui/button.tsx`, `field.tsx`, `select.tsx`, `phone-field.tsx`, `date-field.tsx`, `password-field.tsx`.
- `src/features/shell/components/shell.tsx` (`rowClasses`, account trigger).
- `src/lib/fonts.ts`, `src/app/[locale]/design-system/` (trial switches).
- `src/lib/tokens.test.ts` (new contrast pairs).

## Boundaries

- Always: type-spacing skill; tokens only; both themes.
- Ask first: a new package; changing the product font or radius.
- Never: copying the reference's brand (blue, logo, name, icons); `any`; push to `main`.

## Check

- `pnpm check` passes.
- Screenshots of the design-system controls and the sidebar at 390 and 1440 px, light and dark, with each trial switch both ways.
- Reviewer skill at 90 or more.
