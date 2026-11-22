# Decision log

The product team researches every product, UX, UI and architecture decision for Jubilee, and Flovet approves each one. This folder records them, so builds and reviews follow written decisions instead of chat history.

## Rules

- **One file per decision:** `NNNN-short-name.md`. Copy [`0000-template.md`](0000-template.md). Numbers are never reused.
- **Research comes first.** Every decision includes the Research block from the product-team skill (Step 1): the references checked, what each does, and the sources actually opened.
- **Nothing is built on a `Proposed` decision.** Only `Approved` counts.
- **Never edit an approved decision.** Write a new one that supersedes it and set the old one's status to `Superseded by NNNN`. The status line and the `Specs:` back-link are the only edits allowed.
- **Specs link decisions; they don't repeat them.** A spec lists the decisions it implements ("Implements 0002, 0003").
- **Reviews check against decisions.** A build that makes a new decision nobody logged is a finding.
- **Log only what limits the build.** Approach, design, data, scope or dependency choices get an entry. Copy tweaks and lint fixes don't.

## Statuses

`Proposed` → `Approved` (or `Rejected`) → optionally `Superseded by NNNN`.

## Index

| #    | Decision                                                                                                           | Status             |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 0001 | [Stack and tooling](0001-stack-and-tooling.md)                                                                     | Approved           |
| 0002 | [Project structure](0002-project-structure.md)                                                                     | Approved           |
| 0003 | [Internationalisation](0003-internationalisation.md)                                                               | Superseded by 0017 |
| 0004 | [Auth, database and environment](0004-auth-database-and-env.md)                                                    | Approved           |
| 0005 | [Target markets and rollout order](0005-launch-markets.md)                                                         | Approved           |
| 0006 | [Account data and the email sign-in code](0006-account-data-and-email-code.md)                                     | Approved           |
| 0007 | [Visual foundations](0007-visual-foundations.md) (iconography superseded by 0009)                                  | Approved           |
| 0008 | [Interaction, disclosure, explicitness and space](0008-interaction-disclosure-and-space.md)                        | Approved           |
| 0009 | [Design system: tokens, components, animated icons and motion](0009-design-system-components-icons-motion.md)      | Approved           |
| 0010 | [Logo and brand identity ("the path")](0010-logo-and-brand-identity.md)                                            | Approved           |
| 0011 | [Privacy policy page](0011-privacy-policy-page.md)                                                                 | Approved           |
| 0012 | [Sign-in flow and screens](0012-sign-in-flow-and-screens.md)                                                       | Approved           |
| 0013 | [Sign-in page refresh and word spacing](0013-sign-in-page-refresh-and-word-spacing.md)                             | Approved           |
| 0014 | [Terms of service page](0014-terms-of-service-page.md)                                                             | Approved           |
| 0015 | [Keep the font's default word spacing](0015-keep-default-word-spacing.md)                                          | Approved           |
| 0016 | [CV data model and PDF rendering](0016-cv-data-model-and-pdf-rendering.md)                                         | Approved           |
| 0017 | [Regional locales and what we call a CV](0017-regional-locales-and-cv-naming.md) (supersedes 0003)                 | Approved           |
| 0018 | [Locale ids are the lowercase URL segments](0018-locale-ids-are-url-segments.md) (supersedes one sentence of 0017) | Approved           |
| 0019 | [Logo icon redrawn as a staircase of dots ("the steps")](0019-logo-icon-staircase.md)                              | Approved           |
| 0023 | [Run `pnpm check` on every pull request](0023-pull-request-checks.md) (0020–0022 are held by open PR #56)          | Approved           |

## Still to decide (before the specs that need them)

| Topic                                                              | Needed by                  |
| ------------------------------------------------------------------ | -------------------------- |
| App shell and navigation                                           | Any screen                 |
| CV templates and their typography                                  | Resume builder             |
| AI provider, prompts, cost limits and data handling                | Tailoring, letters, import |
| Country format rules, France and US first (0005)                   | Country CV formats         |
| Job sources and their licences                                     | Job matches                |
| How approved applications are sent                                 | Approval-based apply       |
| Payments for the pass (cards first; mobile money for Africa, 0005) | Paid pass                  |
| Transactional email and scheduling                                 | Alerts, follow-ups         |
| Analytics and error tracking                                       | Launch                     |
| Privacy, consent and data deletion                                 | Launch                     |
