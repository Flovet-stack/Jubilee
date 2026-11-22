# 0013: Sign-in page refresh and wider word spacing

- **Status:** Approved; the word-spacing part (Decision §5) is superseded by [0015](0015-keep-default-word-spacing.md)
- **Proposed:** 2026-11-21 by the product team (roles: UI, UX, Copy, Frontend)
- **Approved:** 2026-11-21 by Flovet (in chat)
- **Supersedes:** amends the layout part of 0012 (no card) and adds to 0007's typography
- **Specs:** none yet

## Context

Flovet asked for four changes to the sign-in page from 0012: no card, everything centred, the logo icon above the title, a new footer (account note, terms line, support line). Flovet also finds the word spacing of Plus Jakarta Sans (0007) slightly tight.

## Research

| Reference                                      | What they do                                                                                                                                                                 | Adopt / adapt / reject | Why                                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Measured space width, Google Fonts, 400 weight | Plus Jakarta Sans 0.170 em; Manrope 0.200; Instrument Sans 0.200; Outfit 0.208; Public Sans 0.243; Figtree 0.247; Nunito Sans 0.257; DM Sans 0.266; Onest 0.270; Inter 0.281 | Adopt as evidence      | Jakarta's space is the narrowest measured, about 0.08 em under the 0.24–0.28 em of common UI faces. Flovet's impression is right |
| WCAG 2.2 SC 1.4.12 Text Spacing                | Content must survive a user setting word spacing to 0.16 em; authors aren't required to use it                                                                               | Adopt as a check       | Adding word spacing ourselves is allowed; layouts must still not break at the user override                                      |
| 0010 logo files                                | `jubilee-icon.svg` (the path)                                                                                                                                                | Adopt                  | The icon Flovet asked for. Needs 0010 approved                                                                                   |

Sources (opened): https://fonts.google.com (space widths measured in the browser with canvas `measureText`, 100 px, 400 weight) · https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html

## Options (word spacing)

1. **Keep Plus Jakarta Sans, add `word-spacing: 0.06em` to body text** (≈0.23 em, close to Public Sans and Figtree). Headings get 0.03 em, since large text with −1% tracking looks gappy with more. No download change, the look stays.
2. **Switch to DM Sans or Figtree.** Normal spacing out of the box, but replaces a font Flovet chose for its Ownr feel (0007), and every screen built so far changes.

## Decision

1. **Layout:** no card. One centred column, max 400 px, all text centred. Fields and buttons stay full width of the column, with the field label left-aligned above its field (centred labels are hard to scan).
2. **Logo:** the 0010 icon, 40 px tall, above the title, `aria-hidden` (the title already names Jubilee).
3. **Passwords:** none. Sign-in is Google, LinkedIn or an emailed code (0006, 0012). Nothing changes.
4. **Footer copy:**
   - "New here? This creates your account."
   - "By signing in, you agree to the Terms of service and Privacy Policy." Both are links.
   - "Need help? Contact support." The link opens an email to the support address.
5. **Word spacing:** option 1, as global tokens in `globals.css`, so every screen gets it.

## Open points (Flovet)

- **No Terms page exists** (out of scope in spec 05). Saying "you agree to the Terms" with nothing to read is not valid consent. Either a Terms page comes first, or the line says only "Privacy Policy" until then.
- **Support address:** none exists yet. Which email (for example support@jubileecv.com)?
- **0010 must be approved** to use the logo.

## Consequences

- Global word spacing touches every page; a review checks the privacy page and buttons at 360 px in French.
- The page works at the 1.4.12 override (word spacing 0.16 em) with no clipping.
