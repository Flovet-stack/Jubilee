# 07: Terms of service page

Status: In progress · Written: 2026-11-21

## Goal

Give the sign-in consent line ("you agree to the Terms of service") a real page to point to, in plain language, that describes only what Jubilee does today.

## Decisions

Implements [0014](../docs/decisions/0014-terms-of-service-page.md). Same pattern as [0011](../docs/decisions/0011-privacy-policy-page.md). Follows [0003](../docs/decisions/0003-internationalisation.md), [0007](../docs/decisions/0007-visual-foundations.md), [0008](../docs/decisions/0008-interaction-disclosure-and-space.md).

Facts from Flovet (2026-11-21): Jubilee is not a registered company yet and is run from the **United States**; governing law is **US law**; minimum age **16**.

## Acceptance criteria

1. `/en/terms` and `/fr/terms` (in `(marketing)`) show a "last updated" date, an intro, a contents list and the sections from 0014, in its order.
2. The privacy page and the terms page share one layout component. The privacy page looks the same as before.
3. "Who we are" says Jubilee is run by its founder from the United States and is not a registered company yet, like the privacy page. "Applicable law" says US law, with EU and other consumers keeping their home-country rights. "Your account" says 16 or older (the same age as the privacy page).
4. Contact links go to `/[locale]/contact`, like the privacy page. No email address is shown.
5. Localised title and description; in the sitemap with alternates; key-parity test passes.

## Out of scope

The contact page, a US state for governing law (added when the company is registered), lawyer review (needed before launch).

## Check

- `pnpm check` passes.
- Screenshots at 390 px and 1440 px, light and dark, en and fr.
- Reviewer skill score of 90 or more, recorded above. One entry in `docs/log.md`.
