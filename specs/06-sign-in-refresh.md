# 06: Sign-in refresh

Status: In progress · Written: 2026-11-21

## Goal

Make the sign-in page lighter and clearer: no card, centred, the Jubilee icon on top, and a footer with the account note, the terms and the support link.

## Decisions

Implements [0013] (as amended by [0015](../docs/decisions/0015-keep-default-word-spacing.md))(../docs/decisions/0013-sign-in-page-refresh-and-word-spacing.md) and uses [0010](../docs/decisions/0010-logo-and-brand-identity.md). Builds on [0012](../docs/decisions/0012-sign-in-flow-and-screens.md) and [0007](../docs/decisions/0007-visual-foundations.md).

## Acceptance criteria

1. `/[locale]/sign-in` has no card. One centred column, max 400 px. Title, error, "or" and footer text are centred; field labels stay left-aligned.
2. The 0010 icon sits above the title, 40 px tall, `aria-hidden`, in the theme's violet and marigold tokens (light and dark versions match the brand files).
3. The footer reads, in both languages: "New here? This creates your account." · "By signing in, you agree to the Terms of service and Privacy Policy." (both links) · "Need help? Contact support." The support link is a `mailto:` to the support address in `src/lib/site.ts`; the address is never shown as page text.
4. ~~Wider word spacing~~: dropped after Flovet saw it (0015). The font keeps its default spacing.
5. Nothing breaks with the WCAG 1.4.12 override (word spacing 0.16 em, letter spacing 0.12 em, line height 1.5) at 360 px in French.
6. The Terms link goes to `/[locale]/terms` (its page is its own decision, 0014).

## Out of scope

The Terms page content (0014), contact forms, the app shell, any change to the sign-in flow.

## Check

- `pnpm check` passes.
- Screenshots of sign-in at 390 px and 1440 px, light and dark, en and fr.
- Reviewer skill score of 90 or more, recorded above. One entry in `docs/log.md`.
