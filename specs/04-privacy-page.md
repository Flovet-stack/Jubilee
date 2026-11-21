# 04: Privacy policy page

Status: Done (91/100, 2026-11-21) · Written: 2026-11-21

## Goal

Give users one clear, honest page that says what Jubilee does with their personal data today and how they use their rights, in English and French. It has to be in place before launch (GDPR applies from the France launch) and has to build the trust the brief's "recruiter-safe" positioning promises.

## Decisions

Implements [0011](../docs/decisions/0011-privacy-policy-page.md). Follows [0002](../docs/decisions/0002-project-structure.md), [0003](../docs/decisions/0003-internationalisation.md), [0007](../docs/decisions/0007-visual-foundations.md), [0008](../docs/decisions/0008-interaction-disclosure-and-space.md), [0009](../docs/decisions/0009-design-system-components-icons-motion.md).

## Acceptance criteria

1. The page renders at `/en/privacy` and `/fr/privacy` inside `src/app/[locale]/(marketing)/privacy/`, as a Server Component, with no header or footer.
2. It has the sections and order listed in 0011's Decision, the "We will not" list and the summary at the top, and a contents list whose links jump to each section (keyboard and screen reader friendly).
3. "Last updated" appears at the top as a `<time dateTime>` element, formatted per locale.
4. Every string comes from `src/messages/{en,fr}.json` under one `privacy` namespace; the existing key-parity test passes.
5. Processors and data named on the page match what exists in the repo when the spec is built (0011: Supabase, Vercel, Google and LinkedIn sign-in, the `profiles` row, the session cookie). Nothing undecided is named.
6. Page metadata: localised title and description, canonical URL and `hreflang` alternates for both locales; listed in `sitemap.ts`.
7. Visual: one reading column (about 65–75 characters a line), 0007 tokens and 0009 components only, contents list in a grey well, no violet button, no illustrations. Holds at 360 px with no horizontal scroll; passes contrast in light and dark.
8. Every "contact us" points to the contact page (`/[locale]/contact`, built in a later spec); no email address appears on the page. The CNIL complaint route links to cnil.fr.

## Out of scope

Header, footer and app shell. Cookie or consent banner. Terms of service. Data export and account deletion flows. A sub-processor page. Any change to stored data.

## Edge cases

- **Facts from Flovet (2026-11-21), for a first version to refine later:** the company isn't registered yet, so the page says so and names no legal entity, person or address. Contact goes through the contact page, never a personal email. No DPO. Minimum age 16. Jubilee trains no AI models. Anything still undecided is stated as undecided, never filled with a placeholder that looks real.
- Long French headings wrap cleanly; contents-list links don't overflow at 360 px.
- Jump links land below any future sticky header (`scroll-margin-top` from a token).
- Reduced motion: no smooth-scroll animation when `prefers-reduced-motion` is set.

## Files and patterns to follow

- Route and messages as 0002 and 0003; the placeholder home pages from spec 01 show the next-intl pattern.
- Components from `src/components/ui/` (`surface`, `text-link`); typography and spacing tokens from `globals.css`; the `no-ai-slop` skill for copy and layout.
- Read `node_modules/next/dist/docs/` for `generateMetadata` and static rendering with `cacheComponents` before writing the page.

## Boundaries

- Always: plain language, sentence case, short paragraphs; legal basis named for each purpose.
- Ask first: any new dependency; any statement about a provider or a retention period not already decided.
- Never: invent company facts, providers or retention periods; present the text as legal advice.

## Check

- `pnpm check` passes.
- Screenshots of `/en/privacy` and `/fr/privacy` at 390 px and 1440 px, light and dark.
- Keyboard-only: Tab reaches every contents link, Enter moves focus to the section.
- Reviewer skill run against this spec; score of 90 or more.
- Before public launch (not this spec): the contact page exists (the page links to it five times); the controller is identified, by the registered company's name and address or, if Jubilee launches first, by naming the founder (GDPR art. 13(1)(a)); each provider's transfer safeguard is checked and named; a lawyer or GDPR professional reviews both languages; a native speaker reviews the French.
