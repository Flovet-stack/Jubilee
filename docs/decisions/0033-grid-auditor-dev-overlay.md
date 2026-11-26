# 0033: Grid Auditor overlay, always in dev, opt-in in production

- **Status:** Approved
- **Proposed:** 2026-11-26 by Flovet (brief in chat)
- **Approved:** 2026-11-26 by Flovet (in chat)
- **Specs:** specs/21-grid-auditor.md

## Context

Flovet wants to check Jubilee's layout against the Figma grid with `grid-auditor` 0.1.0, a dev overlay Flovet wrote. It isn't on npm yet. It has to work in local dev and on the deployed site, but normal visitors must never download it. 0001 doesn't name it, so it needs its own decision (CLAUDE.md: a dependency not in an approved decision).

## Research

| Reference                                            | What they do                                                                                                              | Adopt / adapt / reject | Why                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| `grid-auditor` 0.1.0 README and `dist/index.d.ts`    | Load with a dynamic import so the bundler drops it from builds; `createGridOverlay()` returns an overlay with `destroy()` | Adopt                  | The library's own usage; a dynamic import becomes its own chunk |
| `grid-auditor` 0.1.0 `package.json`                  | ESM only, no dependencies, no install scripts, `sideEffects: false`                                                       | Adopt                  | Safe to install from a tarball; nothing runs on install         |
| `grid-auditor` 0.1.0 `dist/index.js` (read)          | Draws in its own shadow root; no `fetch`, XHR, beacon, WebSocket or `eval`                                                | Adopt                  | Sends nothing anywhere; no global CSS needed                    |
| pnpm docs, `file:` dependencies (`pnpm add ./x.tgz`) | A local tarball becomes a `file:` dependency, pinned by its integrity in the lockfile                                     | Adopt                  | CI and the host install it from the repo with a frozen lockfile |

Sources (links actually opened):

- `C:\tmp\grid-auditor-0.1.0.tgz` (`package/README.md`, `package/package.json`, `package/dist/index.d.ts`, `package/dist/index.js`)
- `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`

## Options

1. **Vendored tarball, client component, dynamic import behind a dev check or an env flag plus a URL/localStorage switch.** Works everywhere, zero bytes for visitors. Cons: a 41 KB tarball in git.
2. **Dev only.** Simplest. Cons: can't check the grid on a deployed page, which is what Flovet asked for.
3. **Wait for npm.** Cons: blocks the work.

## Decision

Option 1, as Flovet's brief says.

- **Install:** `vendor/grid-auditor-0.1.0.tgz`, committed, added with `pnpm add ./vendor/grid-auditor-0.1.0.tgz` (a `file:` dependency).
- **Release-age policy:** `pnpm-workspace.yaml` lists `grid-auditor` under `minimumReleaseAgeExclude`. pnpm 11 looks every lockfile entry up on npm, and a package that isn't there fails the frozen install. Only this one name is excluded.
- **Component:** `src/components/grid-auditor.tsx`, a client component that renders `null`, rendered once inside `<body>` in `src/app/[locale]/layout.tsx`.
- **When it loads:** always when `NODE_ENV` is `development`. In production only when `NEXT_PUBLIC_GRID_AUDITOR` is `true` **and** the URL has `?grid=1` or `localStorage["grid-auditor"]` is `1`. `?grid=1` saves the switch to localStorage; `?grid=0` removes it.
- **Loading:** only `import("grid-auditor")` inside `useEffect`, never a static import. The effect cancels if it is cleaned up before the import resolves, and destroys the overlay on cleanup.
- **Options:** none. The defaults (Mobile 4 at 0, Tablet 8 at 768, Desktop 12 at 1200) are tuned in the panel.
- **Env:** `NEXT_PUBLIC_GRID_AUDITOR` is optional, validated in `src/env.ts` as `"true" | "false"`. The client component reads `process.env.NEXT_PUBLIC_GRID_AUDITOR` directly (Next inlines it), an exception to "read env through `src/env.ts`": importing `env` would pull zod and t3-env into every page's client bundle for one flag.

## Consequences

- Visitors on production never fetch the chunk unless the flag is on **and** they opt in with `?grid=1`. With the flag off, the chunk still exists in the build but nothing requests it.
- Anyone who knows `?grid=1` can turn it on where the flag is set. It only draws an overlay, so the team accepts that; set the flag on preview deployments only to avoid it.
- When `grid-auditor` reaches npm, replace the tarball with a version range in a new decision.
- Review checks: no static import of `grid-auditor` anywhere; no grid-auditor request on a production page without `?grid=1`.
