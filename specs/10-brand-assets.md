# 10: Brand assets in the app

Status: Done (97/100) · Written: 2026-11-22

## Goal

Every place the app shows Jubilee's mark uses the approved logo: the icon on the sign-in page, the browser-tab favicon and the home-screen icon. Today the sign-in page draws 0010's old icon and the favicon is Next.js's default.

## Decisions

Implements [0019](../docs/decisions/0019-logo-icon-staircase.md) and [0010](../docs/decisions/0010-logo-and-brand-identity.md) (files and rules in [the brand guidelines](../docs/design/brand-guidelines.md)). Builds on [0007](../docs/decisions/0007-visual-foundations.md).

## Acceptance criteria

1. `JubileeIcon` (`src/components/brand/jubilee-icon.tsx`) draws the 0019 staircase from `docs/design/brand/logo/jubilee-icon.svg`: same grid, radii and opacity steps, violet and marigold from the theme tokens so dark mode matches `jubilee-icon-on-dark.svg`. Square, decorative (`aria-hidden`). The sign-in page shows it at 40 px.
2. The browser tab shows the Jubilee favicon, not Next.js's: `src/app/icon.svg` is `jubilee-favicon.svg`, and `src/app/favicon.ico` (16, 32 and 48 px) is rendered from it.
3. `src/app/apple-icon.png` (180 px) is rendered from `jubilee-app-icon-square.svg`; iOS rounds the corners.
4. No other copy of the old icon (five growing dots) remains in `src/` or `public/`.
5. The PNG and ICO files are generated from the SVGs in `docs/design/brand/logo/`, not drawn by hand; the build notes record how.

## Out of scope

A full logo (icon + name) component, the app shell header, web app manifest, social and Open Graph images, email templates.

## Build notes

- `favicon.ico`, `icon.svg` and `apple-icon.png` come from `node scripts/render-brand-icons.mjs .`, which uses the `sharp` that ships with Next.js (no new dependency). The ICO holds 16, 32 and 48 px PNGs.

## Check

- `pnpm check` passes.
- The rendered `<head>` links the new icons; screenshots of sign-in at 390 px and 1440 px, light and dark.
- Reviewer skill score of 90 or more, recorded above. One entry in `docs/log.md`.
