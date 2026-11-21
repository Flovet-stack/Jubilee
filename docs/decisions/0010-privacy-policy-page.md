# 0010: Privacy policy page: structure, content and what it may claim

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Product Designer, Copy, UX, UI, Frontend, Tech Lead)
- **Approved:** 2026-11-21 by Flovet (in chat)
- **Builds on:** 0002 (`(marketing)` holds legal pages), 0003 (en/fr, copy in message files), 0004 and 0006 (what is stored today), 0007 and 0008 (look and disclosure)
- **Specs:** specs/04-privacy-page.md

## Context

Flovet asked for a privacy policy page: the page only, no header or footer (the app shell comes later).

The decision log lists "Privacy, consent and data deletion" as still to decide, needed by launch. This entry covers only the **page**: how it is structured, what it may say, and where it lives. It does not decide consent banners, retention jobs, or the export and deletion flows. Those stay in that later decision.

From the brief: "Personal data (CVs, contact details) is sensitive: least privilege, RLS on every table, data export and deletion from day one." "Positioning: recruiter-safe." "AI must never invent experience." Markets: France and the US first (0005), so GDPR (CNIL) applies from day one. California's CCPA applies only above its thresholds.

What Jubilee actually processes today (repo, 2026-11-21): Supabase Auth and one `profiles` row (`full_name`, `avatar_url`), Supabase project in eu-west-1 (0006), hosting on Vercel (0001), sign-in through Google and LinkedIn (0004). **Not decided yet:** AI provider, transactional email, payments, analytics and error tracking, job sources. A policy that names any of these would be inventing facts.

## Research

| Reference                                         | What they do                                                                                                                                                                                                                                                                      | Adopt / adapt / reject                                 | Why                                                                                                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GDPR Art. 13 (gdpr-info.eu)                       | Required items: controller and contact, DPO if any, purposes and legal basis, legitimate interests, recipients, transfers and safeguards, retention, the six rights, withdrawing consent, complaint to a regulator, whether data is required, automated decisions and their logic | Adopt as the content checklist                         | Legal floor for the France launch                                                                                                                                                     |
| CNIL, "information des personnes et transparence" | Concise, plain words, no jargon; **layered**: essentials first (who, why, rights), then the full notice, with expandable parts; linked from every page under a clear title, separate from terms; tell people before a substantial change                                          | Adopt                                                  | Matches the brief's tone and 0008's two-level disclosure                                                                                                                              |
| CCPA, oag.ca.gov                                  | Describe what is collected, used, shared and sold; rights to know, delete, correct, opt out, limit sensitive data, non-discrimination; how to send a request (email is enough for online-only businesses); a "Do Not Sell or Share" link only if we sell or share                 | Adapt                                                  | Thresholds ($25M revenue, 100k California residents, or 50% revenue from selling data) likely exclude us at launch, but the US is a launch market and the rights section costs little |
| Teal (tealhq.com/privacy-policy)                  | Numbered sections, "last updated" at top; per-feature data flow for AI and Gmail; "Who at Teal can see it"; states career content is not used to train AI                                                                                                                         | Adapt                                                  | Closest competitor that processes CVs with AI; the per-feature flow suits the CV and apply features once they exist                                                                   |
| 37signals (37signals.com/policies/privacy)        | One-line promise at top ("We never sell your data"), jump-link contents, conversational tone; sub-processors on a separate page; concrete deletion timelines                                                                                                                      | Adopt the summary, contents and timelines              | Easiest to scan; exact timelines build trust                                                                                                                                          |
| GOV.UK privacy notice                             | Legal basis mapped to each purpose; a "We will not" list; plain government style                                                                                                                                                                                                  | Adopt the per-purpose basis and the "We will not" list | Clearest way to meet Art. 13 without legalese                                                                                                                                         |
| Kickresume, Welcome to the Jungle                 | Pages not found (404)                                                                                                                                                                                                                                                             | n/a                                                    | Not reviewed                                                                                                                                                                          |

Sources (opened 2026-11-21): https://gdpr-info.eu/art-13-gdpr/ · https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence (first third verbatim, rest summarised) · https://oag.ca.gov/privacy/ccpa (truncated; part summarised) · https://www.tealhq.com/privacy-policy · https://37signals.com/policies/privacy · https://www.gov.uk/help/privacy-notice. Failed: both ICO "right to be informed" pages (403), the CPPA regulations PDF (404, so §7011 is unverified), the CalOPPA page (403).

## Options

**Structure**

1. **Layered single page:** a short summary up front (who we are, what we keep, what we never do, your rights), a jump-link contents list, then numbered plain-language sections. Pros: what CNIL asks for; one URL; 0008's two levels. Cons: a long page on phones (mitigated by the contents list).
2. **One long legal document:** Cons: CNIL calls a single unreadable block unacceptable; off-brand.
3. **Several pages** (privacy, cookies, sub-processors): Pros: scales later. Cons: too much for the MVP, and there are no cookies or sub-processors beyond Supabase and Vercel yet.

**Truthfulness while features are undecided**

1. **Describe only what exists, and say what will change:** list only the decided processors; a section says the policy is updated, and users told, before any new feature (AI, email, payments, analytics) processes their data. Pros: never false. Cons: the page needs an update with each later decision.
2. **Write the full future policy now:** Cons: names providers and retention periods nobody has chosen. Rejected.

**Where and in which languages**

1. **`/[locale]/(marketing)/privacy` with copy in `src/messages/{en,fr}.json`**, as 0002 and 0003 say. Needs spec 01 (next-intl routing) first. It is `Ready` but not built.
2. **Build `/privacy` now with hard-coded English and move it later.** Breaks 0003 and `CLAUDE.md` ("no hard-coded user-facing strings"). Rejected.

## Decision

Structure option 1, truthfulness option 1, location option 1.

- **Sections**, in order: summary · who we are and how to reach us · what we collect (now: account and profile; sign-in provider data) · why, with the legal basis for each purpose · who processes it (Supabase, Vercel, Google and LinkedIn for sign-in only) · where it is stored and transfers · how long we keep it · your rights and how to use them (GDPR list, plus the California rights) · automated decisions and AI (today: none; rule: AI never invents experience and never applies without approval) · cookies (today: the session cookie only) · children (not for under-16s) · changes to this policy · complaints (CNIL).
- **"We will not" list** at the top: we don't sell your data; we don't send anything in your name without your approval; we don't use your CV to train AI models (this one only if Flovet confirms it as a commitment).
- **"Last updated" date** at the top, as a `<time>` element.
- **Look:** a reading page on 0007 tokens and 0009 components: one column at a readable width, the contents list in a grey well, no violet button (the page has no action), no illustrations.
- **French version** at `/fr/confidentialite` or `/fr/privacy` (the spec decides; both locales share one route name under next-intl unless pathnames are localised).

Roles disagreed on one thing: Copy wanted a separate "plain summary" page; UX kept it on one page so nobody misses the full text. The page stays single.

## Consequences

- **Blocked on spec 01** (next-intl routing and message files). The privacy spec cannot be `Ready` until spec 01 is built.
- **Needs facts from Flovet** before the text is final: the controller's legal name and country, a postal address, the privacy contact email, whether there is a DPO, the minimum age, and whether "we don't train AI on your CV" is a commitment.
- **Not legal advice.** The text is drafted from Art. 13, CNIL and CCPA guidance. A lawyer or a GDPR professional reviews both languages before public launch, and the French text gets a native-speaker review (0003).
- Every later decision that adds a processor (AI, email, payments, analytics, job sources) has to update this page in the same spec. Reviews check this.
- The consent banner, retention jobs, export and deletion stay in the "Privacy, consent and data deletion" decision.
