# Jubilee design system

How to build a screen with Jubilee's tokens and components. The _why_ lives in the decisions; this page is the _how_.

- Look and feel: [0007 Visual foundations](../decisions/0007-visual-foundations.md)
- Interaction, disclosure, explicitness, space: [0008](../decisions/0008-interaction-disclosure-and-space.md)
- Components, icons, motion: [0009](../decisions/0009-design-system-components-icons-motion.md)
- Voice and the overall direction: [design brief](design-brief.md); what to avoid: [`no-ai-slop`](../../.claude/skills/no-ai-slop/SKILL.md)
- **See it:** `pnpm dev`, then open `/design-system` (development only). Every component in every state; switch the system theme for dark.

## 1. Tokens

One source: `src/app/globals.css`. Tailwind 4 `@theme` turns the tokens into utilities, so components write `bg-well`, never `bg-[#f4f4f6]`.

**Three tiers** (Carbon / Primer model):

| Tier          | Example                                      | Rule                                               |
| ------------- | -------------------------------------------- | -------------------------------------------------- |
| 1. Values     | `#5a32d6`, `12px`, `200ms`                   | Written once, in `globals.css`                     |
| 2. Roles      | `--violet`, `--ink-muted`, `--stage-offer`   | What components use; light and dark swap the value |
| 3. Components | `--control-h`, `--focus-ring`, `--pop-scale` | Built from 1 and 2; change a whole family at once  |

| Group     | Tokens → utilities                                                                                                                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour    | `page well card line tint field ink ink-muted ink-subtle violet violet-press on-violet marigold pink sky success danger`, `stage-saved/applied/interview/rejected`, `paper paper-ink`, `wash-hover wash-press wash-danger scrim` → `bg-*`, `text-*` …                       |
| Type      | `text-xs` 12 · `sm` 14 · `base` 16 · `lg` 18 · `xl` 20 · `2xl` 24 · `3xl` 32 · `4xl` 40 (line heights included). Plus Jakarta Sans via `--font-jakarta`. `tabular-nums` for dates, scores, counts                                                                           |
| Spacing   | 4 px base: `1` 4 · `2` 8 · `3` 12 · `4` 16 · `6` 24 · `8` 32 · `12` 48 · `16` 64 · `24` 96 · `32` 128. Choose by relationship (0008 §3)                                                                                                                                     |
| Radius    | By size (0022): `rounded-control-sm` 4 · `rounded-control` 6 · `rounded-control-lg` 8 · `rounded-card` 8 (cards, menus, popovers, tooltips) · `rounded-box` 12 (wells, toasts) · `rounded-sheet` 16 · `rounded-mark` 4 (checkbox) · `rounded-paper` 2 (CV) · `rounded-full` |
| Elevation | `shadow-paper` (the CV only), `shadow-float` (menus, sheets, toasts, a dragged card). Resting surfaces have none                                                                                                                                                            |
| Layout    | `max-w-(--container-content)` 1200 · `-reading` 640 · `-dialog` 480; breakpoints `sm` 640, `lg` 1024; fixed layers: `--gutter-sm` 16, `--gutter-md` 24; toasts: `--toast-width` 380, `--toast-gap` 12, `--toast-peek` 14                                                    |
| Controls  | Heights (0020): `--control-h-lg` 48 · `--control-h` 40 · `--control-h-sm` 32; on touch (`pointer: coarse`) md and sm become 44. `--icon-ui` 20 · `--icon-nav` 24 · `--focus-ring` · `--shadow-thumb` (switch)                                                               |
| Motion    | `--dur-fast` 120 · `--dur-exit` 150 · `--dur-base` 200 · `--dur-slow` 320; `ease-enter`, `ease-exit`, `ease-standard`, `ease-sheet`; `--press-scale` 0.98, `--pop-scale` 0.96                                                                                               |
| Variant   | `hover-fine:` = hover on real pointers only (0008 §5). Never use plain `hover:`                                                                                                                                                                                             |

`src/lib/tokens.test.ts` reads `globals.css` and fails if any colour pair drops below WCAG 2.2 AA, in either theme.

## 2. Components

All in `src/components/ui/`, icons in `src/components/icons/`. Labels and messages always come in as props, so the copy stays in the message files (0003).

| Component                                               | File                          | Use it for                            | States and variants                                                                                                     |
| ------------------------------------------------------- | ----------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Button`                                                | `button.tsx`                  | Any action                            | primary · secondary · quiet · danger; md 48 · sm 44; icon, iconEnd; hover, focus, pressed, disabled, loading; fullWidth |
| `IconButton`                                            | `button.tsx`                  | Toolbars, close, "more"               | `label` required (aria-label + tooltip); same variants, loading, disabled                                               |
| `TextLink`                                              | `text-link.tsx`               | Links in text                         | internal, external (new tab, icon, hint)                                                                                |
| `Field`                                                 | `field.tsx`                   | Wraps any control                     | label, hint, optional mark, error (danger + icon, announced), disabled                                                  |
| `Input`                                                 | `field.tsx`                   | One line of text                      | icon, end slot, placeholder, invalid, disabled, read-only                                                               |
| `Textarea`                                              | `field.tsx`                   | Longer text                           | grows with content, `showCount` + `maxLength`, invalid, disabled                                                        |
| `Select`                                                | `select.tsx`                  | One of 7+ options                     | placeholder, disabled items, empty list text, invalid, disabled, read-only                                              |
| `Checkbox`                                              | `checkbox.tsx`                | Independent on/off in a form          | unchecked, checked, indeterminate, description, invalid, disabled, read-only                                            |
| `RadioGroup`                                            | `radio-group.tsx`             | One of ≤ 6 options                    | list or cards, descriptions, disabled options, hint, error                                                              |
| `Switch`                                                | `switch.tsx`                  | A setting that applies at once        | on, off, description, disabled                                                                                          |
| `Well`, `Card`, `CardLink`                              | `surface.tsx`                 | Grouping (Clemta pattern)             | well title + actions; static card; clickable card (hover border, press)                                                 |
| `NextStep`                                              | `surface.tsx`                 | The one next action of a screen       | title, body, icon, action                                                                                               |
| `Badge`, `StageBadge`                                   | `badge.tsx`                   | Real state only                       | neutral, violet, success, danger, marigold; stages saved → rejected with marks; truncates with `title`                  |
| `Alert`                                                 | `feedback.tsx`                | Inline message where the problem is   | info, success, warning, danger (role alert); action; dismiss                                                            |
| `Progress`, `Skeleton`, `Spinner`, `Avatar`             | `feedback.tsx`, `spinner.tsx` | Amounts, loading, people              | progress label + value; skeleton shapes; spinner 400 ms delay; avatar photo → initials fallback                         |
| `Tooltip`, `TooltipProvider`                            | `tooltip.tsx`                 | A hint, never the only label          | delay 500 ms, instant neighbours, keyboard focus opens                                                                  |
| `Menu`                                                  | `menu.tsx`                    | "More", "Move to"                     | icons, separators, disabled, danger item, align start/end                                                               |
| `Dialog`, `Sheet`, `OverlayClose`                       | `dialog.tsx`                  | One short decision; a panel of detail | controlled or with trigger; footer; sheet bottom (phone) / right (desktop)                                              |
| `ToastProvider`, `useToast`                             | `toast.tsx`                   | A confirmation away from the change   | info, success, danger; action (Undo); stack of 3; swipe                                                                 |
| `Tabs`                                                  | `tabs.tsx`                    | Peer views of one thing               | meta count, disabled tab, scrolls on narrow screens                                                                     |
| `EmptyState`, `UndoLine`, `MarkedChange`, `ReviewPanel` | `patterns.tsx`                | Jubilee patterns from 0008            | empty with one action; undo in place; AI change with reason + accept/reject; final-action summary                       |

### Sizes (0020)

`Button`, `IconButton`, `Input`, `Textarea` and `Select` take `size`:

| Size | Mouse | Touch | Radius | Use for                                                               |
| ---- | ----- | ----- | ------ | --------------------------------------------------------------------- |
| `lg` | 48 px | 48 px | 8 px   | The main action and fields of a single-task screen (sign-in, landing) |
| `md` | 40 px | 44 px | 6 px   | The default, everywhere else, including the CV editor                 |
| `sm` | 32 px | 44 px | 4 px   | Inline row actions in dense lists ("Edit", "Remove")                  |

- One size per form and per button group; never mix sizes in a group.
- Field text stays 16 px at every size, so iOS doesn't zoom.
- Dense screens get lighter through weight too: quiet and text buttons for secondary actions, one primary per section.
- See the "Dense screen" section of `/design-system`.
- **Rows, not controls:** list rows and option rows stay at least 44 px (`min-h-11`) on every pointer. That covers menu and select items, checkbox, radio and switch rows, tabs and the undo line. They're tall targets inside a list, not sized controls.
- **Fixed radii:** tabs keep `rounded-t-control` (6 px, the md radius), because a tab is an md-height control. The toast's action and close buttons use the `sm` height and radius.

### States every control has

| State         | How it looks                                                      | Notes                                                                                    |
| ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Default       | Tokens above                                                      |                                                                                          |
| Hover         | Colour only (8% ink wash, or `--field` border on clickable cards) | `hover-fine:` only, so touch never sticks                                                |
| Focus-visible | 2 px violet ring, 2 px away                                       | Global in `globals.css`; keyboard only                                                   |
| Pressed       | Scale 0.98 + a darker fill                                        | `active:` also gives touch feedback                                                      |
| Disabled      | Well fill, subtle ink, line border, `not-allowed` cursor          | Not focusable. If it needs explaining, say why in a hint, or use `focusableWhenDisabled` |
| Loading       | Spinner over a hidden label, same width, `aria-busy`              | Clicks ignored; focus kept                                                               |
| Invalid       | 2 px danger border + message with an icon                         | Message says how to fix it                                                               |
| Read-only     | Well fill, line border, still focusable and copyable              |                                                                                          |

### Edge cases they already handle

- **Long or French text:** buttons and labels wrap rather than clip; badges and select values truncate with the full text in `title` or the list.
- **Empty data:** `Select` shows `emptyText`; `EmptyState` for lists; `Avatar` shows "?" without a name.
- **Double submit:** a loading `Button` ignores clicks.
- **Narrow screens:** tabs scroll sideways; dialogs fit with 16 px margins; sheets come from the bottom below 1024 px and respect the safe area.
- **Keyboard:** everything is reachable; overlays trap and return focus; Esc closes.
- **Reduced motion:** see §4.

## 3. Icons

- **Set:** icons-animated, Hugeicons (MIT; `LICENSE` and `THIRD_PARTY_NOTICES.md` in the folder). Import from `@/components/icons`.
- **Size:** 20 px default (`size` prop), 24 px in navigation, 16–18 px inside small text.
- **Behaviour:** an icon inside a button or link plays when that control is hovered with a mouse or pen, or focused from the keyboard; never on touch; never with reduced motion. Icons are `aria-hidden`; the control carries the label.
- **Add an icon:** check it exists (`https://icons.lndev.me/r/hugeicons-<name>.json` returns 200), download it, and apply the same edits as the existing files: header comment, `span` root with `inline-flex shrink-0`, `size = 20`, and the shared `useIconAccessibility` (or `useControlHover` for icons that ship their own reduced-motion code). Export it from `index.ts`. Static icons we draw (`MoreIcon`) live in the same folder.
- **Missing icon:** draw a static one on the 24 px grid with a 1.5 px stroke and round caps (see `InfoMark` in `feedback.tsx`).

## 4. Motion

Rules from 0009, after Emil Kowalski:

1. Animate `transform` and `opacity` only. (Two exceptions: the tab underline's width and a progress bar's fill, which have no transform equivalent.)
2. Use CSS transitions with Base UI's `data-starting-style` / `data-ending-style`, so a half-finished animation reverses smoothly. Never `transition: all`.
3. Enter with `ease-enter` over `--dur-base`; leave faster with `ease-exit` over `--dur-exit`. Sheets use `ease-sheet` over `--dur-slow`. Nothing longer than 320 ms.
4. Popovers grow from their trigger (`origin-(--transform-origin)`) starting at `--pop-scale`, never at scale 0.
5. Press = `active:scale-(--press-scale)`. Hover never moves anything.
6. No animation for keyboard-driven changes (highlight in a list, a tab switch's panel) or for things seen many times a day.
7. Loading is the only loop. Spinners wait 400 ms before showing.
8. Reduced motion: transforms collapse to a short fade, icons don't play, the spinner turns slowly.

## 5. Composing a screen

1. One `Well` per group, white `Card`s inside it. Never a card in a card.
2. One `primary` button per screen. Everything else is secondary or quiet.
3. Spacing by relationship: 4–8 inside a unit, 12–16 between items, 32–48 between groups, 48–96 between sections.
4. Every control has a visibility tier and a consequence level (0008 §1). Final actions use `ReviewPanel` and a button that names the target.
5. Feedback goes inline (`Alert`, `UndoLine`) before reaching for a toast.
6. Wrap the app once in `TooltipProvider` and `ToastProvider` (the app-shell spec does this).
