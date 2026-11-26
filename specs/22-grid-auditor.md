# 22: Grid Auditor overlay

Status: Done (98/100) · Written: 2026-11-26

## Goal

Flovet can check any Jubilee page against the design grid with `grid-auditor`, in local dev and on a deployed site, without normal visitors downloading it.

## Decisions

Implements [0034](../docs/decisions/0034-grid-auditor-dev-overlay.md). Builds on [0001](../docs/decisions/0001-stack-and-tooling.md) (pnpm) and [0004](../docs/decisions/0004-auth-database-and-env.md) (`src/env.ts`, `.env.example`).

## Acceptance criteria

1. `vendor/grid-auditor-0.1.0.tgz` is committed and `package.json` has `grid-auditor` as a `file:` dependency; `pnpm install --frozen-lockfile` works.
2. `src/components/grid-auditor.tsx` follows 0034: client component, renders `null`, loading rules, `?grid=1` / `?grid=0`, dynamic import only, cancel flag and `destroy()` on cleanup.
3. `<GridAuditor />` is rendered once in `src/app/[locale]/layout.tsx`, inside `<body>`.
4. `.env.example` has `NEXT_PUBLIC_GRID_AUDITOR=true` with a comment; `src/env.ts` validates it as optional `"true" | "false"`.
5. `next dev`: the page loads, Shift+G toggles the grid, Ctrl/Cmd+Shift+G opens the panel, no console errors or hydration warnings.
6. `next build && next start` with the flag on: no grid-auditor request without `?grid=1`; with `?grid=1` the overlay works.

## Out of scope

Overlay options or custom breakpoints, a toggle in the UI, the root `global-not-found.tsx` (its own `<html>`), setting the env var on the host (Flovet's call).

## Edge cases

- The effect is cleaned up before the import resolves (fast navigation, React strict mode): no overlay is left behind.
- `localStorage` unavailable (private mode, blocked storage): treat as off, no error.
- Locale change remounts the layout: the overlay is destroyed and created again, not duplicated.

## Files and patterns to follow

- `src/components/grid-auditor.tsx` (new), `src/app/[locale]/layout.tsx`, `src/env.ts`, `.env.example`, `vendor/` (new).

## Boundaries

- Always: no user-facing strings (the component renders nothing).
- Ask first: options for the overlay, any other dependency.
- Never: a static import of `grid-auditor`; global CSS for it.

## Check

- `pnpm check` passes.
- Dev and production checks from criteria 5 and 6, with network and console output.
- Reviewer skill score of 90 or more, recorded above. One entry in `docs/log.md`.
