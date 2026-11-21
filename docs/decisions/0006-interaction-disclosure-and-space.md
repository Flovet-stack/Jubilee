# 0006: Interaction, progressive disclosure, the hierarchy of explicitness and space

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: UX, UI, Copy, Frontend, Product)
- **Revised:** 2026-11-21: grouping now uses Clemta's grey wells with light borders (Flovet's review); colour names follow revised 0005.
- **Approved:** 2026-11-21 by Flovet (in chat, after reviewing the revised sample screens)
- **Specs:** every UI spec

## Context

Flovet asked for a design brief that makes three rules explicit: the adequate use of **spacing**, **progressive disclosure**, and the **hierarchy of explicitness**. They apply to every screen, control and overlay, so they are one decision (as AniKansou 0007 and FlickVale 0009 did).

Jubilee adds something the media products didn't have: **actions with consequences outside the app.** An approved application reaches an employer and can't be recalled. The brief says nothing is submitted without the user's explicit approval, and every AI change to a CV must be "visible and reversible". So explicitness here has two sides: how _visible_ a control is, and how _explicit_ an action is about what it will do.

## Research

| Reference                                                                              | What they say or do                                                                                                                                                                                                                                                                                                                  | Adopt / adapt / reject | Why                                                                                                             |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| NN/g, Progressive disclosure (Nielsen)                                                 | Show the few important options first, the rest on request; split by frequency (task analysis, analytics, usability tests); make the trigger mechanically obvious and label it; **two levels is the practical limit**; staged (wizard) disclosure suits steps with little interdependence and fails when users must go back and forth | Adopt                  | Basis for §2 and the two-step limit; the CV editor is _not_ a locked wizard because users move between sections |
| Will Grant, _101 UX Principles_ #99, and Canonical's "Classify interactions" post      | Decide whether each interaction should be **obvious** (core, every time), **easy** (secondary, quick to reach) or **possible** (rare, discoverable but not prominent)                                                                                                                                                                | Adopt                  | The published framework closest to a "hierarchy of explicitness" (§1a)                                          |
| Material 3 / Android button guidance (search summaries; m3.material.io did not render) | High, medium and low emphasis buttons; one primary action per screen; too many buttons break hierarchy                                                                                                                                                                                                                               | Adopt                  | One `--violet` button per screen (0005)                                                                         |
| Huntr (homepage, text)                                                                 | AI suggestions shown with a plain-language reason; bulk approve or reject; "without losing control"                                                                                                                                                                                                                                  | Adapt                  | Our AI review pattern (§1b): per-line accept/reject with a reason, plus accept all; never applied silently      |
| LazyApply vs Simplify ratings (competitor map: 2.1/5 vs 4.9/5)                         | Review-first auto-apply is trusted; blind mass apply is not                                                                                                                                                                                                                                                                          | Adopt                  | Sending is the most explicit action in the product                                                              |
| NN/g, Visual hierarchy                                                                 | Tight heading-to-content spacing, wider between groups; more breathing room for important elements; enclosure (borders, backgrounds) used sparingly                                                                                                                                                                                  | Adopt                  | §3 space by relationship                                                                                        |
| Laws of UX, Proximity (Gestalt)                                                        | Near things read as related                                                                                                                                                                                                                                                                                                          | Adopt                  | Space separates items inside a group; the well marks the group (§3)                                             |
| NN/g, Form white space                                                                 | Label closer to its field than to the next one; group long forms into chunks of 4–6 fields; labels above fields; never placeholder as label                                                                                                                                                                                          | Adopt                  | The CV builder is mostly forms                                                                                  |
| Atlassian, Carbon, Primer spacing                                                      | Small/medium/large ranges by job; larger steps on larger screens; "clean, calm, and uncluttered"                                                                                                                                                                                                                                     | Adopt                  | §3 ladder and breakpoint jumps                                                                                  |
| Clemta (computed styles, 2026-11-21)                                                   | Grey wells with 1 px light borders hold white cards with the same border; one level of nesting                                                                                                                                                                                                                                       | Adopt                  | Flovet's choice; gives each group a visible edge without heavy boxes                                            |
| Refactoring UI (search summaries; via FlickVale 0009)                                  | Start with too much white space, then remove                                                                                                                                                                                                                                                                                         | Adopt                  | Flovet's rule: when in doubt, take the larger step                                                              |

Sources (opened): https://www.nngroup.com/articles/progressive-disclosure/ · https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ · https://www.nngroup.com/articles/form-design-white-space/ · https://lawsofux.com/law-of-proximity/ · https://huntr.co/ · https://atlassian.design/foundations/spacing · https://carbondesignsystem.com/elements/spacing/overview/ · https://primer.style/product/primitives/size/ · FlickVale `docs/decisions/0009-interaction-and-disclosure.md` and AniKansou `docs/decisions/0007-interaction-and-disclosure.md` (local). Search summaries only: https://ubuntu.com/blog/ux-deep-dive-classify-interactions-for-a-more-intuitive-user-interface and the Packt listing of _101 UX Principles_ #99 (book paywalled); Material/Android button guidance. "Hierarchy of explicitness" is Flovet's term; no published source uses it, so §1 is our definition built on the sources above.

## Decision

### 1. The hierarchy of explicitness

Every control in a spec gets **two labels**: a visibility tier and a consequence level.

#### 1a. Visibility tier: how easy it is to find (by frequency and reach)

| Tier                                                                                                       | Rule                      | Jubilee examples                                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Obvious**: visible, labelled, large                                                                      | Most users, most visits   | Approve and send, Skip, Tailor to this job, Add experience, Download PDF, the stage of an application, the next step on Today |
| **Easy**: one step (a visible icon with label, a tab, a "More" row, focus/hover reveal on pointer devices) | Frequent, not every visit | Edit a section, Change CV language, Regenerate letter, Move to another stage, See why this job matches, Undo                  |
| **Possible**: two steps (inside a menu, sheet or settings)                                                 | Rare, or for a few        | Duplicate a CV, Change date format for this market, Delete an application, Export all my data, Delete my account              |

Nothing is deeper than two steps. A control moves up a tier only with evidence (a review finding, analytics, a user complaint), never because space looked empty.

#### 1b. Consequence level: how explicit the action must be (by stakes)

| Level           | What it means                                     | Rule                                                                                                                                                                                                                                                                                                                                   | Examples                                                                       |
| --------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Reversible**  | Can be undone in one step, nothing leaves Jubilee | Act at once; offer **Undo** inline; no confirmation                                                                                                                                                                                                                                                                                    | Move a tracker card, accept an AI suggestion, hide a job, edit a field         |
| **Recoverable** | Loses work, but a version is kept                 | Act, keep the previous version, say where it went ("Previous letter saved in History")                                                                                                                                                                                                                                                 | Regenerate a letter over your edits, replace a CV section from LinkedIn import |
| **Final**       | Leaves Jubilee or destroys data for good          | **Fully explicit:** the button names the act and the target ("Send to Sawa Logistics", a made-up example); a summary shows exactly what goes out (which CV version, which letter, which email address); never the default focus, never icon-only, never a keyboard shortcut, never batched without listing each item; one per approval | Send an application, delete account, delete a CV that has applications         |

AI is never final on its own: **every AI change is shown as a marked change** (added text on a `--tint` highlight and underlined in `--violet`, removed text struck through in `--ink-muted`) with a one-line reason, and the user accepts or rejects it per line or with "Accept all". Nothing the AI writes is saved until the user accepts it (brief: AI changes visible and reversible; never invent experience).

### 2. Progressive disclosure: what each screen shows first

- **Two levels, labelled.** The first screen shows what most people need now; everything else is one labelled step away ("Why this match", "Edit letter", "More"). Triggers say what they open. No mystery icons.
- **Today (approval queue):** one job at a time. First level: role, company, place, pay if known, match score and the top 3 reasons, and two actions: Approve and send, Skip. Second level (one tap): the tailored CV, the letter, the full job description.
- **CV editor:** a list of sections the user can jump between (not a locked wizard, NN/g: users go back and forth). Each section shows its filled state as one summary line; the form opens in place. Fields in groups of 4–6. Optional fields (e.g. photo, which depends on the market) sit behind "Add …" rows, and appear only where the market expects them.
- **Job card:** role, company, place, posted date, match score. Nothing else; the rest is on the job page.
- **Tracker card:** company, role, days in stage, the next step if any. Notes, dates and the CV version sent are on the card's page.
- **Onboarding:** staged (it is linear and steps don't depend on each other): import or start fresh → market and language → first CV. A progress line ("Step 2 of 3"), and every step can be skipped and returned to.
- **Empty states teach the next step** in one sentence and one button ("No applications yet. Approve your first job on Today.").

### 3. Space: adequate, generous, and by relationship

**The rule:** space shows how things relate. Choose the step by relationship, not by what fits; when two steps both look right, take the larger. There is no such thing as too much space between groups.

| Relationship               | Step (0005 scale)                    | Examples                                                                      |
| -------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| Inside one unit            | 4–8 px                               | Icon to its label, label to its field, a meta line under a title              |
| Between items of one group | 12–16 px                             | Fields in a group, cards in a list, buttons in a row                          |
| Between groups             | 32 px (phone) · 48 px (≥ 1024)       | Form groups, a card list and its heading, Today's job summary and its actions |
| Between sections           | 48–64 px (phone) · 64–96 px (≥ 1024) | Page sections, the CV editor and its preview                                  |
| Page edges                 | Gutters in 0005                      |                                                                               |

- **Heading sits closer to what it labels than to what came before** (at least 2× more space above than below).
- **Containment: one well, then cards (Clemta pattern).** A group of related things sits in a **well** (`--well`, 1 px `--line`, radius 12). Inside it, each object (a job, an application, a CV section) is a **card** (`--card`, 1 px `--line`, radius 12). Items inside a card are grouped by space only. **One level:** never a card in a card, never a well in a well, no shadow on either. A single object that stands alone (Today's job) is a card on the page, no well.
- **Padding follows the ladder:** wells 16 px (phone) / 24 px (≥ 1024) inside; cards 16–24 px; the gap between cards in a well 12–16 px.
- **Density is earned inside data, never at page level.** The tracker board and long job lists may use the 12 px item gap so a column shows more cards; the space around them stays generous. No "compact mode" toggle.
- **Design at French length.** French labels often run longer than English; every component is checked with the French strings, and buttons wrap to two lines rather than truncating.
- **One thumb.** On phones the obvious actions sit in the bottom half and are at least 44 × 44 px with 8 px between targets.

### 4. Hidden UI: which overlay, when

| Need                                                           | Pattern                               | Phone                       | Desktop            |
| -------------------------------------------------------------- | ------------------------------------- | --------------------------- | ------------------ |
| A few actions on one item                                      | Menu (`More`)                         | Bottom sheet                | Dropdown           |
| Pick a value (market, language, stage)                         | Select                                | Bottom sheet list           | Dropdown           |
| See detail without losing your place (letter, job description) | Sheet                                 | Full-height sheet           | Side panel         |
| A final action (§1b)                                           | Review panel naming what is sent      | Full sheet with the summary | Dialog, max 480 px |
| Short feedback (Moved to Interview · Undo)                     | Inline line where the change happened | Same                        | Same               |

Every overlay traps focus, closes with Esc and a visible Close, returns focus to its trigger, and locks the page scroll behind it. Prefer Undo over "Are you sure?" for anything reversible. No tooltips as the only label.

### 5. Hover, press and motion

- Hover styles only on `(hover: hover) and (pointer: fine)`: buttons take an 8% ink wash; clickable cards get a `--field` border (only clickable ones). Press scales to 0.98. Touch gets the same feedback on `:active`. Everything hover reveals is also revealed by `:focus-visible` / `:focus-within`.
- In at 120 ms, out at 150 ms; nothing over 320 ms; keyboard-initiated actions aren't animated; reduced motion becomes a short fade (0005).

## Consequences

- Every UI spec lists each control with its **tier** and **consequence level**, and each overlay with its pattern. The reviewer deducts for a control without them, anything deeper than two steps, a final action that isn't fully explicit, and a spacing step chosen against §3.
- Shared primitives built once on native elements and restyled with tokens: `Sheet`, `Menu`, `Dialog`, `ReviewPanel`, `MarkedChange`, `UndoLine`.
- The CV editor can't be a locked wizard; the onboarding can.
