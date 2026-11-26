# 0036: Layered control surfaces, and a Geist and radius trial on the design-system page

- **Status:** Proposed
- **Proposed:** 2026-11-26 by the product team (roles: UI, UX, Frontend)
- **Approved:**
- **Supersedes:** the flat button, field and sidebar-row surfaces of 0007 and 0027 (sizes, spacing and radius unchanged: 0022, 0029, 0030)
- **Specs:**

## Context

Flovet likes how a reference dashboard builds its controls: buttons, inputs, sidebar items and icon buttons. "The clever use of background, borders and colour gradients." The ask:

- Rebuild those four controls in that style.
- Keep our violet for the primary button, not the reference's blue.
- Keep our radius, or add a switch on the design-system page so it can be compared.
- Add Geist as a test font.

Reference: https://sales-crm-kargulstudio.vercel.app/ (a public demo, opened in the browser on 2026-11-26). We copy the construction technique, not the brand: no logo, name, icons or blue.

## User lens

The user is Amina, the job seeker from the brief.

| Question                             | Answer                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why does she use these controls?** | Every action passes through them: create a CV, apply, approve, search, move around the sidebar.                                                                     |
| **How is she using them?**           | Short evening sessions on a laptop, often in dark mode. She scans for the next thing to press.                                                                      |
| **What next?**                       | Controls that read as raised and pressable make the next action obvious without more colour. The one violet action stays the only colourful button (0007).          |
| **What do we leave out?**            | The reference's pill shape (unless the trial changes our minds), its blue, its 12 px button text (we keep 0033's sizes), and any change to sizes or spacing (0029). |

## Research: what the reference actually does

Read from the live page's computed styles, 2026-11-26.

| Control                              | Construction                                                                                                                                                                                                                                                                                                                                                                    | Adopt / adapt / reject | Why                                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary button**                   | Fill #4124fb. No CSS border; five stacked shadows:<br>• drop `0 4px 4px rgba(42,42,42,.32)`<br>• outer ring `0 0 0 1px #0e0e0e`<br>• top glow `inset 0 4px 6px rgba(255,255,255,.2)`<br>• inner ring `inset 0 0 0 1px rgba(255,255,255,.15)`<br>• bottom shade `inset 0 -8px 14px rgba(0,0,0,.15)`<br>The insets make the "gradient": lighter at the top, darker at the bottom. | **Adapt**              | Same layers on our violet. The outer ring takes a darker violet, so it isn't a black edge in light mode.                                                                                  |
| **Secondary button and icon button** | Fill one step above the card (#1e1e1e on #161616). Shadows:<br>• outer ring `0 0 0 1px rgba(0,0,0,.4)`<br>• 1 px top highlight `inset 0 1px 0 rgba(255,255,255,.1)`<br>• inner ring `inset 0 0 0 1px rgba(255,255,255,.06)`                                                                                                                                                     | **Adopt**              | Gives an edge and a lit top without a visible grey border.                                                                                                                                |
| **Sidebar item**                     | Inactive: no fill, muted text (#7f7f7f). Active: fill #2a2a2a with the secondary-button shadows, radius 8 px.                                                                                                                                                                                                                                                                   | **Adopt**              | The active page reads as a raised tab. Black text in light mode, from our earlier review, stays.                                                                                          |
| **Inputs**                           | The page has no form fields. Its search is a borderless command palette, and its filters are secondary-style pills.                                                                                                                                                                                                                                                             | **Adapt**              | Fields get the inverse: a recessed well (fill a step below the card, 1 px inner top shadow, a faint outer highlight). Focus keeps our violet ring. This is our extrapolation, not copied. |
| **Font**                             | Geist, from Vercel (SIL Open Font License), available through `next/font/google`.                                                                                                                                                                                                                                                                                               | **Trial**              | Shown only on the design-system page next to Plus Jakarta Sans (0007). Changing the product font would be its own decision.                                                               |
| **Radius**                           | Pills (9999 px) on buttons, 8 px on rows.                                                                                                                                                                                                                                                                                                                                       | **Trial**              | Ours (0022) stays the default; a switch on the design-system page shows pills for comparison.                                                                                             |

**Light mode is our own work.** The reference is dark-only, so we derive the light layers:

- an outer ring at `rgba(0,0,0,.08)`;
- a white top highlight;
- a faint `0 1px 2px` drop.

This is marked as an assumption to check by eye on the design-system page.

**Sources:**

- https://sales-crm-kargulstudio.vercel.app/ (computed styles read in the browser)
- https://fonts.google.com/specimen/Geist
- https://vercel.com/font

## Options

1. **Copy the reference wholesale: pills, 12 px text, blue.** This breaks 0007, 0022, 0029 and 0033, and the brand.
2. **Copy the surface technique onto our tokens, and trial the font and radius on the design-system page (chosen).**
3. **Add a single border and a gradient fill.** Simpler, but it loses the lit-edge detail Flovet liked, and a gradient fill shows banding at small sizes.

## Decision

Option 2.

**New surface tokens**

- For light and dark, in `globals.css`:
  - `--control` (secondary fill);
  - `--control-hover`;
  - `--control-active` (sidebar active fill);
  - `--field-well` (field fill).
- Shadow tokens:
  - `--shadow-raised` (secondary, icon and active rows);
  - `--shadow-primary` (the violet button);
  - `--shadow-recessed` (fields).
- Dark values follow the reference:
  - control #1e1e1e;
  - active #2a2a2a;
  - field well #121212.
- Light values are derived:
  - control #ffffff;
  - active #ffffff;
  - field well #f7f7f8.

**Controls**

- Primary, secondary, quiet hover, icon buttons, fields (input, textarea, select, phone, date, password), sidebar rows and the account trigger all use these tokens.
- No CSS borders on those controls: the edge comes from the shadows.
- Pressed state: the top glow drops and the fill darkens a step. No movement under reduced motion.
- Sizes, padding, icon sizes (0029, 0030) and type (0033) don't change.

**Design-system page trial**

- Two switches, scoped to that page through a `data-` attribute on its wrapper:
  - **Font:** Plus Jakarta Sans / Geist.
  - **Radius:** Ours / Pill.
- They change nothing elsewhere and aren't saved for users.
- Geist loads through `next/font/google`, only for that page. No new package, so no dependency question.

## Consequences

- Every control looks different in both themes. A review checks:
  - contrast (focus ring 3:1, text 4.5:1);
  - light and dark at 390 and 1440 px;
  - that the controls don't look like a default library template.
- Removing borders means forced-colors (Windows High Contrast) mode would lose the edges. We add a `@media (forced-colors: active)` rule that restores a 1 px `ButtonBorder`.
- If Flovet prefers Geist or pills after the trial, that's a new decision superseding 0007's font or 0022's radius.
