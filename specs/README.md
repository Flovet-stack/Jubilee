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

| Spec                                     | Status                  |
| ---------------------------------------- | ----------------------- |
| [01: Foundations](01-foundations.md)     | Done (92/100)           |
| [02: Auth database](02-auth-database.md) | Done (96/100)           |
| [03: Design system](03-design-system.md) | Done (96/100)           |
| [04: Privacy page](04-privacy-page.md)   | Blocked (facts missing) |

Planned next (each needs its decisions first): sign-in, app shell, CV builder, LinkedIn import, country formats, tailoring and letters, job matches, approval-based apply, tracker, follow-ups, pass and payments.
