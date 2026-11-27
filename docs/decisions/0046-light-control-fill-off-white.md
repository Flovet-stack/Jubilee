# 0046: Raised controls in light mode get an off-white fill

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UI), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet (given as a direct instruction in chat)
- **Supersedes:** 0037's light `--control` value (#ffffff) and its hover and press steps. Dark values are unchanged.
- **Specs:** specs/27-cv-editor-collapsible-sections.md (follow-up)

## Context

Flovet (2026-11-27): in dark mode, secondary buttons stand out from the surface; in light mode they take the white of the card behind them and only the ring shows. He asked for the resting fill to be what hover shows now.

## User lens

Aminata, in light mode on a laptop. Buttons should read as buttons at rest, not only on hover. Left out: any change to sizes, rings or dark mode.

## Research

| Reference                  | What they do                                                                                 | Adopt / adapt / reject           | Why                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| 0037's reference dashboard | Dark only: the control is one step above the card (#1e1e1e on #161616).                      | **Adopt the principle in light** | The control should sit one step off the surface in both themes.       |
| Our light tokens           | `--card` #ffffff, `--control` #ffffff, `--control-hover` #f5f5f6, `--control-press` #ececee. | **Adapt**                        | Shift each step one down: rest #f5f5f6, hover #ececee, press #e3e3e6. |

Sources: decision 0037 and `globals.css`. No outside research.

## Decision

- **Light mode:**
  - `--control` #f5f5f6;
  - `--control-hover` #ececee;
  - `--control-press` #e3e3e6.
- `--control-active` (the sidebar's active row) stays #ffffff.
- Dark mode is unchanged.

## Consequences

- Every secondary and raised control in light mode is a shade darker: the top-bar buttons, Add section, "Go to it", and the sidebar's raised parts.
- The quiet variant's hover uses `--control-hover`, so it also gets a step darker.
