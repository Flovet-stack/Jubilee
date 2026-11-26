# 23: Sidebar header and the flush account menu

Status: Built, in review (reviewer 88/100 before the height animation was added; not re-graded after; dark 390 px screenshots not taken) · Written: 2026-11-26

## Goal

Make the sidebar's top and bottom quieter and clearer: the logo in proportion and reopening the collapsed rail, and an account menu that stays inside the sidebar, touches its own edges, and lets Amina pick her language by name.

## User lens

The full lens is in [0035](../docs/decisions/0035-sidebar-header-and-account-menu.md#user-lens). In short: she opens the account menu for dark mode, her language or to sign out, in a few seconds; she clicks the logo to get the collapsed sidebar back; we leave out the version/Terms footer, flags, language codes and the rail's extra toggle.

## Decisions

Implements [0035](../docs/decisions/0035-sidebar-header-and-account-menu.md). Builds on [0027](../docs/decisions/0027-app-shell-and-sidebar.md) (shell), [0029](../docs/decisions/0029-type-spacing-for-every-control.md), [0030](../docs/decisions/0030-icon-size-from-font-size.md) and [0033](../docs/decisions/0033-type-scale-from-14px.md) (type and spacing), [0017](../docs/decisions/0017-regional-locales-and-cv-naming.md) (locale switching keeps the path).

## Acceptance criteria

1. The account button shows an up/down chevron at its right, muted, sized by 0030. Not shown in the collapsed rail.
2. Collapsed rail: no separate collapse toggle; the logo mark is a button named "Expand sidebar" (all locales) with a tooltip and `aria-expanded="false"`, and it expands the sidebar. `Ctrl/⌘+B` still toggles.
3. Expanded: the logo links Home; the collapse toggle stays. The mark is 20 px, the full logo 18 px tall.
4. New `--menu` token: light #ffffff, dark #1f1f1f. The account menu uses it, with a `--line` border, `--radius-card`, no padding, and clips its children to its radius.
5. Rows and dividers run edge to edge; row padding comes from the type-spacing classes.
6. The menu is never wider than the expanded sidebar's content width; from the collapsed rail it opens to the side at that same width.
7. Order: header (avatar, name, plan badge) · divider · Dark mode (switch track 20 × 34, thumb 14) · divider · Settings · Language (current language name, muted, and a right chevron) · divider · Sign out. No version or Terms footer.
8. Language opens a panel in the same menu: a "Back" row titled with "Language" at top, a divider, then one row per locale with its full name from `localePicker.names`, and a check on the current one.
9. Keyboard: Enter or → on Language opens the panel and focuses its back row; ← or Escape returns, focusing Language; a second Escape closes the menu. Arrow keys move through rows.
10. Picking a language keeps the current path and closes the menu.
11. The switch to the panel animates height and content; reduced motion shows no movement.
12. All copy in the three message files; the old three-way language switch and its labels (`localeShort`) are removed if unused.

## Out of scope

Notifications popover, the collapsed CV popover, Settings page content, new languages, language search.

## Edge cases

Long names (French plan label, a long user name) truncate with the full text in a tooltip or title; no name (icon avatar); the menu opened from the phone sheet at 360 px; switching language while on a CV page; light and dark.

## Files and patterns to follow

- `src/features/shell/components/shell.tsx` (`SidebarContents` header, `AccountMenu`, `LocaleSwitch`).
- `src/components/ui/switch.tsx` (add a size from the type, keep the current size as default elsewhere).
- `src/components/icons/` (add the up/down chevron like the existing Hugeicons wrappers).
- `src/app/globals.css` (`--menu` token), `src/lib/tokens.test.ts` (contrast pairs for `--menu`).
- `src/app/[locale]/design-system/shell-demo.tsx` (menu states).

## Boundaries

- Always: type-spacing skill for every control; tokens only; keyboard and screen reader paths.
- Ask first: a new dependency.
- Never: hard-coded copy, `any`, push to `main`.

## Check

- `pnpm check` passes.
- Screenshots of the expanded and collapsed sidebar, the menu, and the language panel at 390 and 1440 px, light and dark.
- Keyboard walk-through: open menu, open Language, back, close.
- Reviewer skill at 90 or more.
