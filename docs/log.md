# Project log

One dated entry per task: what was built, the review score, and what was left.

## 2026-11-21: Codebase initialised

- Next.js 16.4.6 scaffold with pnpm, Prettier (Tailwind plugin), ESLint + Prettier config, Vitest and one smoke test; `pnpm check` script.
- Project brief, decision log (0001–0004 Proposed), spec 01 (Blocked on those decisions), product docs, product-team and reviewer skills.
- Left: Flovet to approve 0001–0004; then build spec 01. Design, AI, job sources, payments and email decisions still to research.

## 2026-11-21: Skills moved into .claude/ (issue #2)

- Moved `claude-setup/skills/*` to `.claude/skills/` and `claude-setup/agents/*` to `.claude/agents/`; removed `claude-setup/`. The paths in CLAUDE.md, README and the skills now resolve.
- No spec (tooling only). Not reviewed (no spec to score against).

## 2026-11-21: Decision 0006, launch markets (issue #3)

- Researched and logged 0005 as Proposed: Cameroon and France. Default UI and CV languages set per market. Main risk: no licensed job feed confirmed for Cameroon yet (fallback: saved and pasted jobs).
- Left: Flovet to approve 0001–0005. Sources came from web-search summaries and need re-checking in the job-sources and payments decisions.

## 2026-11-21: Sign-in options and target markets revised (Flovet's input)

- 0004: sign-in is now email magic link, Google and LinkedIn (`linkedin_oidc`). Still Proposed.
- 0005 rewritten: the targets are the US, Canada, the UK, France and six African markets. Rollout is phased: France + US (MVP), then UK + Canada, then Africa one country at a time. Brief, MVP doc and index updated to match.
- Left: Flovet to approve 0001–0005; issue #9 (sign-in) scope updated to include LinkedIn.

## 2026-11-21: Decisions 0001–0005 approved (issues #1, #3)

- Flovet approved 0001–0005. Status lines, index and brief updated; spec 01 (Foundations) set to Ready.
- Left: build spec 01 (#6).

## 2026-11-21: Spec 02, auth database (96/100)

- Decision 0006 approved by Flovet (drafted as 0005, renumbered after main's 0005 landed). 0006: sign-in with email code, Google or LinkedIn; one `profiles` row per user.
- Migration `20261121033326_profiles` applied to the `jubilee` project: `public.profiles`, owner-only RLS (select and update for `authenticated`), no `anon` access, sign-up trigger filling name and photo from Google or LinkedIn metadata, `on delete cascade`.
- `supabase/tests/profiles.sql` passed on the remote project (rolled back, no data left). Security and performance advisors: no findings. Types in `src/types/database.types.ts`. `supabase/config.toml` enables email, `google` and `linkedin_oidc` with secrets from env.
- Not in 0006 but built: name capped at 200 characters and avatar URL at 2,048, so a long provider value can't block sign-up.
- Left for Flovet: `npx supabase login` and `npx supabase link --project-ref ylxywgfnfgopiielyqgn`; create the LinkedIn app (OIDC product, LinkedIn Page) and the Google client; enter both in Supabase > Authentication > Providers; add the redirect URLs. Email sign-in reaches team members only until custom SMTP is decided.

## 2026-11-21: Design brief proposed

- `docs/design/design-brief.md` plus decisions 0007 (visual foundations) and 0008 (interaction, progressive disclosure, hierarchy of explicitness, space), all Proposed. Structure drawn from GOV.UK, Atlassian, Carbon, Primer, Material and NN/g; approach from the FlickVale and AniKansou briefs.
- No code changed. Left: Flovet to approve 0007 and 0008; then a Jubilee no-ai-slop skill and the design-foundations spec.

## 2026-11-21: Design direction revised, no-ai-slop skill added

- After Flovet's review of the sample screens: 0007 rewritten as "quiet desk, bright moments" (Ownr-style violet and confetti accents, Clemta-style grey wells with light borders, Plus Jakarta Sans); 0008 grouping rule now uses wells and cards; brief updated. All still Proposed.
- New `.claude/skills/no-ai-slop/SKILL.md`: AI-generated UI, copy and behaviour tells from 7 sources, with Jubilee's rule for each, and how the borrowed Ownr/Clemta patterns stay safe.
- Sample canvas restyled to the new direction.

## 2026-11-21: Design decisions approved

- Flovet approved 0007 (visual foundations, "quiet desk, bright moments") and 0008 (interaction, disclosure, explicitness and space). The design brief is now Approved.
- Left: the design-foundations spec (tokens, font, base primitives), then the app shell, CV templates and icon list decisions.

## 2026-11-21: Design system built (spec 03)

- Decision 0009 and spec 03. Tokens for light and dark in `globals.css` (three tiers, Tailwind 4 theme), Plus Jakarta Sans via `next/font`, a contrast test over every 0007 pair (52 checks).
- 34 animated icons vendored from icons-animated (Hugeicons, as AniKansou) with a shared accessibility hook; 31 components (most on Base UI) with every state; `/design-system` preview (development only); guide in `docs/design/design-system.md`.
- New dependencies, approved by Flovet in chat: motion 13.1.1, @base-ui/react 1.9.0, class-variance-authority, clsx, tailwind-merge.
- Reviewed 96/100 (first pass 83: reduced-motion leaks, raw values, small toast targets, all fixed). `/design-system` returns 404 in the production build.
- Left: the app shell (providers, navigation) wires `TooltipProvider` and `ToastProvider`.

## 2026-11-21: Decision 0009 approved

- Flovet approved 0009 in chat. 0007's status notes that its Iconography paragraph is superseded by 0009; 0007 and 0009 link spec 03. Index, brief and spec 03 status updated.

## 2026-11-21: Design work merged with main

- main had taken decisions 0005 and 0006 and spec 02 (launch markets, account data, auth database), so the design decisions were renumbered 0007 (visual foundations), 0008 (interaction, disclosure, space) and 0009 (design system), and the design-system spec became 03. `no-ai-slop` moved to `.claude/skills/` with the other skills.

## 2026-11-21: Logo and brand guidelines proposed (0010)

- Five logo directions on the canvas "Jubilee logo propositions", modelled on how category leaders build theirs. Flovet chose D (the path) with A's two-dot wordmark for use on its own.
- Logged 0010 as Proposed. Wrote `docs/design/brand-guidelines.md` (structure taken from Spotify, GOV.UK, Mailchimp and Atlassian) and 13 SVG files in `docs/design/brand/logo/`: logo, wordmark and icon in colour, on dark, on violet and one colour, plus app icons and a three-dot favicon.
- Not reviewed: no spec (brand assets only, nothing wired into the app).
- Left: Flovet to approve 0010; PNG and ICO exports and the favicon go in with the app shell spec.

## 2026-11-21: Privacy policy page decided and specced

- Decision 0011 (privacy policy page; drafted as 0010, renumbered when merging main, which had taken 0010 for the logo): researched against GDPR Art. 13, CNIL, CCPA, Teal, 37signals and GOV.UK; approved by Flovet in chat. One layered page in English and French that describes only what Jubilee processes today.
- Spec 04 written, status Blocked: it needs spec 01 (next-intl routing and message files) built first, and company facts from Flovet (legal name, address, privacy email, DPO, minimum age, the AI-training commitment).
- Left: build spec 01, then spec 04; a legal review of both languages before launch.

## 2026-11-21: Foundations built (spec 01)

- next-intl 4.15.3, @supabase/ssr, @supabase/supabase-js, @t3-oss/env-nextjs, zod and server-only, as named in 0003 and 0004 (pinned).
- `src/env.ts` fails the build on a missing variable. `src/app/[locale]/` with `(marketing)`, `(auth)` and `(app)`; the root layout reads the locale with `next/root-params`, so `/en` and `/fr` stay static. `/` redirects by saved choice, then `Accept-Language` (`fr-CM` → `/fr`, `de-DE` → `/en`). Messages in `src/messages/{en,fr}.json` with a key-parity test.
- One proxy pass: Supabase refreshes the session first and writes the cookies onto the request, then next-intl routes (`src/proxy.test.ts`). ESLint bans Supabase clients outside the data-access layer (tested). `robots.ts`, `sitemap.ts` with hreflang, optional Search Console tag. Localised 404 under a locale, bilingual global 404 otherwise.
- Reviewed 92/100. Findings fixed after review: cookies now reach Server Components in the same request; localised 404 under a known locale; versions pinned; build-time choices recorded in the spec's build notes.
- Left: Flovet to confirm the locale order (saved choice before `Accept-Language`); spec 04 now waits only on company facts.

## 2026-11-21: Privacy policy page built (spec 04)

- `/en/privacy` and `/fr/privacy`, static, no header or footer. Thirteen sections in 0011's order, a contents list in a grey well, "last updated" as a `<time>`, every string in `src/messages` under `privacy`. Added to the sitemap with hreflang.
- Facts from Flovet: company not registered yet (the page says so and names no one), contact through the contact page only, no DPO, minimum age 16, no AI training. Spec 04 updated to match.
- `TextLink` renders a native anchor for `#` links, so keyboard focus moves to the section.
- Left: the contact page (linked five times, 404 until built); company name and address once registered; legal and native-French review before launch.
- Reviewed 91/100. Fixed after review: transfer wording (Supabase and Vercel are US companies; safeguards "in their data processing agreements", not a named mechanism nobody checked); Google and LinkedIn described as sign-in services under their own policies, not processors; no promise of a profile editor that doesn't exist; cookie and log wording; French polish; `TextLink` keeps every anchor attribute on `#` links (tested). Launch gates added to spec 04's Check.

## 2026-11-21: Sign-in built (spec 05, issue #9)

- Decision 0012 approved (logos from Iconify's CC0 `logos` set allowed by Flovet). Spec 05 written.
- Built: `/[locale]/sign-in` (Google, LinkedIn, email code in two steps), `/[locale]/auth/callback` and `/auth/confirm`, `features/auth/{logic,schemas,queries,actions}.ts`, the `(app)` guard with a way back (`next`, set by the proxy), a temporary `/home` with Sign out, en/fr copy, brand marks with `SOURCES.md`, provider-button tokens, and the bilingual Magic Link template (`supabase/templates/`).
- 41 unit tests for the `next` check, error mapping and the email form state. `pnpm check` passes. Checked on the dev server: guard redirect, sign-in in en/fr, light/dark, 390/1440 px, field and URL errors, callback and confirm failure paths.
- First review 75/100. Fixed since: "Change email" state after a failed send, per-form spinners, the code field now describes where the code went, a countdown after a rate limit, clearer "unknown" error.
- Left: Flovet pastes the Magic Link template and tests Google, LinkedIn, code and link sign-in on port 3000; decisions on the logo, the merged code message and the LinkedIn mark (spec 05 build notes); then a second review.
- Addendum (Flovet): a temporary Sign in button on the placeholder home page, going to `/[locale]/sign-in`. No separate sign-up page: one page does both (0012).

## 2026-11-21: Sign-in refresh (spec 06)

- Approved 0010 (logo) and 0013. The sign-in page has no card now: one centred column, the 0010 icon above the title, and a footer with the account note, the Terms and Privacy line, and a support `mailto:` link. Body text gets `word-spacing: 0.06em` (Plus Jakarta Sans's space is 0.17em, the narrowest of 10 faces measured).
- 0014 (Terms page) is logged as Proposed. The sign-in page links to `/[locale]/terms`, which returns 404 until that page is built.
- Flovet reviewed the wider word spacing locally and dropped it (0015). 0014 approved.

## 2026-11-21: Terms page (spec 07)

- 0014 approved. Facts from Flovet: not a registered company yet, run from the United States, US law, minimum age 16.
- Built `/[locale]/terms` in en/fr with 12 sections from 0014, on a new shared `LegalDocument` layout that the privacy page now uses too. Added to the sitemap.
- Left: the contact page (both legal pages link to it), a US state once the company is registered, and a lawyer's review before launch.

## 2026-11-21: CV data model and PDF rendering proposed (0016, issue #5)

- Researched JSON Resume, Reactive Resume v6, OpenResume, react-pdf, headless Chromium on Vercel, Jobscan's ATS formatting guidance and the Postgres JSON docs. Indeed's and Greenhouse's ATS pages were gone (404), so no ATS vendor page backs the format rules.
- Proposed: `cvs`, `cv_versions` and an append-only `cv_revisions`, each with `user_id` and owner-only RLS; CV content as one Zod-validated `jsonb` document using JSON Resume names; AI changes only through accepted proposals that write a revision; PDFs with `@react-pdf/renderer` on the server, checked by a pdf.js text-extraction test. No Chromium.
- 0016 approved by Flovet in chat, with a note that #14 may render the preview in the browser.
- Naming agreed in chat: "CV" in code and data; on screen "CV" in French and "resume" in English (US) for now; an `en-GB` locale with "CV" when the UK launches. To be logged as 0017.
- Flovet then asked for regional locales from the start (shared links, countries beyond the launch markets). Proposed 0017, superseding 0003: three language-region locales to start (`/en-us`, `/en-gb`, `/fr-fr`; cut from 11 at Flovet's request, other countries map to one of them), base en/fr messages with small regional overrides, no redirect on deep links, "resume" only in en-US and en-CA. Research: Google hreflang and multi-regional guidance, Stripe, Apple, Notion, Airbnb, resume.io, next-intl routing docs.
- 0017 approved by Flovet in chat; 0003 marked Superseded by 0017.
- Spec 08 (regional locales) written, status Ready.
- Spec 09 (CV schema, RLS and data access, #10) written, status Ready. Applying its migration to the remote project waits on Flovet.
- Left: build spec 08, then spec 09.
- Renumbered when merging main, which had taken 0013–0015 and specs 06–07: CV data model is 0016, regional locales 0017, specs 08 and 09.

## 2026-11-22: Regional locales built (spec 08)

- `/en-us`, `/en-gb`, `/fr-fr` replace `/en` and `/fr`. `/` picks by saved choice, then `Accept-Language` (any French → fr-FR; English outside the US and Canada → en-GB). Shared links never redirect and never change the saved choice; next-intl's own detection and cookie are off. Old `/en`, `/fr` and mixed-case links redirect (308). Picker on the home and legal pages.
- Copy: `en.json` is now US English ("resume", "canceled"), including privacy and terms text; the "CV" wording moved to `en-GB.json`. Privacy and terms "last updated" set to 2026-11-22. A legal review should cover the en-US wording.
- Reviewed 96/100. Fixed after review: a broken decision link in specs 08 and 09, the cookie wording in the privacy policy, `Secure` on the locale cookie.
- Decision 0018 approved by Flovet: locale ids are the lowercase URL segments, not next-intl `prefixes` (supersedes that sentence of 0017).
- Left: a real sign-in from `/en-gb/sign-in` with real Supabase keys.

## 2026-11-22: Logo icon redrawn as a dot staircase (0019 approved)

- From a stepped-dot reference Flovet shared: six equal dots in three steps on a 20-unit grid, violet dots stepping in opacity, marigold top dot, flat violet tile (the reference's gradient not adopted, 0007). The favicon is the same staircase with bigger dots.
- 0010 was already approved, so the change is its own decision: 0019, superseding 0010's icon only (drafted as 0018, renumbered when main took 0018). Approved by Flovet in chat. All 13 SVGs and the brand guidelines updated.

## 2026-11-22: Brand assets in the app (spec 10, 97/100)

- `JubileeIcon` on the sign-in page draws the 0019 staircase in the theme's violet and marigold. Next.js's default favicon is replaced: `src/app/favicon.ico` (16/32/48), `src/app/icon.svg` and `src/app/apple-icon.png` (180), generated by `scripts/render-brand-icons.mjs` from `docs/design/brand/logo/`.
- `pnpm check` passes; sign-in checked at 1440 and 390 px in light and dark, en-us and fr-fr; the `<head>` links all three icons.
- Left: store icons, social images and a web manifest (no decision yet); the design canvas still shows the earlier icon.
