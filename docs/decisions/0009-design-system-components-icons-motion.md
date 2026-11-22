# 0009: Design system: tokens, components, animated icons and motion

- **Status:** Approved; its control heights are superseded by [0020](0020-control-sizes-and-density.md)
- **Proposed:** 2026-11-21 by the product team (roles: UI, UX, Frontend, Tech Lead)
- **Approved:** 2026-11-21 by Flovet (in chat, after the design system was built and reviewed)
- **Supersedes:** the _Iconography_ paragraph of 0007 ("drawn in-house … an icon library would need its own approval"). The rest of 0007 and all of 0008 stand.
- **Specs:** specs/03-design-system.md

## Context

0007 and 0008 set the look and the interaction rules. Every screen now needs the same reusable pieces: tokens in code, accessible components with all their variants and states, icons, and one way to animate. Flovet asked (2026-11-21, in chat) for the basic tokens and components a design system has, for icons from the same animated library as AniKansou, and for smooth motion that follows Emil Kowalski's work. In the same conversation Flovet approved the dependencies: `motion@13.1.1`, `@base-ui/react`, `class-variance-authority`, `clsx` and `tailwind-merge`.

## Research

| Reference                                                       | What they do                                                                                                                                                                                           | Adopt / adapt / reject | Why                                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| W3C Design Tokens format (DTCG draft)                           | Token types: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, plus composites (border, shadow, transition, typography)                                                         | Adapt                  | Our token groups use the same types; CSS variables are the source of truth until a second platform exists |
| Carbon themes                                                   | Palette values feed role tokens ("$interactive" uses "$blue-60"); roles never change across themes                                                                                                     | Adopt                  | Our three tiers: values → roles (`--ink`, `--violet`) → component tokens (`--control-h`, `--focus-ring`)  |
| component.gallery                                               | Most common components across systems: badge, button, alert, accordion, radio, checkbox, modal, select, tabs, card, tooltip, table, text input, spinner, link, toggle, textarea, popover, menu, toast… | Adopt                  | The inventory below covers the top 20 that the MVP needs                                                  |
| Atlassian components                                            | Adds skeleton, empty state, inline message, lozenge (status pill), progress bar, avatar                                                                                                                | Adopt                  | Same needs: tracker stages, empty tracker, match bar                                                      |
| WAI-ARIA APG patterns                                           | Keyboard and ARIA contracts for button, checkbox, radio group, switch, listbox/select, menu button, dialog, tabs, tooltip, alert                                                                       | Adopt                  | Behaviour comes from Base UI, which implements these                                                      |
| Carbon text input and toggle                                    | States: enabled, hover, active, focus, error, warning, disabled, skeleton, read-only. Disabled isn't focusable; read-only is                                                                           | Adopt                  | Our state list for every control                                                                          |
| Base UI 1.9 (docs shipped in the package)                       | Unstyled, accessible parts; `data-starting-style` / `data-ending-style` for CSS transitions; `--transform-origin`; `--active-tab-*`; toast manager with limit and timeout                              | Adopt                  | Same base as AniKansou; we style it fully with our tokens (no default look)                               |
| icons-animated, Hugeicons set (AniKansou 0003)                  | MIT; one file per icon, Motion-driven, plays on hover; ships an accessibility helper per file                                                                                                          | Adopt, vendored        | Flovet's request; same set as AniKansou; rounded strokes match Plus Jakarta Sans                          |
| Emil Kowalski, "7 practical animation tips"                     | Press scales to 0.97; never animate from scale 0 (start ≥ 0.9); tooltips 125 ms ease-out, origin-aware; neighbours open instantly; keep UI animation under 300 ms; remove hover motion seen 100× a day | Adopt                  | Matches 0008 (press 0.98, ≤ 320 ms); adds the origin and instant-neighbour rules                          |
| Emil Kowalski, "Great animations" / "You don't need animations" | Animate only transform and opacity; CSS transitions are interruptible, keyframes are not; never animate keyboard-initiated actions; reduced motion falls back to a fade                                | Adopt                  | Becomes our motion rules 1–5                                                                              |
| Emil Kowalski, "Building a toast component" (Sonner)            | Enter and exit from the same side; 4 s auto-dismiss, paused on hover and when the tab is hidden; stack with 14 px offset and scale −0.05 per toast; swipe to dismiss                                   | Adopt                  | Base UI Toast gives the mechanics; we set the numbers                                                     |
| Emil Kowalski, "Building a drawer component" (Vaul)             | iOS sheet curve `cubic-bezier(0.32, 0.72, 0, 1)`, 500 ms                                                                                                                                               | Adapt                  | Curve adopted; duration capped at 0008's 320 ms ceiling                                                   |

Sources (opened): https://www.designtokens.org/tr/drafts/format/, https://carbondesignsystem.com/elements/themes/overview/, https://component.gallery/components/, https://atlassian.design/components, https://www.w3.org/WAI/ARIA/apg/patterns/, https://carbondesignsystem.com/building-blocks/core/components/text-input, https://carbondesignsystem.com/building-blocks/core/components/toggle, https://emilkowal.ski/ui/7-practical-animation-tips, https://emilkowal.ski/ui/great-animations, https://emilkowal.ski/ui/you-dont-need-animations, https://emilkowal.ski/ui/building-a-toast-component, https://emilkowal.ski/ui/building-a-drawer-component, https://github.com/ln-dev7/icons-animated (LICENSE, THIRD_PARTY_NOTICES.md, registry files at https://icons.lndev.me/r/hugeicons-<name>.json), `node_modules/@base-ui/react/docs/react/` (handbook/animation.md and each component page). AniKansou `docs/decisions/0003-icon-set.md`, `src/components/ui/use-control-hover.ts`.

## Options

1. **Base UI behaviour + our own styling + vendored animated icons + CSS-transition motion** (as AniKansou). Pros: accessible behaviour we don't write ourselves; one set of icons across Flovet's products; motion is interruptible and cheap. Cons: three new dependencies.
2. **Hand-built primitives on native elements only.** Pros: no dependencies. Cons: focus traps, typeahead, positioning and toast stacking written and tested by us; most likely to fail accessibility.
3. **A styled kit (shadcn defaults).** Rejected: the template look the no-ai-slop skill forbids.

## Decision

Option 1.

### Tokens

- CSS custom properties in `src/app/globals.css` are the single source; Tailwind 4 `@theme` exposes them as utilities (`bg-well`, `text-ink-muted`, `rounded-box`, `shadow-float`, `ease-enter`).
- Three tiers: **values** (0007's hex, px, ms), **roles** (`--page`, `--ink`, `--violet`, `--stage-*`), **component tokens** (`--control-h` 48 px, `--control-h-sm` 44 px, `--icon-ui` 20 px, `--focus-ring`, `--press-scale`, `--pop-scale`).
- Groups: colour, typography, spacing, radius, elevation, layout, motion, z-order (overlays only through Base UI portals).

### Components (first set)

| Group      | Components                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Actions    | Button (primary, secondary, quiet, danger; md, sm; icon-only), TextLink                        |
| Forms      | Field (label, hint, error), Input, Textarea, Checkbox, RadioGroup, Switch, Select              |
| Containers | Well, Card (static, clickable), NextStep panel                                                 |
| Status     | Badge, StageBadge, Alert (info, success, warning, danger), Spinner, Skeleton, Progress, Avatar |
| Overlays   | Dialog, Sheet, Menu, Tooltip, Toast                                                            |
| Navigation | Tabs                                                                                           |
| Jubilee    | EmptyState, UndoLine, MarkedChange (0008 §1b AI changes), ReviewPanel (0008 final actions)     |

Every interactive component documents and styles: **default, hover (fine pointers only), focus-visible, pressed, disabled, and where they apply loading, invalid, read-only, selected/checked, indeterminate, open**. Every component handles: long and French text (wraps, never clips a label), empty data, 200% zoom, 360 px width, keyboard only, and reduced motion.

### Icons

- **icons-animated, Hugeicons set**, vendored into `src/components/icons/` with its `LICENSE` and `THIRD_PARTY_NOTICES.md`. Started with 34 icons; more are added the same way when a spec needs them.
- Vendoring edits (as AniKansou): one shared `use-icon-accessibility.ts` instead of a copy in each file; the icon plays when its **button or link** is hovered with a mouse or pen or focused from the keyboard, never on touch; default size 20 px (0007), 24 px in navigation. Four icons (calendar, filter, mail, pencil) ship their own reduced-motion code; they keep it and get only the control-hover hook.
- Icons stay decorative (`aria-hidden`); the control carries the label. One set only. Where the set has no icon (e.g. "info"), we draw a static one at the same grid and stroke.

### Motion (adds to 0007's tokens and 0008 §5)

1. **Animate transform and opacity only.** Never layout properties, never colour on scroll. Exceptions with no transform equivalent: the tab underline's width, a progress bar's fill, and the toast stack's height (Base UI measures it to expand the stack).
2. **CSS transitions, not keyframes**, for anything that can be interrupted (popovers, sheets, toasts, switches), using Base UI's `data-starting-style` / `data-ending-style`. Motion (the library) is for the icons only.
3. **Enter with `--ease-enter`, exit faster** (`--dur-exit` 150 ms, `--ease-exit`). Sheets use `--ease-sheet`. Nothing over `--dur-slow` (320 ms).
4. **Popovers grow from their trigger** (`transform-origin: var(--transform-origin)`) and from `--pop-scale` (0.96), never from 0. Dialogs scale from 0.96 at the centre.
5. **Press:** `scale(var(--press-scale))` (0.98, 0008). **Hover:** colour only, no movement; things seen many times a day don't animate.
6. **Keyboard-initiated changes aren't animated** (tab switches by arrow key, menu highlight, select highlight); tooltips after the first open instantly (`data-instant`).
7. **Toasts:** bottom on phones, bottom-right on desktop; enter and leave the same way; 4 s (6 s if it has an action such as Undo), paused on hover, focus and hidden tab; at most 3; swipe down or sideways to dismiss.
8. **Loading** is the one loop allowed (0007's "nothing loops" covers decoration). A spinner appears only after 400 ms, so quick saves don't flash.
9. **Reduced motion:** transforms collapse to a ≤ 120 ms fade, icons don't play, the spinner stays (it's information) but turns slowly.

## Consequences

- New dependencies (approved by Flovet in chat, 2026-11-21): `motion@13.1.1`, `@base-ui/react@1.9.0`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- `docs/design/design-system.md` is the reference for using tokens and components; `/design-system` (development only) shows every component in every state, in light and dark.
- Components never hold user-facing copy: labels come in as props, so they stay in the message files (0003) once next-intl lands.
- Reviews check: no raw colour, size or easing in a component; every state listed above exists; no `transition: all`; no animation from scale 0; nothing over 320 ms; icon only in a labelled control; Base UI parts never shipped with a default look.
- Not decided here: data table, date picker, combobox, the app shell and navigation, CV templates, illustrations.
