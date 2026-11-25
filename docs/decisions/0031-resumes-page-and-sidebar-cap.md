# 0031: A Resumes page, and five resumes in the sidebar

- **Status:** Proposed
- **Proposed:** 2026-11-25 by the product team (roles: Product, UX, UI, Copy, Frontend)
- **Approved:**
- **Supersedes:** the long-list part of 0027 (the sidebar's scrolling list, bottom fade and filter field, added after spec 15)
- **Specs:**

## Context

The sidebar's saved-CV list scrolls past 8 rows, fades at the bottom and shows a filter field. Flovet asked (2026-11-25) to remove the fade and the field, show 5 resumes, then a "View all resumes" link to a dedicated page with every resume, a search, and the ways to create one.

Only "Start from scratch" exists today. Import (MVP feature 2, task #16) is planned but not built (`cvs/new/page.tsx`, 0024).

## User lens

The user is Amina (brief): job seeker, on a small laptop or a phone, with several CVs (one per role or market).

| Question                                     | Answer                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why would she open this?**                 | "Where's the CV I sent Acme?" Or she wants a new one for a new kind of role and asks "should I copy one or start fresh?"                                                                                                                                                                  |
| **How is she using it?**                     | In a hurry, before an application. She scans for a headline she knows; she types only when the list is long. Phone width often (assumption: the brief's mobile-first markets).                                                                                                            |
| **What next, and how do we take her there?** | Opening the CV (the row is the link to the editor), or creating one (one create button at the top of the page). From the sidebar, "View all resumes (12)" says how many there are, so she knows the 5 she sees aren't everything.                                                         |
| **What do we leave out?**                    | Thumbnails, folders, tags, sort and filter controls, bulk actions, rename/duplicate/delete menus (they live in the editor or come with their own decision), and greyed-out "coming soon" create options. What tells same-titled rows apart stays with the later decision Flovet deferred. |

## Research

| Reference                             | What they do                                                                                                                                        | Adopt / adapt / reject | Why                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Teal** (help centre; Rezi review)   | A Resume Builder home lists every resume; "New Resume" offers several starting points (blank, from a job description, from a template).             | **Adapt**              | One home for all resumes plus the create entry is what Flovet asked for. We show only the starting points that work today.   |
| **Rezi** (docs)                       | Dashboard holds all resumes; "Create New Resume" opens one form where "Import your existing resume" and the LinkedIn file are options inside it.    | **Adopt**              | Create options live with create, not scattered. When #16 ships, import joins the same create screen.                         |
| **Baymard: truncation**               | Truncation misleads when users think they see everything; a fade draws the eye to the "see more" link; at least ~6 filter values before truncating. | **Adapt**              | Flovet asked for 5 and no fade. A labelled link with the count does the fade's job: it says the list is cut and by how much. |
| **Baymard: "View all" in mobile nav** | Links that just say the category name are overlooked; "See all X" works.                                                                            | **Adopt**              | The link reads "View all resumes" / "View all CVs", never just "More".                                                       |
| **GitLab sidebar**                    | Header fixed; the body changes with context.                                                                                                        | **Adopt**              | The sidebar stays short and steady; the full list belongs on a page.                                                         |

Sources (opened or read in results, 2026-11-25):

- https://help.tealhq.com/en/collections/9568976-resume-builder
- https://www.rezi.ai/posts/teal-review
- https://www.rezi.ai/rezi-docs/create-resume
- https://www.rezi.ai/rezi-docs/importing-your-existing-resume
- https://baymard.com/blog/truncation-design
- https://baymard.com/blog/mobile-main-nav-view-all
- https://design.gitlab.com/usability/navigation-sidebar

## Options

1. **Keep the scrolling list and filter in the sidebar.** No new page. But the sidebar gets long, the fade hides rows, and the filter fights for a narrow column.
2. **Five rows + "View all resumes (N)" + a Resumes page (chosen).** Short sidebar; search gets the room it needs; one place for create.
3. **Five rows + a popover with the full list.** No new route, but a popover is cramped on a phone and can't hold create options.

## Decision

Option 2.

**Sidebar**

- Up to 5 resumes, most recently edited first. No fade, no filter field, no scrolling.
- With more than 5: a quiet link row under them, "View all resumes (12)" (en-gb/fr-fr: "View all CVs (12)", "Voir tous les CV (12)"). It takes the sidebar row style (0029) and goes to `/{locale}/cvs`. It's active (black text) on that page.
- With 5 or fewer: no link. The `+` stays in the heading. The empty state is unchanged.
- Collapsed sidebar: the popover shows the same 5 and the same link.

**Resumes page (`/{locale}/cvs`)**

- Title "Resumes" / "CVs" and one primary "Create resume" / "Create CV" button (the screen's one violet action, 0007). It goes to `/cvs/new`, which holds the create options: "Start from scratch" now, import when #16 ships. No disabled placeholders.
- A search field above the list, case- and accent-insensitive on headline, name and title (the existing `matchesCv`). It shows from 6 resumes, the same point where the sidebar cuts off. It shows the count ("12 resumes") and a no-match line that offers to clear the search.
- One row per resume: "Headline | Name" (the sidebar's text), plus "Edited 3 days ago" muted on the right, so recent work is easy to find. The whole row opens the editor.
- States: loading (row skeletons), error with retry, empty (the same "Create resume" + reassurance line as the sidebar), long text wraps on the page (no marquee; there's room).
- Holds at 360 px: rows stack date under the text.

## Consequences

- Removes the sidebar's filter field, `jb-scroll-fade` and `CV_LIST_VISIBLE = 8`; the sidebar takes 5.
- A new route and a new page; no schema change (`listCvs` already returns `updated_at`, to check in the spec).
- "Edited 3 days ago" is a row detail, not the differentiator Flovet deferred; if that decision picks something else, this line can change.
- Review checks: the link appears only past 5 and shows the right count; search with accents; every state at 390 and 1440 px, light and dark; one violet action per screen.
