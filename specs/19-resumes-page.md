# 19: Resumes page and a five-row sidebar list

Status: Not started · Written: 2026-11-25

## Goal

Keep the sidebar short and steady, and give Amina one place that holds every resume, a search, and the way to create a new one.

## User lens

The full lens is in [0031](../docs/decisions/0031-resumes-page-and-sidebar-cap.md#user-lens). In short: she comes to find one CV fast or to start a new one; she scans before she types; she goes next to the editor or to create; we leave out thumbnails, folders, sort, bulk actions, row menus and "coming soon" create options.

## Decisions

Implements [0031](../docs/decisions/0031-resumes-page-and-sidebar-cap.md). Builds on [0027](../docs/decisions/0027-app-shell-and-sidebar.md) (shell), [0007](../docs/decisions/0007-visual-foundations.md) (one violet action), [0017](../docs/decisions/0017-regional-locales-and-cv-naming.md) (resume / CV), [0029](../docs/decisions/0029-type-spacing-for-every-control.md) and [0030](../docs/decisions/0030-icon-size-from-font-size.md) (control spacing).

## Acceptance criteria

1. The sidebar lists at most 5 resumes, most recently edited first, with no bottom fade, no scrolling and no filter field.
2. With 6 or more resumes, a "View all resumes (N)" row (en-gb "View all CVs (N)", fr "Voir tous les CV (N)") sits under the five and links to `/{locale}/cvs`. N is the total. It is styled as a sidebar row and marked active on that page.
3. With 5 or fewer, there's no link. Empty state unchanged.
4. The collapsed sidebar's popover shows the same five and the same link.
5. `/{locale}/cvs` exists inside the shell: title, one primary "Create resume" / "Create CV" button to `/cvs/new`, then the list.
6. From 6 resumes, the page has a labelled search field. Matching uses `matchesCv`. A live count ("12 resumes") updates as she types; no match shows a line with a "Clear search" button.
7. Each row: "Headline | Name" (`cvRowText`), and "Edited …" relative time in the locale, muted. The whole row is one link to the editor. Long text wraps.
8. States: loading skeleton, error with retry, empty (same create button and reassurance line as the sidebar; the page then has only that one violet button).
9. At 390 px the edited time sits under the text; nothing scrolls sideways.
10. All copy in `en.json`, `en-GB.json`, `fr.json`; counts use ICU plurals.
11. Unit tests for the five-cap and link rule, and for the count text.

## Out of scope

Rename, duplicate, delete; sort and filter controls; thumbnails; import options (#16); any differentiator beyond the edited time.

## Edge cases

Exactly 5 and 6 resumes; 0; search with accents and spaces only; a resume edited just now ("Edited just now"); headline and name both blank (falls back to the title); a resume created or edited elsewhere then the sidebar refreshes on navigation.

## Files and patterns to follow

- `src/features/shell/logic.ts` (replace `CV_LIST_VISIBLE`), `components/shell.tsx` (drop `CvList` filter and `jb-scroll-fade`).
- New `src/app/[locale]/(app)/cvs/page.tsx`, server component, list behind `<Suspense>`; client search in `src/features/cv/components/`.
- `listCvs` already returns `updatedAt`; no query or schema change.
- Remove unused `.jb-scroll-fade` CSS and the `shell.cvs.filter` / `noMatch` keys if nothing else uses them.
- Update the design-system shell demo's "Many CVs" state.

## Boundaries

- Always: type-spacing skill for every control; tokens only.
- Ask first: any schema or query change, any new dependency.
- Never: hard-coded copy, `any`, push to `main`.

## Check

- `pnpm check` passes.
- Screenshots of the sidebar (5 rows + link) and the Resumes page (search, no match, empty) at 390 and 1440 px, light and dark, on the test account (12 resumes).
- Reviewer skill at 90 or more.
