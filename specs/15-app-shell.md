# 15: App shell and sidebar

Status: Not started · Written: 2026-11-24

## Goal

Give every signed-in page one calm frame: a grey desk with one white working window, and a sidebar that takes the user to the places that matter in the job search: Home, Job search, Applications tracker, To approve, and their CVs. With this frame in place, every later feature only has to fill its content window.

## User lens

The full lens, with a table for every part, is in [0027](../docs/decisions/0027-app-shell-and-sidebar.md#user-lens). For this build:

1. **Why would Amina open it?** To see where she stands, act on what's waiting, or reach her CV quickly. She is often tired from a search that mostly answers with silence.
2. **How does she use it?** Short sessions. In the evening on a laptop, where she often collapses the sidebar while editing a CV. On the metro on a phone, one-handed.
3. **What does she want next, and how do we take her there?** Every link goes straight to its page. Each CV in the sidebar opens its editor. With no CVs, one button starts her first. Help and her account are always at the bottom.
4. **What do we leave out?** Everything in Out of scope below. In particular, no red badges, no counts that ask nothing of her, and no rejection notices.

## Decisions

Implements [0027](../docs/decisions/0027-app-shell-and-sidebar.md). Builds on:

- [0007](../docs/decisions/0007-visual-foundations.md) and [0008](../docs/decisions/0008-interaction-disclosure-and-space.md): tokens, one violet action per screen, space
- [0009](../docs/decisions/0009-design-system-components-icons-motion.md): Base UI, Hugeicons, motion
- [0020](../docs/decisions/0020-control-sizes-and-density.md) and [0022](../docs/decisions/0022-corner-radius-by-size.md): sizes and radius
- [0017](../docs/decisions/0017-regional-locales-and-cv-naming.md): "resume" (en-us) and "CV" (en-gb, fr-fr)
- [0012](../docs/decisions/0012-sign-in-flow-and-screens.md): the `(app)` guard stays as it is

## Acceptance criteria

1. **Shell layout.** `src/app/[locale]/(app)/layout.tsx` renders the shell around every `(app)` page and keeps the existing sign-in guard. The shell lives in `src/features/shell/` as reusable pieces: the frame, the sidebar, the nav link, the CV list and the account menu.
2. **Frame at 1024 px and wider**, as in 0027:
   - an 8 px inset on `--well`;
   - the content window is `--card` with a 1 px `--line` border and `--radius-box`;
   - the window scrolls inside itself, with `overscroll-behavior: contain`, and the document body never scrolls.
3. **Top row:**
   - The logo mark and wordmark link to Home.
   - A notifications `IconButton` (bell) opens a Base UI Popover with the empty state "Nothing new". No notification events exist yet, so there is no unread dot.
   - A collapse `IconButton`.
4. **Main links**, in this order:

   | Link                 | Path            |
   | -------------------- | --------------- |
   | Home                 | `/home`         |
   | Job search           | `/jobs`         |
   | Applications tracker | `/applications` |
   | To approve           | `/to-approve`   |
   - Each link is a 20 px icon and a label.
   - The active link has `aria-current="page"` and the violet active style. A nested path such as `/cvs/[id]` marks no main link.
   - The To approve count is built as a neutral `Badge` prop but hidden, because there is no data yet.

5. **Placeholder pages** for `/jobs`, `/applications` and `/to-approve`:
   - each has its page title and one plain sentence saying what will appear there (copy in the message files);
   - no "Coming soon" banners and no buttons;
   - each is `noindex`.
6. **Saved CVs section:**
   - **Heading:** "Saved resumes" in en-us, "Saved CVs" in en-gb, "CV enregistrés" in fr-fr. The `+` icon button beside it links to `/cvs/new` and is labelled "Create resume" or "Create CV".
   - **Rows:** each row comes from `listCvs()` and links to `/cvs/[id]`. It shows the title and a muted language and market tag. The row for the open CV is marked current.
   - **Long lists:** past 8 rows, the list scrolls inside the section.
   - **Empty:** one full-width primary `ButtonLink` to `/cvs/new`, with the muted line "Start from your LinkedIn or from scratch."
   - **Error:** a one-line message with a retry link, in place of the list. The rest of the shell still renders.
   - **Loading:** a skeleton of three rows inside `<Suspense>`.
7. **Bottom of the sidebar:**
   - **Help:** a link to `mailto:` the site's support email, reusing `site.supportEmail` from sign-in.
   - **Account button:** first name from `getGreetingName`, with initials as the avatar. It opens a Base UI Menu:
     - Settings, linking to a placeholder `/settings` page built like criterion 5;
     - Language and country: the three locales, switching to the same path in the chosen locale;
     - Sign out, using the existing `signOut` action.
8. **Collapse:**
   - The rail is 56 px, with icon-only links. Each one keeps its accessible name and gets a right-side `Tooltip`.
   - The CV section becomes a "CVs" icon that opens the list in a Popover, plus the `+`.
   - The state is saved in a first-party cookie, `shell-collapsed`, which the server reads, so a reload shows no flash.
   - `Ctrl/⌘+B` toggles it instantly. The button animates the width over 200 ms with `--ease-out` and fades the labels. Under reduced motion it cross-fades only.
9. **Below 1024 px:**
   - the frame has no inset, radius or border;
   - a top bar holds the menu button, the page title and notifications;
   - the menu opens the expanded sidebar as a left `Sheet` (Base UI Dialog) that closes on navigation. It enters over 250 ms and exits faster.
10. **Home and the editor in the shell:**
    - **Home:** keeps its greeting and CV list. Its Sign out button goes (it now lives in the account menu). Its "Create a CV" button becomes secondary when the sidebar's empty-state button is showing, so the screen keeps one violet action.
    - **The CV editor:** works inside the window at 1024 px and up, with the sidebar expanded and collapsed. Its preview stays sticky inside the window's scroll.
11. **Copy:** every string lives under `shell.*` (plus the placeholder pages) in `en.json`, `en-GB.json` and `fr.json`. "Resume" and "CV" follow 0017.
12. **`/design-system`** shows the sidebar expanded and collapsed, with and without CVs, plus the account menu and the notifications empty state, light and dark.
13. **Tests (Vitest):**
    - which link is active for a path, including nested and locale-prefixed paths;
    - the locale switch keeps the path;
    - the collapse cookie is parsed safely, with a missing or garbage value counting as expanded.

## Out of scope

- Real notifications, unread dots and the queue count (each feature's spec feeds them).
- The pages for Job search, Applications tracker and To approve, a full Settings page, Plan and pass (it appears when the pass ships), and a help centre.
- Home's redesign as a "where you stand" page (its own spec).
- Search, a command palette, and keyboard shortcuts other than `Ctrl/⌘+B`.
- Renaming, deleting or duplicating CVs from the sidebar.
- Interviews to test the User lens (recommended before the queue and notifications specs).

## Edge cases

- **Long names:** a long CV title or user name truncates on one line, and the full text is available as a tooltip or `title`. French labels are about 30% longer and must not wrap the main links at 248 px.
- **Many CVs:** 50 CVs scroll inside the section, and Help and the account stay pinned.
- **No name:** the user has no `full_name`, so the avatar shows a person icon and the button reads "Account".
- **Short windows:** at 1024×600 the sidebar scrolls as a whole, and the bottom items stay reachable.
- **Collapsed popovers:** in the collapsed rail, tooltips don't cover the popover they open, and Escape returns focus to the trigger.
- **Phone sheet:** the sheet traps focus, Escape closes it, and the page behind doesn't scroll.
- **Touch:** every target is at least 44 px (0020).
- **Bad cookie:** an unknown cookie value counts as expanded.
- **Signed out mid-session:** the guard still redirects, and the shell never renders for a guest.
- **Keyboard:** Tab reaches the top row, the links, the CVs, Help and the account, in that order, with a visible focus ring.

## Files and patterns to follow

- `src/app/[locale]/(app)/layout.tsx`: the guard to keep.
- Existing pages: `home/page.tsx` and `cvs/[id]/page.tsx`.
- `src/features/cv/queries.ts` `listCvs()`, and `src/features/auth/queries.ts` `getGreetingName`. Data access stays in `queries.ts` and `actions.ts` (0002).
- UI: `src/components/ui/menu.tsx`, `tooltip.tsx`, `dialog.tsx` (the sheet), `badge.tsx`, `button.tsx` (`IconButton`, `ButtonLink`).
- Icons: `src/components/icons/` (home, search, briefcase-business, circle-check, file-text, plus, bell, circle-question-mark, user, settings, menu). A sidebar-panel icon for collapse is drawn the same way, with the same licence notice.
- Next.js docs in `node_modules/next/dist/docs/`: layouts, `cookies()` with `cacheComponents` (read inside `<Suspense>`), and `usePathname` for the active link.
- `site.supportEmail` as used in `(auth)/sign-in/page.tsx`.

## Boundaries

- **Always:**
  - tokens only;
  - all copy through the message files;
  - Base UI for the popovers, menu and sheet;
  - Server Components by default, with only the interactive pieces as client components.
- **Ask first:**
  - any new dependency;
  - storing the collapse state anywhere other than a first-party cookie;
  - any change to the guard.
- **Never:**
  - red badges, counts or urgency copy;
  - a rejection notice;
  - an "Upgrade" prompt in the sidebar;
  - a second violet button on the same screen;
  - hover-only labels on touch.

## Check

- `pnpm check` passes.
- Screenshots at 390 px and 1440 px, light and dark:
  - expanded with CVs;
  - expanded with no CVs;
  - collapsed;
  - the account menu open;
  - the phone sheet open.
- Also at 1024 px with the editor open.
- Keyboard-only walk-through recorded in the log entry.
- A reviewer run against this spec and 0027 scores 90 or more.
