# 32: Logo components generated from the brand files

Status: Done (reviewer 91/100; dark-mode and 390/1440 screenshots not taken) · Written: 2026-11-28

## Goal

The files in `docs/design/brand/logo/` are the real logos. Today the app draws its own copies, which went stale when Flovet updated the files. Generate the app's logo, icon and favicon from those files, so one command keeps them in step, and a test fails if they drift apart.

## Decisions

Builds on [0010](../docs/decisions/0010-logo-and-brand-identity.md) (the logo) and [0019](../docs/decisions/0019-logo-icon-staircase.md) (the icon). No new decision: this changes where the shapes come from, not what they are.

## Acceptance criteria

1. `pnpm brand` runs `scripts/brand.mjs`, which writes:
   - `src/components/brand/jubilee-logo.tsx` from the 5 logo files, which share the same paths;
   - `src/components/brand/jubilee-icon.tsx` from the 2 icon files;
   - `src/app/icon.svg` from `jubilee-favicon.svg`.
2. Each component has a `tone` prop. The default, `auto`, uses the theme:
   - violet becomes `var(--violet)`;
   - marigold becomes `var(--marigold)`;
   - the wordmark becomes `currentColor`.

   The other tones reproduce one brand file exactly: `onDark`, `onViolet`, `monoInk` and `monoWhite` for the logo, `onDark` for the icon.

3. Width comes from the file's viewBox, so the new logo's proportions are right. The props (`height`, `className`) and `aria-hidden` stay the same.
4. A unit test runs the generator in memory and fails if a generated file differs from the one on disk.
5. The sidebar and sign-in page show the new logo with no change at their call sites.

## Out of scope

No logo redesign. `favicon.ico` and `apple-icon.png` are re-rendered by the existing `scripts/render-brand-icons.mjs`, which `pnpm brand` also runs.

## Check

- `pnpm check` passes.
- The sidebar and sign-in page show the new logo in light and dark mode.
- Reviewer score of 90 or more.
