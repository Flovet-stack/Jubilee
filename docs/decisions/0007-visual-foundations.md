# 0007: Visual foundations ("quiet desk, bright moments")

- **Status:** Approved; the _Iconography_ paragraph is superseded by [0009](0009-design-system-components-icons-motion.md); its control and card radius by [0022](0022-corner-radius-by-size.md)
- **Proposed:** 2026-11-21 by the product team (roles: UI, UX, Copy, Frontend, Product)
- **Revised:** 2026-11-21 after Flovet's review of the sample screens: the green accent was too common (the AI-tells catalogue lists emerald/teal as the default fallback accent); Flovet prefers Ownr's colour and playfulness, Clemta's grey wells with light borders, and a font one of them uses. Revision 1 ("the green light", Public Sans + Newsreader) is replaced in full; it was never approved.
- **Approved:** 2026-11-21 by Flovet (in chat, after reviewing the revised sample screens)
- **Specs:** specs/03-design-system.md

## Context

The scaffold has no tokens or fonts. The brief says the design direction must be decided "before any screen is built". Constraints from `PROJECT_BRIEF.md`: mid-range phones and paid data ("keep pages light"); English and French; sensitive personal data (the look must read as careful); and one irreversible act, sending an application, only on the user's approval. Interaction, disclosure and space rules are in [0008](0008-interaction-disclosure-and-space.md); the list of patterns to avoid is the `no-ai-slop` skill (`.claude/skills/no-ai-slop/SKILL.md`).

## Research

### The two references Flovet chose (computed styles read in the browser, 2026-11-21)

|                           | Ownr (ownr.co)                                                                                                                                                  | Clemta (clemta.com)                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts                     | **Plus Jakarta Sans** 700 for headings (38 / 32 / 24 / 17 px, tracking −1%); Inter for small UI text                                                            | **Inter Tight** 500 for headings (63 / 36 / 16 px, tracking −2.5%) and body                                                                                      |
| Text colour               | Deep navy-violet `rgb(35 30 86)`, also at 90% and 60% opacity for secondary text                                                                                | Near-black `rgb(23 23 23)`, grey `rgb(113 113 113)` for body                                                                                                     |
| Primary                   | Flat violet `rgb(95 61 200)`, deeper `rgb(57 27 147)` for emphasis; no gradients on buttons                                                                     | Blue links `rgb(37 99 235)`; black primary buttons                                                                                                               |
| Surfaces                  | White, with very light violet-tinted sections (`rgb(248 250 254)`, `rgb(243 239 255)`)                                                                          | White page; **grey wells** `rgb(245 245 245)` / `rgb(250 250 250)` with **1 px borders** `rgb(230–234 230–234 230–234)` holding white cards with the same border |
| Radius                    | 12 px on cards (most common), 6 px buttons, pills for badges                                                                                                    | 10–12 px wells and cards, 8 px controls, pills                                                                                                                   |
| Buttons                   | 48 px tall, 12 × 20 px padding, solid violet or white with a violet outline                                                                                     | Black solid, white outline                                                                                                                                       |
| Playfulness               | Confetti specks in violet, pink `rgb(234 117 187)`, teal `rgb(25 180 143)`, blue `rgb(52 132 223)`, gold `rgb(248 214 137)`; duotone spot icons; photo collages | Calm, monochrome; the product UI shown as the illustration                                                                                                       |
| Patterns on the slop list | Accent word in headlines, pill eyebrows, photo testimonials                                                                                                     | Three-up feature grids, Inter-family type                                                                                                                        |

Exact brand colours are not copied (product-team rule); the values below are our own, tuned for contrast and for Jubilee.

### Other sources

| Reference                                                                                               | What they do                                                                                                                | Adopt / adapt / reject | Why                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ownr palette and type                                                                                   | Violet + navy-violet ink, Plus Jakarta Sans, confetti accents                                                               | **Adapt**              | Flovet's choice. Plus Jakarta Sans is free (OFL) and not in the slop font lists; violet is, so it is fenced by rules (below and `no-ai-slop` §10) |
| Clemta containment                                                                                      | Grey well + hairline, white card + hairline, 12 px radius                                                                   | **Adopt**              | Flovet's choice; gives information clear groups without heavy boxes. Limited to one level (0008 §3)                                               |
| Inter / Inter Tight                                                                                     | Clemta's face; Ownr's small text                                                                                            | **Reject**             | Inter is the most-cited AI-default font (4 of 4 slop sources)                                                                                     |
| AI-tells sources (Paralect, avoid-ai-design catalogue, 925Studios, prg.sh, Anthropic `frontend-design`) | Purple gradients, violet CTAs, emerald/teal fallback accent, Inter, same radius everywhere, borders around everything, glow | Adopt as constraints   | Every value below was checked against them; see `no-ai-slop`                                                                                      |
| Atlassian, Carbon, Primer, GOV.UK spacing (revision 1 research, still valid)                            | Spacing by named job; larger steps on larger screens                                                                        | Adopt                  | Scale below; rules in 0008                                                                                                                        |
| Material 3 / Android button emphasis                                                                    | One high-emphasis action per screen                                                                                         | Adopt                  | One violet button per screen                                                                                                                      |
| NN/g visual hierarchy                                                                                   | At most 3 sizes; 2 primary + 2 secondary colours; never colour alone                                                        | Adopt                  | Type and colour limits                                                                                                                            |
| WCAG 2.2 AA                                                                                             | Text 4.5:1, UI and large text 3:1                                                                                           | Adopt                  | Ratios computed for every pair (script, 2026-11-21)                                                                                               |
| `next/font` data (local)                                                                                | Plus Jakarta Sans: variable `wght` 200–800, latin + latin-ext, italics                                                      | Adopt                  | One variable family covers UI and headings, which is lighter than two                                                                             |

Sources (opened): https://www.ownr.co/ and https://clemta.com/ (computed styles via the browser; Flovet's full-page captures) · https://www.paralect.com/blog/signs-of-ai-slop-in-design · https://github.com/funboy322/avoid-ai-design/blob/main/references/ai-tells-catalog.md · https://www.925studios.co/blog/ai-slop-design-tells · https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website · https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md · https://atlassian.design/foundations/spacing · https://carbondesignsystem.com/elements/spacing/overview/ · https://www.nngroup.com/articles/visual-hierarchy-ux-definition/. Search summaries only: Material/Android button guidance.

## Options

1. **"Quiet desk, bright moments" (recommended):** Clemta's calm grey structure for the everyday work, Ownr's violet for the one action and its confetti colours for earned moments. Pros: matches Flovet's references; calm where users are stressed, joyful where they win ("Jubilee" is a celebration). Cons: violet is a known AI default, so it needs the fences below.
2. **Ownr all the way:** violet-tinted sections, colourful spot art everywhere. Cons: busy on a work tool; more slop risk.
3. **Clemta all the way:** monochrome with a blue link colour. Cons: loses the playfulness Flovet asked for.
4. **Keep revision 1's green.** Rejected by Flovet; the catalogue confirms emerald/teal reads as the fallback default.

## Decision

Option 1. **Idea:** _quiet desk, bright moments._ Everyday screens are calm: white page, grey wells, white cards, navy-violet ink. One violet button says what to do next. Colour bursts in (marigold, pink, sky, violet confetti) only when the user earns it: the first application sent, an interview, an offer.

### Colour

Light is the default; dark follows `prefers-color-scheme` (no toggle in the MVP). The CV and letter previews stay white paper in both themes.

| Token            | Light     | Dark      | Use                                                                                      |
| ---------------- | --------- | --------- | ---------------------------------------------------------------------------------------- |
| `--page`         | `#ffffff` | `#0e0d1f` | Page background                                                                          |
| `--well`         | `#f4f4f6` | `#121126` | Grouping wells (Clemta pattern), the tracker column, sidebar                             |
| `--card`         | `#ffffff` | `#1b1a33` | Cards and panels inside wells, inputs, sheets                                            |
| `--line`         | `#e5e4ea` | `#2f2d4a` | 1 px borders on wells and cards (decorative; no contrast duty)                           |
| `--tint`         | `#f3f0ff` | `#252148` | Selected item, the "next step" panel, accepted-change highlight                          |
| `--field`        | `#8b8999` | `#7f7c98` | Input, checkbox and outline-button borders (3.4:1 on card / 4.2:1)                       |
| `--ink`          | `#1d1a44` | `#f1f0f8` | Text and headings, navy-violet (16.4:1 on card / 14.9:1)                                 |
| `--ink-muted`    | `#4f4c66` | `#b7b4cc` | Meta lines, hints (8.2:1 / 8.4:1)                                                        |
| `--ink-subtle`   | `#6b6880` | `#9592ad` | Skippable detail only (4.8:1 on tint, 4.9:1 on well / 5.0:1+)                            |
| `--violet`       | `#5a32d6` | `#a48cff` | The one primary action, active nav, links, focus ring, match bar (7.3:1 on card / 6.3:1) |
| `--violet-press` | `#3f1fa8` | `#c3b4ff` | Pressed primary, emphasis text                                                           |
| `--on-violet`    | `#ffffff` | `#120d2e` | Text on violet (7.3:1 / 6.9:1)                                                           |
| `--marigold`     | `#f6c453` | `#f6c453` | Offer stage fill, celebration; always with `--ink` text (10.1:1); never text itself      |
| `--pink`         | `#e8679f` | `#f08cb8` | Confetti and illustration only (fails as text in light: 3.1:1)                           |
| `--sky`          | `#5aa7f0` | `#5aa7f0` | Confetti and illustration only                                                           |
| `--success`      | `#1f7a4d` | `#5fd39a` | Success icon + words (5.3:1 / 9.1:1)                                                     |
| `--danger`       | `#c0262d` | `#ff7b7b` | Errors and destructive actions only (5.9:1 / 6.7:1)                                      |

**Tracker stages** (brief vocabulary), each with icon + label, never colour alone; all pass 4.5:1 as text on card, well and tint in both themes:

| Stage     | Light                            | Dark      |
| --------- | -------------------------------- | --------- |
| saved     | `#5d5b70`                        | `#aeacc2` |
| applied   | `#2457c5`                        | `#8fb0ff` |
| interview | `#9a2d77`                        | `#f39ad3` |
| offer     | `--marigold` fill + `--ink` text | same      |
| rejected  | `#6e6763` warm grey, **not red** | `#b2aaa5` |

Rules: one `--violet` button per screen; **no gradients, glows or glass, ever**; colour never carries meaning alone; `--danger` never marks a job outcome; confetti colours never appear on a resting screen.

### Typography

- **One family: Plus Jakarta Sans** (variable, 400–800), `--font-sans`, through `next/font` (latin + latin-ext). The face Ownr uses for headings: geometric, warm, open counters that read well at 14 px and carry French accents. One family keeps the download small.
- **Headings** 700, tracking −0.01em, line height 1.15. **Body** 400, 16 px, line height 1.5. **Labels and buttons** 600. Tabular figures (`tnum`) for dates, scores and counts.
- **Scale:** 12 · 14 · 16 · 18 · 20 · 24 · 32 · 40 px as `--text-xs … --text-4xl`. At most three sizes per screen besides meta.
- **Budget:** font transfer ≤ 80 KB, measured in the foundations spec.
- The CV's own fonts belong to the CV rendering decision, not here.

### Spacing, layout, shape

- **Scale (4 px base):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Chosen by relationship (0008 §3).
- **Gutters:** 16 px (< 640), 24 px (640–1023), 32 px (≥ 1024). Content max 1200 px; forms and reading max 640 px.
- **Radius by role:** `2px` the CV paper · `8px` buttons, inputs, menus · `12px` wells and cards · `16px` sheets and dialogs · `full` pills.
- **Containment (Clemta pattern):** a well is `--well` + 1 px `--line` + radius 12 + 16–24 px padding; a card inside it is `--card` + 1 px `--line` + radius 12. **One level only:** never a card inside a card, never a well inside a well (0008 §3).
- **Elevation:** resting wells and cards have no shadow. The CV paper has `--shadow-paper: 0 1px 2px rgb(29 26 68 / 0.06), 0 8px 24px rgb(29 26 68 / 0.08)`. Floating layers (menus, sheets, a dragged card) have `--shadow-float: 0 12px 32px rgb(29 26 68 / 0.18)`.
- **Buttons:** 48 px tall on phones and desktop (Ownr), 44 px minimum for small ones; primary violet; secondary `--card` with a `--field` border; quiet = text only.

### Playfulness, with limits

- **Confetti** in violet, marigold, pink and sky, ≤ 600 ms, once, for earned milestones only: first application sent, an interview booked, an offer. Static on reduced motion.
- **The "next step" panel:** a `--tint` panel for the single next action of a screen (e.g. "2 follow-ups are ready").
- **Spot illustrations** (empty states, onboarding) are a later decision with their own style; until then, empty states are words and one button.
- Not adopted from Ownr: accent words in headlines, pill eyebrows, stock or generated people (`no-ai-slop` §10).

### Iconography

Inline SVG drawn in-house, 20 px in UI and 24 px in navigation, 1.5 px stroke, round caps; decorative (`aria-hidden`), the button carries the label. No emoji, no sparkle for AI. An icon library would need its own approval.

### Motion

| Token             | Value                             | Use                                       |
| ----------------- | --------------------------------- | ----------------------------------------- |
| `--dur-fast`      | 120 ms                            | Hover, press, checkbox                    |
| `--dur-base`      | 200 ms                            | Reveal a section, a tab, an AI suggestion |
| `--dur-slow`      | 320 ms                            | Sheets, a tracker card settling           |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)`      | Movement                                  |
| `--ease-enter`    | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Entering                                  |

Nothing loops, nothing animates on scroll. `prefers-reduced-motion`: movement becomes a ≤ 120 ms fade.

## Consequences

- `globals.css` maps these tokens into Tailwind 4 `@theme`; components use tokens only.
- Violet carries slop risk; reviews check the fences: no gradient, one violet button per screen, ink is navy-violet not black, confetti only at milestones.
- Containment is one level deep; reviews flag a card in a card.
- Light and dark are both screenshotted in reviews.
- Not decided here: CV templates and typography, the app shell, the icon list, the illustration style.
