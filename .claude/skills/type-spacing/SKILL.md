---
name: type-spacing
description: Jubilee's one rule for padding, gaps and icon size inside any control that holds text and/or icons (buttons, fields, select and menu rows, tabs, badges, tooltips, toast actions, sidebar items). Read before building, restyling or reviewing any component; the reviewer grades against it. Decision 0029.
---

# Type spacing (decision 0029)

Spacing inside a control comes from its type, never from a guessed number. The visible text (the capitals, not the line box) sits evenly inside the box, and an icon sits as far from the edge as from the text.

## The rule

```css
.box {
  line-height: 1.5;
  --py: 0.5em;
  --px: calc(var(--py) + (1lh - 1cap) / 2);
  padding: var(--py) var(--px);
  gap: var(--px);
  display: inline-flex;
  align-items: center;
}
.box .icon {
  width: 1lh;
  height: 1lh;
  flex-shrink: 0;
  margin-inline: calc(var(--py) - var(--px));
}
.box.icon-only {
  padding: var(--py);
}
```

- `1lh − 1cap` is the empty space above and below the capitals; half of it goes back on each side.
- Text → edge = `--px`; icon → edge = icon → text = `--py`.
- The size of a control **is its font size**: height = 2.5em. lg 16 px → 40, md 14 px → 35, sm 12 px → 30. Touch raises every control to 44 px with `min-height`; the padding doesn't change.

## In this codebase

Use the classes in `src/components/ui/components.css`. Don't rewrite the formula in a component.

| Class                                | Use                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `jb-type`                            | The box: line-height, `--py`, `--px`, padding and gap                                                                       |
| `jb-type-icon`                       | Wrap each icon (or put it on the icon); 1lh square, pulled to `--py`                                                        |
| `jb-type-square`                     | Icon-only box                                                                                                               |
| `jb-field jb-field-{lg,md,sm}`       | Fields: holds the variables (16 px text, `--py` from the height token)                                                      |
| `jb-field-box`                       | The field's padded box (input, textarea, select trigger)                                                                    |
| `jb-field-icon`, `jb-field-has-icon` | A start icon over an input, and the input padding that makes room for it                                                    |
| `jb-field-end`, `jb-field-has-end`   | An end control (clear, reveal, calendar): a square slot as tall as the field; the control takes the field's type and `--py` |
| `jb-type-badge`                      | Badge: the thin `--py`                                                                                                      |
| `jb-type-content`                    | A button's inner label + icons row (inherits the gap)                                                                       |
| `jb-button jb-button-{lg,md,sm}`     | Buttons (`buttonVariants`); built on the same variables                                                                     |

Declared exceptions (keep the formula, change only `--py` or a minimum):

- **Fields** keep 16 px text (iOS zoom, 0020) and match the button height of their size, so `--py: calc((var(--control-h…) - 1lh) / 2)`.
- **Rows** (menu, select option, tab) keep `min-h-11` (44 px) on every pointer. Sidebar items are 40 px with a mouse and 44 px on touch.
- **Avatars** keep their own size (identity, not an icon).
- **Text and back links** have no box; the rule doesn't apply.
- **Badges** use `--py: 0.15em` (labels, not targets).

Any other exception needs a logged decision.

## Never

- `px-*`, `py-*`, `p-*` or `gap-*` on a control (layout containers such as cards, wells and dialogs use the spacing scale instead; they are not controls).
- A fixed icon size (`size-4`, `size={18}`) inside a control: the icon is `1lh`.
- A different `--py` per size: change the font size instead.
- Padding overrides at a call site (`className="px-2"` on a `Button`).
- Trusting `text-sm` / `text-xs` with line-height: in Tailwind 4 they set `line-height` too. `jb-type` and `jb-field` set `--tw-leading: 1.5` so those utilities keep 1.5; never add `leading-*` to a control.

## Review checklist

1. Every control in the diff uses `jb-type`, `jb-field` or `jb-button`.
2. Measured: icon → edge equals icon → top equals `--py`; icon-only boxes are square.
3. Touch: at least 44 px.
4. The fallback (`@supports not ((height: 1lh) and (height: 1cap))`) still gives the same heights.
