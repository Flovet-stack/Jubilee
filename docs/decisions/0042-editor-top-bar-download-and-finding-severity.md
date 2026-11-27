# 0042: Editor top bar with a Download button, findings coloured by severity, and a flush preview pane

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: UI, UX, Copy), from Flovet's instruction
- **Approved:** 2026-11-27 by Flovet (given as a direct instruction in chat)
- **Supersedes:**
  - 0038's "Download PDF is the More menu's first item";
  - 0031 §3's "findings use the muted tone".
- **Specs:** specs/27-cv-editor-collapsible-sections.md (follow-up)

## Context

Flovet's edits to the editor after spec 27 (2026-11-27):

1. **Width:** no maximum width on the editor.
2. **Top bar:** 8 px block padding, down from 12 px. A bordered variant for the Back and More buttons.
3. **Download:** out of the More menu and onto the top bar, beside More.
4. **Section titles:** no hover effect.
5. **Section bodies:**
   - a slightly lighter shade, but not white;
   - a slight inner shadow at the top, to support each section's title bar.
6. **Findings:** a colour that matches their severity, not plain muted text.
7. **Right pane:** no padding of its own. The tab bar is white, and the preview sits on light grey.

## User lens

The user is Aminata (0039's lens), checking her CV the evening before applying.

| Question                     | Answer                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why does she open it?**    | To finish and send. Download is her last step, so it shouldn't hide in a menu.                                                               |
| **How is she using it?**     | A laptop. She scans the left pane for what's still missing; one muted tone makes a missing email look as minor as a bullet with no number.   |
| **What does she want next?** | Fix what matters first (warnings), then polish (tips), then download.                                                                        |
| **What do we leave out?**    | Red for findings: they're advice, not errors (0024, 0031). A labelled Download button: an icon with a tooltip keeps the bar short on phones. |

## Research

| Reference                                               | What they do                                                           | Adopt / adapt / reject | Why                                                                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Our design system: `Alert` tones (0009, `feedback.tsx`) | Info is a violet "i"; warning is a marigold badge icon. Danger is red. | **Adopt**              | The tones and icons already exist, so findings use the same ones and stay consistent with alerts.                                    |
| Our design system: `IconButton` `secondary` (0037)      | A raised surface with a ring, the only bordered icon-button variant.   | **Adopt**              | This is the "bordered by default" variant Flovet asked for.                                                                          |
| WCAG 2.2 SC 1.4.1 and 1.4.11                            | Colour can't be the only cue; icons need 3:1.                          | **Adopt**              | Each tone keeps its own icon and its text. Marigold sits behind the ink icon, as in `Alert`, so it isn't text on a light background. |

Sources: our own components and decisions above. No outside research beyond 0031's and 0039's; this is a visual follow-up to them.

## Decision

- **Severity:** each finding code gets one of two tones.
  - **Warning** (something a recruiter needs or expects): `contactReach`, `noHeadline`, `noSummary`, `noBullets`, `noDates`. The marigold badge icon, text in ink.
  - **Tip** (polish): `longSummary`, `bulletsWithoutNumbers`, `longBullets`. The violet "i" icon, text in muted ink.
  - A section header's marker takes its strongest tone. Review's cards show the same icon.
- **Top bar:**
  - No maximum width.
  - `py-2` (8 px).
  - Back and More use `IconButton` (or `buttonVariants`) `secondary`.
  - **Download PDF** is a secondary `IconButton` (download icon, tooltip "Download PDF") between the save status and More. It shows a spinner and is disabled while preparing. Its toasts stay as 0038 says.
  - More keeps Duplicate and Delete.
- **Section list:**
  - The title trigger has no hover or press fill. The focus ring stays.
  - The body uses `--desk` (#fafafa light, #171717 dark), lighter than `--well` but not white.
  - The body has an inset top shadow: `inset 0 1px 3px rgb(0 0 0 / 0.06)`.
- **Right pane:**
  - No padding of its own.
  - The tab bar is `bg-card` with inline padding.
  - The Preview panel is `bg-well` with its own padding.
  - Guidance and Review panels stay on `bg-card` with padding, because their cards are already `bg-well`.

## Consequences

- 0038's flow (save first, "Preparing…" state, toasts, file name) is unchanged; only the control moves.
- Review copy is unchanged. Colour and icon now carry severity, and the order stays the same.
- A review checks:
  - contrast of the marigold and violet icons in both themes;
  - that no finding is red.
