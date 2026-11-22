# 11: Control sizes and corner radius

Status: Done (93/100, 2026-11-22) · Written: 2026-11-22

## Goal

Give controls three sizes and a radius that follows their size, so dense screens like the CV editor stay light and readable, focused screens keep their large main action, and phones never drop below 44 px.

## Decisions

Implements [0020](../docs/decisions/0020-control-sizes-and-density.md) and [0022](../docs/decisions/0022-corner-radius-by-size.md). Builds on [0007](../docs/decisions/0007-visual-foundations.md), [0008](../docs/decisions/0008-interaction-disclosure-and-space.md) and [0009](../docs/decisions/0009-design-system-components-icons-motion.md). Meets the brief's component quality bar.

## Acceptance criteria

1. **Tokens.** `src/app/globals.css` holds 0020's height tokens and 0022's radius tokens, with the `pointer: coarse` overrides from 0020. `cn()` knows the new radius names. No component keeps a raw height or radius.
2. **Sizes on every control.** `Button`, `IconButton`, `Input`, `Textarea` (its single-line minimum height), and `Select` take `size: "lg" | "md" | "sm"`.
   - The default is `md`.
   - Height and radius come from the size, as in 0020 and 0022.
   - Input and select text stays 16 px at every size.
3. **Containers.**
   - `Card`, `CardLink`, `Menu`, the `Select` list and `Tooltip` use the card radius.
   - `Well` keeps `--radius-box`; `Dialog`, `Sheet` and toasts keep theirs.
   - Patterns built from these (`EmptyState`, `UndoLine`, `MarkedChange`, `ReviewPanel`, radio cards, `Alert`) follow 0022's table.
4. **Every current `size="sm"` is re-chosen.** Today's `sm` is 44 px; 0020's `sm` is 32 px and only for inline row actions. Each use becomes `sm` or `md` by 0020's rule. The PR lists every use and its choice.
5. **Sign-in uses `lg`** for its fields and main action, so it looks as it does today. Its loading skeletons match.
6. **Touch.** Under `pointer: coarse`, every `md` and `sm` control measures at least 44 px tall (and wide, for icon-only buttons).
7. **`/design-system`** shows:
   - every control at all three sizes, with their states, side by side;
   - the radius scale with its tokens;
   - a dense sample section: a CV-editor-like list of entries with inline `sm` actions inside a `Well` and `Card`.
8. **Docs.** `docs/design/design-system.md` documents the three sizes and when to use each, the radius scale, and the touch floor.

## Out of scope

The new phone, date and password fields (0021, a separate spec). The CV editor itself. Any change to type sizes or spacing tokens.

## Edge cases

- **Long and French labels:** a `sm` button wraps to two lines rather than clip, and keeps 44 px on touch.
- **Mixed sizes:** a button group never mixes sizes. The design-system page shows one correct group per size.
- **Size changes:** an icon-only button stays square at every size.
- **Loading:** a loading button keeps its width at every size, and the spinner scales with it.
- **Focus ring:** it follows each radius and isn't clipped inside a `Card` or `Well`.
- **Hybrid devices:** a laptop with a touchscreen reports `pointer: fine`, so it gets mouse sizes. That's accepted, because WCAG's 24 px minimum still holds.
- **Zoom:** at 200 % zoom no control clips its label.

## Files and patterns to follow

- `src/components/ui/button.tsx`: `cva` variants; add `lg` next to the existing `md` and `sm`.
- `src/components/ui/field.tsx`: `controlClasses`, shared by `Input`, `Textarea` and `Select`.
- `src/lib/utils.ts`: the `extendTailwindMerge` theme names.
- Atlassian's radius mapping (0022 research) is the visual reference for dense lists.

## Boundaries

- Always: tokens only; sizes and radius come from the component's `size` prop, never from a call site's `className`.
- Ask first: any new dependency; changing type or spacing tokens.
- Never: a control under 44 px on touch; `rounded-*` raw values; hard-coded copy.

## Check

- `pnpm check` passes.
- A unit test reads `globals.css` and asserts the 0020 heights, the 0022 radii, and the touch override.
- Screenshots of `/design-system` and sign-in at 390 px and 1440 px, light and dark, with the 390 px shots taken under touch emulation (`pointer: coarse`).
- A reviewer skill run against this spec and its decisions scores 90 or more.
