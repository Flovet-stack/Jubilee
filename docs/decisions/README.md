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

| #    | Decision                                                                                                                                                                                      | Status                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 0001 | [Stack and tooling](0001-stack-and-tooling.md)                                                                                                                                                | Approved                                |
| 0002 | [Project structure](0002-project-structure.md)                                                                                                                                                | Approved                                |
| 0003 | [Internationalisation](0003-internationalisation.md)                                                                                                                                          | Superseded by 0017                      |
| 0004 | [Auth, database and environment](0004-auth-database-and-env.md)                                                                                                                               | Approved                                |
| 0005 | [Target markets and rollout order](0005-launch-markets.md)                                                                                                                                    | Approved                                |
| 0006 | [Account data and the email sign-in code](0006-account-data-and-email-code.md)                                                                                                                | Approved                                |
| 0007 | [Visual foundations](0007-visual-foundations.md) (iconography superseded by 0009)                                                                                                             | Approved                                |
| 0008 | [Interaction, disclosure, explicitness and space](0008-interaction-disclosure-and-space.md)                                                                                                   | Approved                                |
| 0009 | [Design system: tokens, components, animated icons and motion](0009-design-system-components-icons-motion.md)                                                                                 | Approved                                |
| 0010 | [Logo and brand identity ("the path")](0010-logo-and-brand-identity.md)                                                                                                                       | Approved                                |
| 0011 | [Privacy policy page](0011-privacy-policy-page.md)                                                                                                                                            | Approved                                |
| 0012 | [Sign-in flow and screens](0012-sign-in-flow-and-screens.md)                                                                                                                                  | Approved                                |
| 0013 | [Sign-in page refresh and word spacing](0013-sign-in-page-refresh-and-word-spacing.md)                                                                                                        | Approved                                |
| 0014 | [Terms of service page](0014-terms-of-service-page.md)                                                                                                                                        | Approved                                |
| 0015 | [Keep the font's default word spacing](0015-keep-default-word-spacing.md)                                                                                                                     | Approved                                |
| 0016 | [CV data model and PDF rendering](0016-cv-data-model-and-pdf-rendering.md)                                                                                                                    | Approved                                |
| 0017 | [Regional locales and what we call a CV](0017-regional-locales-and-cv-naming.md) (supersedes 0003)                                                                                            | Approved                                |
| 0018 | [Locale ids are the lowercase URL segments](0018-locale-ids-are-url-segments.md) (supersedes one sentence of 0017)                                                                            | Approved                                |
| 0019 | [Logo icon redrawn as a staircase of dots ("the steps")](0019-logo-icon-staircase.md)                                                                                                         | Approved                                |
| 0020 | [Control sizes by screen type and pointer](0020-control-sizes-and-density.md) (supersedes 0009's control heights; mouse heights superseded by 0028)                                           | Approved                                |
| 0021 | [Phone, date and password fields](0021-phone-date-and-password-fields.md)                                                                                                                     | Approved                                |
| 0022 | [Corner radius by size](0022-corner-radius-by-size.md) (supersedes 0007's control and card radius)                                                                                            | Approved                                |
| 0023 | [Run `pnpm check` on every pull request](0023-pull-request-checks.md)                                                                                                                         | Approved                                |
| 0024 | [CV builder: guided editor, live preview and autosave](0024-cv-builder-editor.md)                                                                                                             | Approved                                |
| 0025 | [The first CV template and its typography](0025-first-cv-template-and-typography.md) (partly superseded by 0026)                                                                              | Approved                                |
| 0026 | [CV entry layout in four corners, tighter body lines](0026-cv-entry-layout.md)                                                                                                                | Approved                                |
| 0027 | [App shell and collapsible sidebar](0027-app-shell-and-sidebar.md) (row size superseded by 0029)                                                                                              | Approved                                |
| 0028 | [Button spacing from the type, shorter controls on mouse](0028-button-spacing-from-type.md) (supersedes 0020's mouse heights)                                                                 | Approved (sizes superseded by 0029)     |
| 0029 | [Type spacing for every control, sizes set by font size](0029-type-spacing-for-every-control.md) (supersedes 0028's sizes)                                                                    | Approved (icon size superseded by 0030) |
| 0030 | [Icons sized from the font size, not the line box](0030-icon-size-from-font-size.md) (supersedes 0029's icon size)                                                                            | Approved                                |
| 0031 | [CV editor in two panes, a top bar, and review flags on sections](0031-cv-editor-two-panes-and-review.md) (supersedes parts of 0024 §2–3)                                                     | Approved                                |
| 0032 | [A Resumes page, and five resumes in the sidebar](0032-resumes-page-and-sidebar-cap.md)                                                                                                       | Approved                                |
| 0033 | [A 14 px base and a type scale set by hierarchy](0033-type-scale-from-14px.md) (supersedes 0007's type scale)                                                                                 | Approved                                |
| 0034 | [Grid Auditor overlay, always in dev, opt-in in production](0034-grid-auditor-dev-overlay.md)                                                                                                 | Approved                                |
| 0035 | [Sidebar header and a flush account menu with a language submenu](0035-sidebar-header-and-account-menu.md) (supersedes parts of 0027)                                                         | Approved                                |
| 0036 | [A swappable AI layer, routed per task, starting on Claude](0036-ai-provider-and-integration.md)                                                                                              | Approved                                |
| 0037 | [Layered control surfaces, and a Geist and radius trial](0037-layered-control-surfaces-and-geist-trial.md)                                                                                    | Approved                                |
| 0038 | [PDF download: one menu item, a file named after the person](0038-pdf-download-flow.md)                                                                                                       | Approved                                |
| 0039 | [CV editor with flush panes, collapsible sections, drag to reorder and a show toggle per entry](0039-cv-editor-flush-panes-and-collapsible-sections.md) (supersedes parts of 0031 §2)         | Approved                                |
| 0040 | [Groq's free tier for AI evals, made-up data only](0040-groq-free-tier-for-ai-evals.md)                                                                                                       | Superseded by 0041                      |
| 0041 | [Groq as the default AI provider while Jubilee has test users only](0041-groq-default-while-testing.md)                                                                                       | Approved                                |
| 0042 | [Editor top bar with a Download button, findings coloured by severity, flush preview pane](0042-editor-top-bar-download-and-finding-severity.md) (supersedes parts of 0038 and 0031 §3)       | Approved                                |
| 0043 | [Entries grouped in one box, header hover, a flat drag handle and a labelled Download button](0043-section-list-grouped-entries-and-labelled-download.md) (supersedes parts of 0039 and 0042) | Approved                                |
| 0044 | [A paginated CV preview, page by page as the PDF will print](0044-paginated-cv-preview.md) (supersedes 0024's single-sheet preview)                                                           | Approved                                |
| 0045 | [Larger icons in icon-only buttons, and a heavier stroke](0045-larger-icons-in-icon-buttons-and-heavier-stroke.md) (supersedes 0030 for icon-only controls)                                   | Approved                                |
| 0046 | [Raised controls in light mode get an off-white fill](0046-light-control-fill-off-white.md) (supersedes 0037's light control values)                                                          | Approved                                |
| 0047 | [The editor fills the window and each pane scrolls on its own](0047-editor-panes-scroll-independently.md) (supersedes 0042's sticky right pane)                                               | Approved                                |
| 0048 | [Skills by category as pills, and section headers on the desk colour](0048-skills-as-pills-and-desk-section-headers.md)                                                                       | Approved                                |
| 0049 | [Where AI goes in the CV editor, and in what order](0049-ai-in-the-cv-editor.md)                                                                                                              | Proposed                                |
| 0050 | [Ways to start a CV, on the Resumes page](0050-ways-to-start-a-cv.md) (supersedes 0032's /cvs/new and 0024's Create a CV step)                                                                | Approved                                |

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
