# Jubilee design brief

- **Status:** Approved (0005 and 0006 approved by Flovet on 2026-11-21).
- **Written:** 2026-11-21 by the product team (roles: Product, UX, UI, Copy, Frontend, Tech Lead)
- **Anti-patterns:** [no-ai-slop skill](../../claude-setup/skills/no-ai-slop/SKILL.md): what makes a UI, its copy or its behaviour look AI-generated, and our rule for each.
- **Decisions:** [0005 visual foundations](../decisions/0005-visual-foundations.md) · [0006 interaction, progressive disclosure, the hierarchy of explicitness and space](../decisions/0006-interaction-disclosure-and-space.md) · [0003 internationalisation](../decisions/0003-internationalisation.md)

This brief says what Jubilee should look, feel and behave like, and why. The decisions it links hold the research and the exact values; this file shows how they fit together and how to use them. `PROJECT_BRIEF.md` stays the source of truth for scope.

## How this brief is built

There is no standard design brief, so we looked at how large teams publish theirs and took the parts they share:

| What large teams publish                                                                                           | Who does it this way (opened)                                                                                                                  | Where it lives here  |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Principles first**, short and numbered, used as tie-breakers                                                     | GOV.UK Government Design Principles (11 rules: "Do less", "This is for everyone", "Be consistent, not uniform")                                | §6                   |
| **Foundations** as a fixed list of tokens: colour, type, spacing, grid, radius, elevation, motion, iconography     | Atlassian Foundations, IBM Carbon, GitHub Primer                                                                                               | §8, values in 0005   |
| **Spacing with named jobs**, not raw numbers: ranges for inside / between / layout; larger steps on larger screens | Atlassian (small/medium/large), Carbon ("jump a step" at breakpoints), Primer (condensed/normal/spacious stacks), GOV.UK (small/large screens) | §9, rules in 0006 §3 |
| **Emphasis levels for actions**: one high-emphasis action per screen                                               | Material 3 / Android button guidance                                                                                                           | §6.3, §10            |
| **Patterns** for disclosure, overlays and states, separate from components                                         | GOV.UK Patterns, NN/g                                                                                                                          | §9, 0006 §2 and §4   |
| **Content and voice** as part of the system                                                                        | GOV.UK content design, Atlassian Content                                                                                                       | §7                   |
| **A reference look the owner chose**, reverse-engineered rather than copied                                        | Ownr (colour, type, playfulness) and Clemta (grey wells with light borders), computed styles read in the browser                               | §8, 0005 research    |
| **A list of what not to do**                                                                                       | Paralect, avoid-ai-design, 925Studios, Anthropic `frontend-design`, NN/g                                                                       | `no-ai-slop` skill   |
| **Accessibility and contribution rules** at the end                                                                | Every system above                                                                                                                             | §12–13               |

What makes it _Jubilee's_ and not a copy of FlickVale or AniKansou: those products put artwork first and run dark. Jubilee's "artwork" is **the user's own CV**, and its signature moment is **a decision with consequences** (sending an application). So this brief adds two things neither sibling needed: a design for documents and a scale of explicitness by consequence.

---

## 1. Overview

Jubilee takes a job seeker from CV to job offer in English and French: an ATS-safe CV in each country's format, tailored versions and letters per job, a daily queue of high-fit jobs sent only with approval, a tracker, and drafted follow-ups. Today it is a scaffold with no tokens, fonts or screens.

## 2. Problem

1. **Trust.** Users hand over their CV, contact details and their name in front of employers. Mass-apply tools have burned that trust (LazyApply 2.1/5). Jubilee must look careful, calm and in control of nothing the user didn't approve.
2. **Stress.** Job search is draining (49% cite mental health; 55% say no reply is the top frustration: competitor map). Every extra choice, alarm colour or upsell adds to it.
3. **Cheap phones, paid data.** Launch markets include Cameroon; pages must be light and readable in sunlight on a mid-range Android.
4. **Two languages, two outputs.** The interface and the CV can be in different languages (0003); French text runs longer.
5. **Scale.** Every later feature will copy the first screens. Foundations have to be right before the CV builder ships.

## 3. Audience and context of use

- **Who:** active job seekers in French- and English-speaking markets (Cameroon and France as working examples): graduates, career changers, experienced professionals; often first-time users of a CV tool.
- **Where:** a phone, one hand, between other things; a laptop when writing the CV or reviewing a letter. Daylight, shared spaces, sometimes slow networks.
- **What they bring:** LinkedIn, Indeed, WhatsApp, Word or Canva CVs. They know forms, lists and cards. They don't know what an ATS is.
- **What they don't want:** surprises (something sent in their name), jargon, guilt, being sold to, AI that writes in a voice that isn't theirs.

## 4. Goals and success criteria

| Goal                                 | We know it worked when                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Looks like Jubilee, not a template   | A reviewer can't name a component library or starter from a screenshot; no no-ai-slop P0 tell appears                         |
| The user's document leads            | On every CV or letter screen, the paper preview is the most prominent element; the chrome sits in grey and ink tones          |
| Nothing goes out without a clear yes | Every final action (0006 §1b) names its target and shows what is sent; no final action is reachable by one stray tap          |
| Fast to first CV                     | The structure supports the brief's target: 60% finish a CV within 15 minutes (measured after launch)                          |
| Calm by default                      | One violet button per screen; no red for job outcomes; empty states say the next step                                         |
| Space is adequate                    | Every spacing choice can be named by relationship (0006 §3); a reviewer finds no screen where a larger step would read better |
| Light enough                         | Fonts ≤ 100 KB; a phone screen renders readable text before fonts load                                                        |
| Accessible                           | WCAG 2.2 AA in light and dark; keyboard-only works end to end; reduced motion honoured                                        |

## 5. Scope and constraints

**In scope:** principles, voice, tokens, the hierarchy of explicitness, progressive disclosure, space rules, component direction, and the direction for MVP screens.

**Out of scope (own decisions later):** the CV templates and their typography (ATS rules), the app shell and navigation in detail, the icon list, illustration, marketing site, email templates.

**Constraints:** free fonts through `next/font`; no UI library (any dependency needs approval); mobile first at 360 px; English and French at launch; references inspire only (no logos, names, icons, illustrations or exact brand colours copied); every UI string in the message files (0003).

---

## 6. Design principles

Eight rules. When two conflict, the earlier one wins.

1. **The user's document leads.** The CV and the letter are the "artwork": white paper with a soft page shadow, the largest thing on the screen. Chrome sits back in grey and ink tones. (0005)
2. **Nothing leaves without a clear yes.** The more an action costs to undo, the more explicit it is. Sending names the employer and shows exactly what goes. Reversible things just happen, with Undo. (0006 §1b; brief: approval-based apply)
3. **The hierarchy of explicitness: obvious, easy, possible.** Every control is placed on purpose by how often and how many use it. Obvious: visible, labelled, large. Easy: one step away. Possible: two steps, in a menu or settings. Never deeper. (Will Grant / Canonical; 0006 §1a)
4. **Progressive disclosure: show what's needed now.** One job at a time on Today. A summary line per CV section. Reasons behind "Why this match". Two levels, each trigger labelled with what it opens. (NN/g; 0006 §2)
5. **Space is a feature; it shows relationships.** Tight inside a unit, wider between items, generous between groups and sections. When two steps look right, take the larger. A group sits in one grey well with a light border; never a box in a box. (Atlassian, Carbon, Clemta, NN/g, Refactoring UI; 0006 §3)
6. **AI shows its work.** AI changes appear as marked edits with a reason, and the user accepts them. AI is named by what it does ("Tailor to this job"), never by a sparkle. It never invents experience. (brief; Huntr's explained suggestions)
7. **Calm every day, bright when it counts.** One violet button per screen. Confetti only for milestones the user earned. Rejection is grey, not red. No streak shaming, no fake urgency, no upsell in the middle of a task. (GOV.UK "Do less"; competitor map)
8. **Decisions, not defaults.** A choice that would fit any product gets replaced with one from Jubilee's material: the CV as paper, the day's queue, the stages of an application, the milestones worth celebrating. Every screen is checked against the `no-ai-slop` skill.

## 7. Personality and voice

| Jubilee is                                              | Jubilee is not                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| A calm, experienced career adviser who sits next to you | A hype coach ("Land your dream job!") or a recruiter's tool        |
| Plain-spoken and specific                               | Vague ("Optimise your profile") or cute (emoji, exclamation marks) |
| On the user's side, honest about chances                | Falsely cheerful, or alarming                                      |
| Precise about what it did and will do                   | Mysterious about AI                                                |

Copy rules (Copy role, GOV.UK content design):

- Sentence case; buttons start with a verb and name the action (`Approve and send`, `Tailor to this job`, `Add experience`). Final actions name the target.
- Short words, active voice, "you"; no "please"; in English UI avoid negative contractions ("cannot", not "can't") as GOV.UK advises.
- Errors say what happened and how to fix it, never "invalid": "Add an end date, or tick 'I still work here'."
- Digits, not words; dates in the user's locale format.
- French UI uses _vous_ (professional register). Every French string is reviewed by a native speaker (0003).
- Product nouns from the brief: **CV**, **version**, **application**, **stage** (saved, applied, interview, offer, rejected), **approval**, **market**, **Today**.
- Banned: "seamless", "powerful", "elevate", "unlock", "supercharge", "dream job", "AI-powered".

---

## 8. Foundations

Exact values and contrast checks are in [0005](../decisions/0005-visual-foundations.md). Summary:

### 8.1 Colour: quiet desk, bright moments

- **Calm structure (from Clemta).** White page, grey wells `#f4f4f6` with a light 1 px border, white cards with the same border, navy-violet ink `#1d1a44` (16.4:1). Dark mode follows the system; CV and letter previews stay white paper.
- **One violet action (from Ownr).** Violet `#5a32d6` is the one primary button per screen, the active nav item, links, the focus ring and the match bar. White text on it, 7.3:1. Flat, never a gradient.
- **Bright moments.** Marigold, pink and sky join violet as confetti only when the user earns it: first application sent, an interview, an offer. Marigold also fills the offer stage.
- **Stages:** saved slate, applied blue, interview plum, offer marigold, rejected warm grey (not red). Each has an icon and a label.
- **Danger `#c0262d`:** errors and destructive actions only, never job outcomes.

### 8.2 Typography

- **Plus Jakarta Sans** for everything (the face Ownr uses for headings): headings 700 with slightly tight tracking, body 400 at 16 / 1.5, labels 600, tabular figures for dates and scores. One family keeps fonts under 80 KB.
- Scale 12 · 14 · 16 · 18 · 20 · 24 · 32 · 40 px; **at most three sizes per screen** besides meta.
- CV fonts are a separate decision.

### 8.3 Spacing and grid

- Scale (4 px base): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Ten steps, nothing in between.
- Gutters 16 / 24 / 32 px at < 640 / 640–1023 / ≥ 1024. Content max 1200 px; forms and reading max 640 px.
- Chosen by relationship (§9.1), larger steps from 1024 px.

### 8.4 Shape and elevation

- Radius by role: paper 2 px (crisp page), controls 8, cards 12, sheets 16, chips full.
- Containment is one level: grey well (1 px border) → white card (1 px border). Never a card in a card. No resting shadows except the CV paper; floating layers get a float shadow.

### 8.5 Iconography

Inline SVG drawn in-house, 20/24 px, 1.5 px stroke; the button carries the label. No emoji, no sparkle.

### 8.6 Imagery

No stock or generated photos of people. Spot illustrations for empty states are a later decision; until then, words and one button. The product's images are the user's documents (the paper preview) and company initials only where a real logo isn't licensed. An illustration style, if ever needed, is its own decision.

### 8.7 Motion

120 / 200 / 320 ms; movement on a standard ease, entries on an emphasised ease. Nothing loops or animates on scroll. Celebrations (confetti, ≤ 600 ms, once) only at earned milestones. Reduced motion becomes a short fade.

## 9. Space, disclosure and explicitness in practice

The full rules are in [0006](../decisions/0006-interaction-disclosure-and-space.md). This is how a builder applies them.

### 9.1 Spacing ladder

| Relationship                                        | Phone | ≥ 1024 px |
| --------------------------------------------------- | ----- | --------- |
| Inside a unit (icon–label, label–field, title–meta) | 4–8   | 4–8       |
| Items in a group (fields, cards, buttons)           | 12–16 | 16        |
| Between groups                                      | 32    | 48        |
| Between sections                                    | 48–64 | 64–96     |

Headings sit at least twice as close to their content as to what is above. Cards only for real objects; never a card in a card. Density only inside the tracker board and long lists, never at page level.

### 9.2 Progressive disclosure per screen

| Screen     | First level (shown)                                                                             | Second level (one labelled step)                       |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Today      | One job: role, company, place, pay if known, match score, top 3 reasons; Approve and send, Skip | Tailored CV, letter, full description                  |
| CV editor  | Section list with one summary line each; the preview                                            | The section's form, opened in place                    |
| Job list   | Role, company, place, posted date, match score                                                  | Job page                                               |
| Tracker    | Columns by stage; card: company, role, days in stage, next step                                 | Card page: notes, dates, version sent, follow-up draft |
| Follow-ups | Who, when, the draft's first line, Copy / Open in email                                         | The full draft to edit                                 |

### 9.3 Explicitness: two labels on every control

Every spec lists each control with its **visibility tier** (obvious / easy / possible) and its **consequence level** (reversible / recoverable / final):

| Control            | Tier     | Consequence | So it is…                                                            |
| ------------------ | -------- | ----------- | -------------------------------------------------------------------- |
| Approve and send   | Obvious  | Final       | The violet button, named target, review summary, never default focus |
| Skip               | Obvious  | Reversible  | A secondary button; "Skipped · Undo"                                 |
| Tailor to this job | Obvious  | Reversible  | Shows marked changes to accept                                       |
| Move to Interview  | Easy     | Reversible  | Drag, or a Stage select; Undo line                                   |
| Regenerate letter  | Easy     | Recoverable | Keeps the old letter in History                                      |
| Delete account     | Possible | Final       | In settings, names what is deleted                                   |

## 10. Components: direction

Built in specs, on native elements, styled only through tokens.

- **Buttons:** primary (`--violet`, one per screen), secondary (white with `--field` border), quiet (ink text, no fill), danger (only for final destructive actions). 48 px tall, radius 8. Final-action buttons always carry their target in the label.
- **Inputs:** white paper, `--field` border (3:1), radius 8, label above, hint below, error below in danger with an icon. Never placeholder as label.
- **Paper preview:** the CV or letter on white, 2 px radius, the page shadow, real proportions (A4 for France, a market setting decides); zooms on phones, never squeezed.
- **Marked change:** additions on a violet tint, underlined in violet; removals struck through in ink-muted, a reason line, Accept / Reject per change and Accept all.
- **Match score:** the number large in Plus Jakarta Sans 800, a violet bar, and the reasons as words ("Has 5 of 6 required skills"). Never a score alone.
- **Wells and cards:** a list of jobs, a tracker column or a group of CV sections is a grey well with a light border; each job, application or section is a white card with a light border, radius 12. The stage is a pill with icon and label.
- **Next-step panel:** a violet-tint panel for the single next action on a screen ("2 follow-ups are ready").
- **Review panel:** the final-action summary (who, which version, which letter, which address) with the named button at the bottom.
- **Undo line:** inline where the change happened, 6 s, also reachable by keyboard.
- **Sheets, menus, dialogs:** per 0006 §4.

## 11. Existing screens: what changes

| Screen             | Direction                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx` | Replaced by the localised placeholder pages (spec 01), then by the real home                                           |
| `layout.tsx`       | Plus Jakarta Sans through `next/font`; `lang` from the locale; theme colour `#ffffff` / `#0e0d1f`                      |
| `globals.css`      | The 0005 tokens mapped into Tailwind 4 `@theme`; base styles (white page, ink text, violet focus ring, reduced motion) |
| 404 / error        | Short, calm copy with a way back ("This page isn't here. Go to Today."), no illustration                               |

## 12. Accessibility

- WCAG 2.2 AA in both themes; every pair in 0005 is computed.
- Focus ring 2 px violet with 2 px offset, never removed; targets ≥ 44 × 44 px with 8 px apart for obvious actions.
- Every drag (tracker) has a button or select alternative; every gesture has a control.
- Forms: labels above, errors linked with `aria-describedby`, error summary at the top of long forms.
- AI marked changes are announced as text ("Added: …", "Removed: …"), not only colour or strike-through.
- Reduced motion honoured. Real assistive-technology testing with users is beyond the team; flagged for before launch.

## 13. Approval and next steps

1. Flovet reviews 0005 and 0006 (and this brief). Each becomes `Approved` only on an explicit yes.
2. Done: the Jubilee `no-ai-slop` skill (`claude-setup/skills/no-ai-slop/SKILL.md`). Next: the design-foundations spec (tokens, font, base primitives).
3. Still to decide before the screens that need them: app shell and navigation, CV templates and typography, icon list.
4. Every UI spec is reviewed with the reviewer skill against this brief: 90/100 or it isn't done.

## Sources

Each decision says which sources were opened and which were only seen as search summaries.

- GOV.UK Government Design Principles: https://www.gov.uk/guidance/government-design-principles
- GOV.UK Design System, spacing: https://design-system.service.gov.uk/styles/spacing/
- GOV.UK writing guidelines: https://www.gov.uk/guidance/content-design/writing-for-gov-uk
- Atlassian Design System, spacing and foundations: https://atlassian.design/foundations/spacing
- IBM Carbon, spacing: https://carbondesignsystem.com/elements/spacing/overview/
- GitHub Primer, foundations, layout and size: https://primer.style/product/getting-started/foundations/
- NN/g, progressive disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- NN/g, visual hierarchy: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- NN/g, form white space: https://www.nngroup.com/articles/form-design-white-space/
- Laws of UX, proximity: https://lawsofux.com/law-of-proximity/
- Canonical, classify interactions (obvious, easy, possible; search summary): https://ubuntu.com/blog/ux-deep-dive-classify-interactions-for-a-more-intuitive-user-interface
- Material / Android button emphasis (search summary): https://developer.android.com/develop/ui/compose/components/button
- Huntr, Kickresume, Welcome to the Jungle, Europass homepages (text only); Teal and Indeed blocked automated fetches
- FlickVale and AniKansou design briefs and their interaction decisions (local), for the approach
