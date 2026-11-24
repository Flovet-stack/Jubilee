# 0027: App shell and collapsible sidebar

- **Status:** Approved
- **Proposed:** 2026-11-24 by the product team (roles: UX, UI, Product, Copy, Frontend); revised the same day after Flovet's review
- **Approved:** 2026-11-24 by Flovet
- **Specs:**

## Context

Every signed-in page needs one frame. The design brief left "the app shell and navigation" to its own decision (design-brief.md, Next steps 3; 0007 "not decided here"). Flovet asked for a layout like the reference screenshot: a padded frame on the grey page, a collapsible sidebar on the left, and a white content window, rounded and bordered. The sidebar holds the MVP's places and a "Saved resumes" / "Saved CVs" list with a create action.

## User lens

**User:** Amina, 29, a marketing coordinator in Lyon, six weeks into looking for her next role. She has a paid pass. She uses Jubilee on her laptop in the evening and on her phone on the metro. _Assumption: Amina is a composite persona, not a person we have interviewed. GOV.UK treats anything that doesn't come from users as an assumption to prove. Five interviews with active job seekers should test this lens before the queue and notifications specs._

**How she feels** (written as an adjective plus its cause, the empathy-mapping format):

- **Drained:** applications go out and she mostly hears nothing back. In one 2026 survey, 55% of job seekers named "no response" as their top frustration, and 72% said the search was hurting their mental health. That was a company-commissioned survey, so the numbers are a signal, not proof.
- **Wary:** she worries a tool will send something she hasn't checked and embarrass her in front of a recruiter.
- **Short on time:** she squeezes the search between work and life, a few minutes at a time.

Unemployment is linked to anxiety and depression (commentary citing Mindy Shoss, University of Central Florida). The 2023 study on ghosting found it no worse than a direct rejection. Both can still hurt.

**What that asks of the shell.**

- **Calm:** nothing red, no urgency badges, no "overdue".
- **Control:** nothing leaves without her yes, and she can always see what was sent.
- **Kindness with bad news:** a rejection never pings her.
- **A feeling of progress:** show what she did, not what she failed at.

### The four questions, part by part

| Part                                | 1. Why would Amina open it?                                            | 2. How does she use it?                                   | 3. What does she want next, and how do we take her there?                                           | 4. What do we leave out?                                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Frame** (grey desk, white window) | Something to do with her search.                                       | Laptop: one long session. Phone: quick glances.           | The page she came for, with nothing competing with it.                                              | Decorative chrome, banners, upsells inside the frame.                                                                                     |
| **Logo** (top left)                 | To get back to the start when she's lost.                              | One click.                                                | Home.                                                                                               | Logo animation and taglines.                                                                                                              |
| **Notifications**                   | "Did anything happen?" Silence is what hurts most, so this answers it. | A glance, often from her phone.                           | The item itself: each event links to its card.                                                      | Rejections (she sees them quietly on the tracker). "Someone viewed your profile" noise. Marketing. Red badges. A count: a plain dot only. |
| **Collapse**                        | Her laptop is small and she's editing a CV or reading a job.           | A click, or `Ctrl/⌘+B`.                                   | More room for the content.                                                                          | Auto-collapsing on her behalf.                                                                                                            |
| **Home**                            | "Where do I stand today?"                                              | First stop after the alert email.                         | What's waiting for her yes, then what moved. Home links to both.                                    | Stats that count her failures, such as a response rate or rejections this week (its own spec).                                            |
| **Job search**                      | "Is there anything new worth my time?"                                 | Browses, saves, adjusts what she's looking for.           | A job's match and a tailored application, which lands in "To approve".                              | Endless feeds. Low-fit jobs shown to look busy.                                                                                           |
| **Applications tracker**            | "Where is my application to X?"                                        | Scans the board, opens one card.                          | The application: the CV version sent, the letter, follow-ups, history.                              | Rejected cards in her face: that column folds by default.                                                                                 |
| **To approve**                      | "What needs my yes today?"                                             | A short sitting: approve, edit, skip or snooze each item. | When the queue is empty, a clear "You're done for today", with a link to Applications.              | Expiry countdowns, streaks, guilt for skipping. The count is neutral grey, never red.                                                     |
| **Saved CVs**                       | To fix or download her CV before an application or an interview.       | Opens one, often in a hurry.                              | The editor. Download is one click inside it.                                                        | Tailored versions (they live on their application), version history (in the editor), sharing.                                             |
| **Empty CV state**                  | She's new, and a blank page is daunting.                               | First visit, maybe from LinkedIn.                         | "Create CV", with a one-line reassurance: "Start from your LinkedIn or from scratch."               | Tutorials, tours and checklists in the sidebar.                                                                                           |
| **Help**                            | Something went wrong, or she's afraid something went out wrongly.      | Rarely, and anxious when she does.                        | The help centre, and a person to contact.                                                           | A chatbot as the only route.                                                                                                              |
| **Account**                         | To change a setting, manage her pass, or sign out.                     | Occasionally.                                             | A menu with Settings, Plan and pass (days left stated plainly), Language and country, and Sign out. | Countdown pressure or "Upgrade" nags in the sidebar.                                                                                      |
| **Phone sheet**                     | She's on the metro with one hand free.                                 | Thumb, short bursts.                                      | The page she wants, and the sheet closes.                                                           | A second, different navigation for mobile.                                                                                                |

This lens changed three things in the decision below:

- Notifications never report rejections and show a dot, not a count.
- The queue count is neutral, and an empty queue says she's done.
- The empty CV state carries one line of reassurance.

## Research

| Reference                             | What they do                                                                                                                                                                                                                         | Adopt / adapt / reject | Why                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Flovet's reference (CRM screenshot)   | Grey page. Sidebar sits on the page with no box. Content is a white panel with a 1 px border and rounded corners, inset about 8 px. The sidebar has main links, a "Saved views" list with a `+`, and utilities pinned to the bottom. | Adopt                  | It is the brief's "quiet desk": grey well around one white working surface.                                                            |
| NN/g, vertical navigation             | Left vertical nav suits growing IAs. Keep it visible on desktop, front-load keywords, put less-important links at the bottom.                                                                                                        | Adopt                  | Jubilee's IA will grow past the MVP.                                                                                                   |
| NN/g, icon usability                  | Labels visible at all times. Icon-only rails only for apps used daily. Hover labels fail on touch.                                                                                                                                   | Adapt                  | Expanded with labels by default. The icon rail is the user's choice, with tooltips and accessible names.                               |
| Linear (conceptual model)             | Workspace menu in the top-left corner. Views listed under the main links.                                                                                                                                                            | Adapt                  | Saved CVs go under the links. Flovet moved the account to the bottom: the top row holds the brand and the two actions used most often. |
| Our MVP (`docs/product/mvp.md` 8, 10) | Feature 8 is "a daily queue of high-fit jobs with CV and letter ready". Feature 10 has follow-ups "drafted … the user reviews and sends".                                                                                            | Adopt                  | The queue is already in the approved MVP. Follow-ups are the same act: review a draft, say yes.                                        |
| Material 3 drawer, Apple HIG sidebars | The pages render with JavaScript only, so no text was read.                                                                                                                                                                          | Not used               | Not cited as evidence.                                                                                                                 |

| NN/g, empathy mapping | One user per map. Separate evidence from assumption. Write each feeling as an adjective plus its cause. Treat gaps as research to do. | Adopt | It shaped the "How she feels" block above. |
| GOV.UK, learning user needs | Opinions that don't come from users are assumptions to prove. Write needs in the user's words. | Adopt | Amina is marked as an assumption, and interviews are planned. |
| Indi Young (homepage) | Understand people's context, not only how they use the product. | Adopt | Lens column 2. Only the homepage was read, not the full method. |

Sources (opened):

- https://www.nngroup.com/articles/empathy-mapping/
- https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs
- https://www.indiyoung.com/
- Search results summarising the job-seeker sources (not opened): the Resume Genius 2026 survey, reported by Benefit News and CPA Practice Advisor; the 2023 Routledge Open Research ghosting study; Inquirer, 23 September 2026, citing Mindy Shoss

- https://www.nngroup.com/articles/vertical-nav/
- https://www.nngroup.com/articles/icon-usability/
- https://linear.app/docs/conceptual-model
- `docs/product/mvp.md`

## The "To approve" queue

**What's in it.** Everything Jubilee has prepared that can't go out without the user's yes, newest first and grouped by day:

1. **Applications to send.** One card per high-fit job: the role, the company, the match score, the tailored CV version and the cover letter. The card offers approve, edit, or skip. Approving sends the application, or opens it pre-filled.
2. **Follow-ups to send.** A drafted follow-up, about 7 days after an application with no reply, or a thank-you note on interview day. The card shows the email and offers send, edit, or snooze.

Nothing else goes in the queue. Cover letters are not separate items; each one is part of its application card.

**Why a dedicated screen, as well as the item in context.** Each item also shows on its own application in the tracker, as you proposed. The queue adds one place to act on all of them:

- **It's the product's core loop and the paywall moment** (mvp.md: "Users should reach the paywall moment, their first batch of tailored applications, as fast as possible"). Reviewing a batch of five in one sitting takes minutes. Opening five tracker cards one by one to find the pending ones takes much longer.
- **Not-yet-approved jobs aren't applications yet.** Putting them on the tracker board would mix things Amina sent with things she hasn't decided on, and blur what "Applied" means. The brief's stages start at "saved".
- **"Nothing pending" needs one place to say it.** Without a queue, she has to check every application to know she's done for the day.
- **Recruiter-safe positioning** (brief) depends on a visible, deliberate yes for each item. One screen built for that yes makes it obvious.

So each item lives in two places: the queue for doing, and the application for context. Approving in one updates the other.

**Follow-ups page:** dropped. Follow-ups are queue items while they wait, and part of the application's history once sent.

## Decision

The padded frame with the sidebar on the left, as below.

**Frame (1024 px and wider)**

- The page is `--well`. The shell pads 8 px on all sides. The sidebar sits on the well with no border.
- The content window is `--card` with a 1 px `--line` border and `--radius-box` (12 px). It fills the height and scrolls inside itself (`overscroll-behavior: contain`). The page never scrolls.
- The same tokens apply in dark mode.

**Sidebar, expanded (248 px)**, top to bottom:

1. **Top row.**
   - On the left, the logo (mark and wordmark), linking to Home.
   - On the right, two icon buttons:
     - **Notifications** (bell). A plain dot shows when something is unread; there's no count and no red. It opens a popover of in-app events, each linking to its item:
       - new items in the queue;
       - a reply or an interview logged;
       - a follow-up ready, written as an offer ("It's been 7 days. Nudge Acme?") rather than "No reply".
       - It never reports a rejection: rejections show quietly on the tracker.
       - Notifications are in-app only. Email alerts are feature 7's decision.
     - **Collapse sidebar.**
2. **Main links.** A 20 px icon and a label on each 36 px row. The active link has `--violet` text and icon on a `wash` background.
   - Home
   - Job search (matches and alerts, feature 7)
   - Applications tracker (the Kanban board, feature 9). Each application's detail holds its CV version, cover letter and follow-ups.
   - To approve (the queue above), with a neutral grey count of waiting items. The count is hidden at zero, and the page then says "You're done for today".
3. **"Saved resumes" (en-us) or "Saved CVs" (en-gb, fr-fr: "CV enregistrés").**
   - The heading is small and muted, with a `+` icon button on its right ("Create resume" / "Create CV").
   - Below it, one row per CV: its name and a muted language and country tag (FR / US). Tailored versions aren't listed; they live on their application.
   - Past 8 CVs, the list scrolls inside its section.
   - **No CVs yet:** the list is replaced by one full-width primary button, "Create resume" / "Create CV", with one muted line under it: "Start from your LinkedIn or from scratch." This is the screen's one violet action (0007), so pages shown beside it use secondary buttons for the same task.
4. **Pinned to the bottom:**
   - **Help** (support centre).
   - **Account button:** avatar, name and plan. It opens a menu with Settings, Plan and pass, Language and country, and Sign out.

**Sidebar, collapsed**

- A 56 px icon rail. The top row stacks the logo mark, notifications and expand. Each icon keeps its accessible name and gets a right-side tooltip.
- The CV section becomes one "CVs" icon that opens the list in a popover, plus the `+`.
- The state is the user's choice, saved in a first-party cookie so the server renders it without a flash. The default is expanded.
- `Ctrl/⌘ + B` toggles it.

**Below 1024 px**

- No frame padding. The content is full-bleed, with no radius or border.
- A top bar shows a menu button, the page title and notifications.
- The menu opens the expanded sidebar as a left sheet (Base UI Dialog). The sheet closes when the user navigates.

**Motion** (0009, Emil Kowalski)

- Collapsing or expanding with the mouse animates the width over 200 ms with `--ease-out`, and the labels fade.
- The keyboard shortcut switches instantly.
- The sheet enters over 250 ms and exits faster.
- With reduced motion, every one of these is a cross-fade.

**Copy** lives in the message files under `shell.*`. "Resume" and "CV" follow 0017.

## Consequences

- Every `(app)` page renders inside one shell layout. Pages own only the content window.
- There are four main links. Letters and follow-ups have no pages of their own: they appear on the application detail and, while they wait, in the queue.
- Notifications become a product surface, in-app only. Which events create one is settled in each feature's spec. Until then the bell shows an empty state ("Nothing new").
- The queue count needs a query for waiting items. It stays hidden until the apply and follow-up features exist.
- The Job search, Applications tracker and To approve links lead to placeholder pages until their specs ship. The shell spec builds the frame, the navigation, the notifications popover with its empty state, the account menu and the CV list.
- A review checks:
  - the 8 px frame, the 12 px window radius and the 1 px border;
  - the top row (logo, notifications, collapse);
  - the link order and the active state;
  - keyboard navigation;
  - the collapsed rail's names and tooltips;
  - the empty CV state, with one violet action on the screen;
  - the account menu containing Settings;
  - the sheet below 1024 px;
  - 360, 1024 and 1440 px, in light and dark.
