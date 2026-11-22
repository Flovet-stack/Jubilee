# Jubilee brand guidelines

- **Status:** Approved with [0010](../decisions/0010-logo-and-brand-identity.md) and [0019](../decisions/0019-logo-icon-staircase.md) (the staircase icon).
- **Written:** 2026-11-21 by the product team (roles: Product Designer, UI, Copy, Frontend)
- **Files:** [`docs/design/brand/logo/`](brand/logo/)
- **Related:** [design brief](design-brief.md) (voice, principles) · [0007 visual foundations](../decisions/0007-visual-foundations.md) (colour and type tokens)

This guide is for anyone who puts Jubilee's name or logo somewhere: the app, emails, CV footers, the site, social profiles, slides, a partner's page. It covers the logo and how to use it. Colour tokens, type and voice already have a home (0007 and the design brief) and are linked, not repeated.

## How this guide is built

We read how large product companies publish their logo rules and kept the parts they share:

| What they publish                                                                   | Who (pages opened)                                 | Here |
| ----------------------------------------------------------------------------------- | -------------------------------------------------- | ---- |
| Logo versions: full logo, icon alone, wordmark alone, each in colour and one colour | Spotify, GOV.UK, Mailchimp, Atlassian              | §2   |
| Clear space measured with a part of the logo, not in pixels                         | Spotify (half the icon height), GOV.UK (the dot)   | §3   |
| A minimum size for each version, in px and mm                                       | Spotify (70 px / 20 mm, icon 21 px / 6 mm), GOV.UK | §4   |
| Colour versions tied to backgrounds: brand colour only on plain light or dark       | Spotify, GOV.UK, Mailchimp (reverse for dark)      | §5   |
| A separate small version for favicons, a larger one for the app icon                | GOV.UK (small crown for favicons)                  | §6   |
| A "don't" list: no stretching, rotating, recolouring, effects or busy backgrounds   | Spotify, GOV.UK, Mailchimp, Atlassian              | §8   |
| Ready-made files people download instead of rebuilding the logo                     | Spotify, Mailchimp, Atlassian (zips per version)   | §9   |
| Rules for the name in text                                                          | Mailchimp ("Our name")                             | §7   |

## 1. The idea

**The steps.** Six equal dots build a staircase of three steps (one, two, three dots), rising from left to right: the work of a job search, step by step, ending on the offer. The five work dots are violet and grow stronger as they climb; the top dot is marigold, the colour Jubilee keeps for earned moments (0007). The logo tells the product's promise in one shape: steady steps, then the offer.

The name is a custom monoline logotype: lowercase, round ends, one stroke weight, built on the geometry of Plus Jakarta Sans. It is drawn, not typed; never set "jubilee" in a font as a stand-in.

## 2. Versions

| Version            | Use it for                                                                                    | File                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Logo** (primary) | Site and app header, emails, slides, press, partner pages                                     | `jubilee-logo.svg`                                                                                             |
| **Icon**           | Where space is square or the name is already nearby: avatars, social profiles, loading screen | `jubilee-icon.svg`                                                                                             |
| **App icon**       | Home screen, store listing, PWA                                                               | `jubilee-app-icon.svg` (rounded) · `jubilee-app-icon-square.svg` (platforms that round the corners themselves) |
| **Favicon**        | Browser tabs and anything under 32 px                                                         | `jubilee-favicon.svg`                                                                                          |
| **Wordmark**       | Only where the icon cannot appear: the CV footer, email signatures, a line of small print     | `jubilee-wordmark.svg`                                                                                         |

![The logo](brand/logo/jubilee-logo.svg)

**One family, one bright spot.** In the logo, the icon carries the colour and the name's dots are ink. The wordmark used alone takes the colour back: a violet dot on the j and a marigold dot on the i. Marigold appears **once** in any placement, so the two are never shown side by side.

![The wordmark](brand/logo/jubilee-wordmark.svg)

## 3. Construction and clear space

The unit is **x**: the x-height of the name, the height of the "u". In the logo file, x is 78 of 615 units, about 13% of the logo's width.

- **Icon height** = the name's height from the top of "b" and "l" to the baseline (1.5 x). The bottom row of dots sits on the baseline; the top of the marigold dot lines up with the top of the "b".
- **Gap** between icon and name = ½ x.
- **Clear space** around the logo and the wordmark = 1 x on every side. Nothing (text, edges, other logos) enters it.
- **Clear space** around the icon alone = ¼ of the icon's height.
- **Icon grid:** dots of diameter 15 on a 20-unit grid (gap = ⅓ of a dot). The violet dots step in opacity by diagonal: 50%, 65%, 80%, 95% from bottom left to top right.
- **App icon safe area:** the staircase fills the middle 57% of the tile, centred.

The files already carry these proportions. Scale them as a whole; never rebuild the logo from the parts.

## 4. Minimum sizes

Below these, the smallest dot stops reading.

| Version  | Screen      | Print | Below that                      |
| -------- | ----------- | ----- | ------------------------------- |
| Logo     | 120 px wide | 30 mm | Use the icon or the wordmark    |
| Wordmark | 64 px wide  | 16 mm | Write "Jubilee" in text instead |
| Icon     | 32 px tall  | 8 mm  | Use the favicon                 |
| Favicon  | 16 px       | n/a   | Nothing smaller                 |

## 5. Colour versions

Logo colours are the 0007 tokens: ink `#1d1a44`, violet `#5a32d6`, marigold `#f6c453`, and on dark the dark-theme ink `#f1f0f8` and violet `#a48cff`.

| Background                                | Version                         | File                                                        |
| ----------------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| White or the light greys (page, well)     | Full colour                     | `jubilee-logo.svg`                                          |
| Dark page `#0e0d1f` or near-black         | On dark                         | `jubilee-logo-on-dark.svg`                                  |
| Violet `#5a32d6`                          | On violet (white, marigold dot) | `jubilee-logo-on-violet.svg`                                |
| Photos, patterns, any other colour        | One colour, white or ink        | `jubilee-logo-mono-white.svg` · `jubilee-logo-mono-ink.svg` |
| One-colour print, fax, embroidery, stamps | One colour, ink                 | `jubilee-logo-mono-ink.svg`                                 |

The full-colour logo goes only on plain backgrounds from the table. On anything busy, use a one-colour version and keep the contrast at 3:1 or more.

The marigold dot is the one exception to 0007's rule that bright colours stay off resting screens: it is part of the logo, not decoration, and it is the only bright spot in it.

## 6. Small sizes and the app icon

- **Favicon:** the same staircase with bigger dots and less padding (68% of the tile), so it still reads at 16 px. Use it for every size under 32 px.
- **App icon:** the staircase, white dots stepping in opacity and the marigold top dot, on a flat violet tile (no gradient: 0007). The rounded file is for places that show it as-is; the square file is for iOS and Android, which round the corners themselves.
- Never put the full logo (icon plus name) in a square slot; the name becomes unreadable.

## 7. The name in text

- Write **Jubilee**, capital J, in sentences, in English and French alike. The name is never translated.
- The logo is always lowercase; text is not. Don't write "JUBILEE" or "jubilee" in running text.
- **jubileecv.com** is the address, not the name. Don't write "JubileeCV" or "Jubilee CV".
- The name is not a verb or a plural: "apply with Jubilee", not "Jubilee it".
- Voice and tone: [design brief §7](design-brief.md#7-personality-and-voice).

## 8. Don't

1. Stretch, squash, rotate, flip or skew any version.
2. Change the colours, swap which dot is marigold, or make more than one dot marigold.
3. Add, remove or move dots in the icon, or change their opacity steps.
4. Rearrange the icon and name, change the gap, or stack them in a new way.
5. Set "jubilee" in a font instead of using the drawn wordmark.
6. Add shadows, outlines, glows, gradients or 3D effects (0007: no gradients, glows or glass, ever).
7. Put the full-colour logo on a photo, pattern or low-contrast colour.
8. Use the coloured wordmark next to the icon (two marigold dots).
9. Use the logo inside a sentence, as a letter, or inside another product's name.
10. Go below the minimum sizes in §4.

## 9. Files

All files are SVG in [`docs/design/brand/logo/`](brand/logo/), drawn on the shared grid, with a `<title>` for screen readers. Names follow `jubilee-<version>[-<background>].svg`.

| File                            | What                                  |
| ------------------------------- | ------------------------------------- |
| `jubilee-logo.svg`              | Logo, full colour, light backgrounds  |
| `jubilee-logo-on-dark.svg`      | Logo for dark backgrounds             |
| `jubilee-logo-on-violet.svg`    | Logo for violet backgrounds           |
| `jubilee-logo-mono-ink.svg`     | Logo, one colour, ink                 |
| `jubilee-logo-mono-white.svg`   | Logo, one colour, white               |
| `jubilee-wordmark.svg`          | Wordmark alone, coloured dots         |
| `jubilee-wordmark-on-dark.svg`  | Wordmark alone, dark backgrounds      |
| `jubilee-wordmark-mono-ink.svg` | Wordmark alone, one colour            |
| `jubilee-icon.svg`              | Icon alone, light backgrounds         |
| `jubilee-icon-on-dark.svg`      | Icon alone, dark backgrounds          |
| `jubilee-app-icon.svg`          | App icon, rounded tile                |
| `jubilee-app-icon-square.svg`   | App icon, square (platform rounds it) |
| `jubilee-favicon.svg`           | Favicon, bigger dots for 16–31 px     |

The app's `src/app/favicon.ico` (16, 32, 48 px), `src/app/icon.svg` and `src/app/apple-icon.png` (180 px) are generated from these SVGs with `node scripts/render-brand-icons.mjs .` (spec 10). Run it again after any change to the files here. Store icons and social images are not made yet.

## 10. Changes

The logo changes only through a new decision that supersedes 0010 (0019 replaced the icon with the staircase). Update the files here first; every other copy is generated from them.
