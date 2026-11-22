# 0010: Logo and brand identity ("the path")

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Product Designer, UI, Copy, Frontend)
- **Approved:** 2026-11-21 by Flovet (in chat)
- **Specs:** none yet (the app shell spec will use the files)

## Context

Jubilee has visual foundations (0007) but no logo. The app shell, emails, CV footer, favicon and store listing all need one, and the domain (jubileecv.com) is about to be registered. Flovet asked for logo propositions modelled on how larger companies in the category design theirs, then for a brand document and the files.

## Research

| Reference                                     | What they do                                                                                                                         | Adopt / adapt / reject       | Why                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------- |
| Indeed, Teal, Otta                            | Lowercase wordmark; the brand detail sits inside a letter (Indeed's arc over the i)                                                  | Adapt                        | Our wordmark puts the colour in the two letter dots (j, i) when it stands alone             |
| LinkedIn, Welcome to the Jungle               | Letter in a square tile that doubles as app icon and avatar                                                                          | Reject as primary (option B) | Strong icon, but says nothing about the product                                             |
| Glassdoor                                     | Abstract symbol that hints at the promise                                                                                            | Adopt                        | The rising dots show the job search ending on an offer                                      |
| Spotify design guidelines                     | Full logo and icon; clear space = ½ icon height; minimums 70 px / 20 mm, icon 21 px / 6 mm; green only on black or white; don't list | Adopt the structure          | Clear space from a part of the logo; minimums per version in px and mm                      |
| GOV.UK logo elements                          | Wordmark, crown, lock-up; spacing from the wordmark's dot; small crown for favicons; incorrect-usage list                            | Adopt                        | A separate small version for favicons; spacing measured with the logo's own parts           |
| Mailchimp brand assets                        | Name rules, logo, reverse for dark, do / don't, downloadable files                                                                   | Adopt                        | A "name in text" section and ready-made files                                               |
| Atlassian logos                               | Downloads per product; never compose your own logos                                                                                  | Adopt                        | Files are the source; nobody rebuilds the logo                                              |
| Warwick, Scale, Banner, Winthrop brand guides | Symbol size and spacing tied to letter heights (cap height, x-height, a letter's width)                                              | Adopt                        | Icon height = the name's height to the top of the b; gap ½ x-height; clear space 1 x-height |

Sources (links actually opened, 2026-11-21):

- https://developer.spotify.com/documentation/design
- https://brand.design-system.service.gov.uk/logo-system/logo-elements
- https://mailchimp.com/about/brand-assets/
- https://atlassian.design/foundations/logos (page cut off part-way through)
- Search summaries only (not opened): brand.warwick.ac.uk, brand.scale.com, Banner and Winthrop brand guides
- Failed: brand.uber.com (empty response), design.duolingo.com (redirected, not followed)

## Options

Shown on the canvas "Jubilee logo propositions" (claude.ai artifact), five directions sharing one custom monoline wordmark:

1. **A, two dots:** wordmark only; violet j dot, marigold i dot. Elegant, but no icon for small square spaces.
2. **B, j tile:** white j on a violet tile. The best app icon; says nothing about the product.
3. **C, burst:** rays and a dot. Celebratory, but close to generic "spark" marks.
4. **D, the path:** five rising dots, the last one marigold. Tells the product's story; the smallest dots fade at 16 px.
5. **E, seal:** rosette around the j. Fits the name; heavy at small sizes.

## Decision

**D, the path, as one family with A.** The full logo is D's icon plus the ink wordmark; the wordmark used alone takes A's coloured dots; marigold appears once per placement. A three-dot favicon handles sizes under 32 px. Proportions, colour versions, minimum sizes, name rules and the don't list are in [the brand guidelines](../design/brand-guidelines.md); the files are in `docs/design/brand/logo/`.

Flovet chose D and liked A; putting A's coloured name beside D's icon was rejected because seven dots and two marigold accents compete (canvas board F).

## Consequences

- Marigold appears on resting screens in one place, the logo. This is a stated exception to 0007's rule for bright colours.
- The wordmark is drawn, so no font is needed to show the name; the SVGs are the source for every export.
- PNG and ICO exports and wiring the favicon into the app are left to the app shell spec.
- A review checks: no version outside the files, clear space and minimum sizes kept, only one marigold dot per placement.
