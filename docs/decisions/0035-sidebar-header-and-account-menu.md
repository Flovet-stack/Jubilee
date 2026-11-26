# 0035: Sidebar header and a flush account menu with a language submenu

- **Status:** Approved
- **Proposed:** 2026-11-26 by the product team (roles: UX, UI, Copy, Frontend)
- **Approved:** 2026-11-26 by Flovet
- **Supersedes:** parts of 0027 (the collapse button in the collapsed rail, the account menu's language switch and footer)
- **Specs:** specs/23-sidebar-account-menu.md

## Context

Flovet's review of the sidebar (2026-11-26):

1. The account button needs an up/down chevron icon on its right.
2. In the collapsed rail, the collapse toggle stays visible. Instead, the logo mark should reopen the sidebar.
3. The logo is too big in both states; it should be in proportion with the rows.
4. The account menu should:
   - have a background one shade lighter than the dashboard;
   - have no inner padding, so rows and dividers touch its border;
   - be no wider than the sidebar.
5. The menu's order becomes:
   - name and plan;
   - a divider, then Dark mode, with a smaller switch;
   - a divider, then Settings, then Language, which opens a submenu (replacing today's three-way switch) and shows full language names, not "en-gb";
   - a divider, then Sign out.

We choose whether the language submenu opens beside the menu or replaces its content.

## User lens

The user is Amina, the job seeker from the brief.

| Part               | Why she opens it                                                       | How she uses it                                                      | What next                                                               | What we leave out                                                                                                        |
| ------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Account button** | To change a setting or sign out.                                       | Glances at the bottom of the sidebar and clicks her name.            | The up/down chevron tells her it opens a menu, not a page.              | A caret that flips direction (the menu already shows that it's open).                                                    |
| **Collapsed rail** | She collapsed it for room while editing, and now wants her links back. | Clicks the logo, the first thing at the top. `Ctrl/⌘+B` still works. | The sidebar opens where she left it.                                    | The second button in a 56 px rail. The logo doesn't link Home while collapsed; the Home icon below it does.              |
| **Logo**           | Recognition, not a target.                                             | Seen on every page.                                                  | Nothing: it stays quiet.                                                | A logo bigger than the text it sits beside.                                                                              |
| **Account menu**   | Dark mode at night, her language, or sign out.                         | A few seconds, often by mouse; on a phone, from the sheet.           | Each row does one thing; Language shows her choices in words she reads. | Inner padding, a menu wider than her sidebar, the version and Terms footer (Terms stays in the site footer and sign-up). |
| **Language**       | She reads French better, or her CV is for the UK.                      | Opens Language and picks her language by its own name.               | The page reloads in that language, on the same page.                    | Codes ("en-gb"), flags (a flag is a country, not a language), search (3 languages).                                      |

## Research

| Reference                                                               | What they do                                                                                                          | Adopt / adapt / reject  | Why                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Base UI 1.9 Menu** (installed)                                        | `Menu.SubmenuRoot` and `Menu.SubmenuTrigger` open a nested menu beside the parent, with full keyboard support.        | **Reject for Language** | A flyout beside a 248 px sidebar menu leaves its container. On a phone, the sidebar is a full-width sheet, so a flyout has nowhere to go. That breaks Flovet's rule that the menu stays within the sidebar.                                                         |
| **Drill-in panels** (iOS Settings, mobile menus)                        | The submenu replaces the menu's content, with a "‹ Back" row at the top.                                              | **Adopt**               | It stays inside the same box on every screen size. There's no hover gap to cross: cascading flyouts close when the pointer drifts off (Framer on cursor paths; Drupal and WordPress reports of submenus vanishing). One mechanism covers mouse, keyboard and touch. |
| **Language selectors** (SimpleLocalize, Localize, Localizely on Airbnb) | Each language in its own language ("Français"); no flags; a dropdown for 2–4 languages and search only from about 10. | **Adopt**               | Our 3 locales already have names in `localePicker.names`: "English (United States)", "English (United Kingdom)", "Français (France)".                                                                                                                               |
| **Our type spacing (0029, 0030)**                                       | Padding and icon size come from the font size.                                                                        | **Adopt**               | Rows go edge to edge and keep their padding from the formula. The switch, logo and chevron are sized from the 14 px row type (0033).                                                                                                                                |

Sources (opened or read in results, 2026-11-26):

- https://base-ui.com/react/components/menu
- https://www.framer.com/blog/cursor-trajectory/
- https://www.drupal.org/node/359084
- https://simplelocalize.io/blog/posts/language-selector-best-practices/
- https://localizely.com/blog/designing-an-effective-language-selector/
- https://www.linguise.com/blog/guide/best-practices-designing-language-selector/

## Options for Language

1. **Flyout beside the menu (Base UI submenu).** It's the desktop convention, but it leaves the sidebar's width, has no room on a phone, and risks hover gaps.
2. **Drill-in: the menu's content becomes the language list (chosen).** It stays inside one box, works the same at every size, and Back returns to the menu.
3. **Inline expand under the Language row.** It's simple, but it pushes Sign out down and changes the menu's height while she reads.

## Decision

**Account button**

- An up/down chevron (Hugeicons "unfold more" style, added to our icon set like the others) sits at the right, muted, sized by 0030.
- In the collapsed rail, only the avatar shows.

**Header**

- **Expanded:** the logo (a home link), the notifications bell and the collapse toggle, as now.
- **Collapsed:** only the logo mark, which becomes the expand button. Its accessible name is "Expand sidebar", it shows a tooltip, and it keeps the toggle's `aria-expanded`. The separate toggle is gone.
- **Logo size:**
  - The mark is 20 px, the same as a row icon at 14 px.
  - The full logo is 18 px tall, so its wordmark's letters match the row labels.

**Account menu**

- **Background:** a new `--menu` token, one step lighter than the desk. Light: #ffffff. Dark: #1f1f1f, against the #171717 desk.
- **Edges:** border `--line`, radius `--radius-card`, and no padding. Rows and dividers run edge to edge, and the popup clips its first and last rows to its radius.
- **Width:** the expanded sidebar's width minus its gutters. From the collapsed rail it opens to the side at that same width.
- **Order:**
  1. Avatar, name, and plan badge.
  2. Divider, then Dark mode. The switch is sized by the type (track 20 × 34 px, thumb 14 px).
  3. Divider, then Settings, then Language. The Language row shows the current language name, muted, and a `›` chevron.
  4. Divider, then Sign out (danger).
- **Left out:** the version and Terms footer. Terms stays in the site footer and on sign-up.

**Language panel (drill-in)**

- Choosing Language replaces the menu's content with:
  - a "‹ Language" back row at the top;
  - a divider;
  - one row per locale, by its own name, with a check on the current one.
- **Keyboard:**
  - Enter or → on Language opens the panel.
  - ← or Escape returns to the menu, with focus back on Language.
  - A second Escape closes the menu.
- The menu's height animates between the two panels, with no movement under reduced motion.
- Picking a language keeps the current path (0017) and closes the menu.

## Consequences

- One new token (`--menu`) and one new icon. The switch gets a size from the type.
- The menu stops being a free-width popover with padding. Other menus (notifications, the collapsed CV list) don't change here.
- The collapsed rail has one button fewer. The logo's link to Home works only while expanded.
- A review checks:
  - no inner padding, and the menu is no wider than the sidebar;
  - the drill-in works with mouse, keyboard, touch and screen reader (focus moves to the back row);
  - full language names in all three locales;
  - light and dark, at 390 and 1440 px.
