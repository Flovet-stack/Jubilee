# Specs

One spec per task. A task is the smallest piece of work that can be built, reviewed and merged on its own. Format: product-team skill, Workflow D.

## Naming

`NN-short-name.md`: a two-digit sequence number and a short kebab-case name. Numbers are never reused.

## Rules

- A spec is written only after the decisions it needs are logged. It links them and never restates them.
- Agents build only what the current spec asks (see `CLAUDE.md`).
- A spec never changes `PROJECT_BRIEF.md`.
- Every spec ends with a **Check** section: the commands that must pass and the end-to-end proof.
- Every spec is reviewed with the `reviewer` skill. The status line records the final score.

## Status

| Status          | Meaning                                                             |
| --------------- | ------------------------------------------------------------------- |
| `Blocked`       | Written, but a decision it needs isn't approved yet. Say which one. |
| `Ready`         | Every decision it links is approved. It can be built.               |
| `In progress`   | A builder is working on it.                                         |
| `Done (NN/100)` | Reviewed at 90 or more. Record the score and the date.              |
| `Dropped`       | Won't be built. Say why. The number is never reused.                |

| Spec                                                                        | Status        |
| --------------------------------------------------------------------------- | ------------- |
| [01: Foundations](01-foundations.md)                                        | Done (92/100) |
| [02: Auth database](02-auth-database.md)                                    | Done (96/100) |
| [03: Design system](03-design-system.md)                                    | Done (96/100) |
| [04: Privacy page](04-privacy-page.md)                                      | Done (91/100) |
| [05: Sign-in](05-sign-in.md)                                                | In progress   |
| [06: Sign-in refresh](06-sign-in-refresh.md)                                | In progress   |
| [07: Terms page](07-terms-page.md)                                          | In progress   |
| [08: Regional locales](08-regional-locales.md)                              | Done (96/100) |
| [09: CV schema](09-cv-schema.md)                                            | Done (96/100) |
| [10: Brand assets](10-brand-assets.md)                                      | Done (97/100) |
| [11: Pull request checks](11-pull-request-checks.md)                        | Done (97/100) |
| [12: Control sizes and radius](12-control-sizes-and-radius.md)              | Done (93/100) |
| [13: Phone, date and password fields](13-phone-date-and-password-fields.md) | Done (98/100) |
| [14: CV builder](14-cv-builder.md)                                          | Done (91/100) |
| [15: App shell and sidebar](15-app-shell.md)                                | Done (93/100) |
| [16: Button spacing](16-button-spacing.md)                                  | Done (94/100) |
| [17: Type spacing in every control](17-type-spacing-everywhere.md)          | Done (96/100) |
| [18: Icon size from the font size](18-icon-size.md)                         | Done (97/100) |

Planned next (each needs its decisions first): LinkedIn import, country formats, tailoring and letters, job matches, approval-based apply, tracker, follow-ups, pass and payments.
