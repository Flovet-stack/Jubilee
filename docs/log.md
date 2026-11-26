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

## 2026-11-22: App icon and favicon on ink

- Flovet's request: the app icon, Apple icon and favicon now use an ink `#1d1a44` tile with `#a48cff` dots (opacity steps kept) and the marigold top dot, square like the reference. Regenerated with `scripts/render-brand-icons.mjs`.

## 2026-11-22: CV schema built (spec 09, issue #10)

- Migration `20261122111324_cvs` applied to `jubilee` with Flovet's go-ahead: `cvs`, `cv_versions` and append-only `cv_revisions`, owner-only RLS, no anon grants, composite `(id, user_id)` keys so nothing can point at another user's CV, column grants so owners and parents never change, a 256 kB content cap, and `restore_cv_revision` (security invoker) so a restore and its revision land together.
- `src/features/cv/`: the Zod content schema (JSON Resume names, `YYYY`/`YYYY-MM` dates, UUID ids), `logic.ts` (empty CV, `migrateContent`, typed results), `queries.ts` and `actions.ts`. Types regenerated from the remote schema (unchanged from the hand-written ones).
- Evidence: `supabase/tests/cvs.sql` on `jubilee` returned "all checks passed" and rolled back; 0 test rows after. Advisors: only the project-wide leaked-password warning (no passwords used). `pnpm check` passes.
- Reviewed 96/100. Fixed after review: wider SQL tests, a duplicate-entry test, UUID checks, the restore read moved to `queries.ts`.
- Flovet approved dropping the English restore note: new migration `20261122123552_restore_without_note.sql` (restore revisions get no note; the UI labels them). Applied to `jubilee`; the SQL tests, now checking the note is empty, passed and rolled back.
- Left: consider measuring the size cap with `octet_length`.

## 2026-11-22: Spec 11, pull request checks (97/100, issue #7)

- Decision 0023 approved by Flovet (0020–0022 skipped: held by open PR #56). `.github/workflows/check.yml` runs `pnpm check` on every PR to `main`: `pnpm/setup` (pnpm from `packageManager`, Node 24), `.next/cache` cached, actions pinned to SHAs, `contents: read`, placeholder public env, no secrets.
- `pnpm check` passed locally with only the placeholders; the first Actions run on PR #58 was green.
- Left for Flovet: make `Check` a required status on `main` (branch protection). The Vercel preview fails on this PR and on #55 alike; not caused by this change.

## 2026-11-22: Decision 0020 proposed, control sizes

- Flovet found 48 px controls too heavy for dense screens like the CV editor. 0020 (Proposed) adds a scale: `lg` 48 for single-task screens, `md` 40 as the default, `sm` 32 for inline row actions, never under 44 px on touch. Research: WCAG 2.5.8, NN/g, Carbon, Primer, Atlassian.
- Left: a spec to build it.

## 2026-11-22: 0020 approved; 0021 and 0022 proposed; component quality bar

- Flovet approved 0020 in chat; 0009's status notes its control heights are superseded.
- 0021 (Proposed): `PhoneField`, `DateField` / `DateRangeField`, `PasswordField`. Research: GOV.UK phone, date and password patterns, NN/g date input and password masking, React DayPicker; package licences checked with `npm view`.
- 0022 (Proposed): radius scales with size. Research: Atlassian, Primer, Fluent 2, Spectrum. No source links radius to text readability; dense systems use smaller radius on smaller elements.
- Brief: a component quality bar (reusable, every state, edge cases handled).
- Flovet approved 0021 and 0022 in chat the same day; 0007's status notes its control and card radius are superseded by 0022.
- Spec 12 written (Ready): control sizes and radius, implementing 0020 + 0022.
- Left: write the 0021 spec (phone, date, password fields).

## 2026-11-22: Control sizes and radius built (spec 12)

- Tokens: `--control-h-lg` 48, `--control-h` 40, `--control-h-sm` 32, raised to 44 under `pointer: coarse`; radius `control-lg` 8, `control` 6, `control-sm` 4, `card` 8 (wells 12, sheets 16 unchanged). `cn()` knows the new names. `src/lib/sizes.test.ts` guards them.
- `Button`, `IconButton`, `Input`, `Textarea`, `Select` take `size` (lg / md / sm, md default). Cards, menus, select lists, tooltips, alerts, radio cards and inner pattern panels use the card radius.
- Sign-in fields, provider buttons and main action on `lg` (looks as before); "Change email" and "Resend" moved from sm to md (one group); landing sign-in link on `lg`. Alert, UndoLine and MarkedChange actions stay `sm` (inline). Toast buttons use the sm tokens. List rows keep 44 px and tabs keep 6 px, both documented.
- `/design-system`: three sizes for buttons and fields, the radius scale, and a "Dense screen" CV-editor sample.
- Evidence: `pnpm check` passes (185 tests, build). Browser at 1440 px and 390 px touch, light and dark: lg 48/8, md 40/6, sm 32/4 with a mouse; md and sm 44 px on touch; no sideways scroll.
- Reviewed 88, then 93/100 after fixing raw toast heights, the undecided toast and tab radius, and two gallery radii.

## 2026-11-22: Design work merged with main again

- main had taken spec 11 (pull request checks) and decision 0023, so the control sizes and radius spec became spec 12. Decisions 0020–0022 kept their numbers (0023 had skipped them).

## 2026-11-22: Spec 13 written, phone, date and password fields

- Spec 13 (Ready) implements 0021: `PhoneField`, `DateField` (year, month, day), `DateRangeField` (with "Current"), `PasswordField`; every state, all three sizes, copy through props, tests for phone and date parsing in English and French, and a bundle check that the libraries load only where used.
- Left: none (built below).

## 2026-11-22: Phone, date and password fields built (spec 13)

- Added libphonenumber-js 1.13.17, country-flag-icons 1.6.20, react-day-picker 10.0.2 and date-fns 4.4.0 (approved in 0021).
- `PhoneField`: flag and dial-code button opening a searchable Base UI Combobox (names from `Intl.DisplayNames`), free typing, checked on blur and submit, a pasted `+` number picks its country, E.164 value. Flags are static SVG files at `/flags/XX.svg` (265 prerendered), so no page bundles the set.
- `DateField` (year, month, day) and `DateRangeField` ("Current", one range calendar, two months from 1024 px), typing first, DayPicker restyled with our tokens. `PasswordField` with show/hide, hide on submit, Caps Lock hint. All controlled or uncontrolled, three sizes, copy through props; `fields.*` in en and fr. New `FieldSet` for multi-control fields.
- Tests: phone (US, GB, FR, CM, paste, wrong country), dates in English and French (separators, month names, leap years, min/max), range order, and submit behaviour (`src/lib/form-events.ts`). 224 tests pass; `pnpm check` passes.
- Browser (fr-fr, 1440 light and 390 touch dark): paste switches to Cameroun, French errors with an example number, country search, two-month calendar, range pick, end-before-start error on "To", password hides on submit, 44 px touch targets, no sideways scroll; sign-in and landing load none of the new libraries.
- Reviewed 85, then 98/100 after adding controlled values, a DOM-free submit test and a token font size.

## 2026-11-22: CV builder built (spec 14, #14)

- Decisions 0024 (editor, preview, autosave), 0025 (Classic template, Carlito) and 0026 (four-corner entries) researched and approved; spec 14 written on them.
- Built: Home list and "Create a CV"; the editor at `/[locale]/cvs/[id]` with the section list, guided first pass, forms for every entry kind (date range and phone fields from spec 13), bullets, skill lists, Undo on delete, hover-and-focus row actions with a fine pointer; guidance per section in en, en-GB and fr.
- One semantic tree (`src/features/cv/tree.ts`) feeds the Classic HTML preview (Carlito Latin subsets, about 37 KB each, OFL); the react-pdf template in #15 reads the same tree.
- Autosave: about 1 s after typing, version-checked (`saveContent` returns `conflict` instead of overwriting), only valid content sent, one `user` revision per visit, nothing in browser storage. No migration.
- Browser (1440 light and dark, 390 French): create → Contact → Next through Summary by keyboard, title follows the name, "Mar 2021 – Present" in four corners, two-tab conflict refused and the newer edit kept in Supabase, three revisions for three visits. Fixed on the way: a server call to `buttonVariants`, a stuck "Saving…", dates not prefilled, headings in the UI's language instead of the CV's.
- Reviewed 84, then 91/100 after ordering renames and saves, an `invalid` status, a full-height phone preview and build notes. Not run: offline, too_large, a 20-section CV.

## 2026-11-24: Design skills added (better-ui, emil-design-eng)

- Installed `jakubkrehel/skills` → `better-ui` and `emilkowalski/skills` → `emil-design-eng` into `.claude/skills/` (and globally) with the `skills` CLI; sources pinned in `skills-lock.json`. Markdown only, no scripts.
- No spec (tooling only). Not reviewed (no spec to score against).

## 2026-11-24: Product-team skill asks the four user questions

- `product-team` now answers four questions for one named user before any idea, screen, component or interaction: why they open it, how they use it, what they want next and how we take them there, and what we leave out. They're written as a User lens block. It's used in Workflow A, the spec template (Workflow D) and the Product check in Workflow E. The same change was made to the global copy.
- No spec (tooling only). Not reviewed (no spec to score against).

## 2026-11-24: App shell and sidebar (decision 0027, spec 15)

- Decision 0027 (renumbered from 0024, which main had used) approved after two revisions: account and Help at the bottom, logo with notifications and collapse on top, four links (Home, Job search, Applications tracker, To approve), no Letters or Follow-ups pages, and an empathy-based User lens (calm notifications, no rejection pings, neutral counts).
- Built `src/features/shell/`:
  - the padded grey frame and the white content window;
  - the collapsible sidebar, with a cookie and `Ctrl/⌘+B`;
  - the saved CVs list (empty, loading and error states);
  - the account menu (Settings, language, sign out) and the notifications empty state;
  - the phone sheet;
  - placeholder pages for Job search, Applications tracker, To approve and Settings.
- Home lost its Sign out button. The CV editor now uses a container query, so it fits inside the window.
- Checks: `pnpm check` passes (253 tests, build).
- Browser: 1440 light and dark, 1024 with the editor (expanded and collapsed), and 375 fr-fr (sheet, title, 44 px targets, no overflow).
- Keyboard: Tab goes logo, bell, collapse, links, CVs, Help, account, with a visible ring.
- Review: 88, then 93/100.
- Left:
  - sign-out not run in the browser;
  - the screenshot matrix at 390 and 1440 in both themes is partial;
  - Escape-return and the sheet's focus trap weren't demonstrated;
  - the `Date.now()` prerender warning from the `(app)` guard predates this work.

## 2026-11-25: Button spacing from the type (spec 16, decision 0028)

- Decision 0028 approved, then revised by Flovet before merge: controls are 40 / 32 / 24 px with a mouse (lg / md / sm), 44 px on touch for all three. Supersedes 0020's mouse heights.
- `.jb-button` in `components.css`: `--px = --py + (1lh − 1cap) / 2`, gap `--px`, icons one line box square with `margin-inline: --py − --px`; icon-only padded `--py`. Fixed-px fallback without `lh`/`cap`. `Button`, `IconButton`, `ButtonLink` and `buttonVariants` users all pick it up; the phone field's country trigger lost its spacing override.
- Measured on `/design-system`: heights 40/32/24; icon to edge = icon to top = 8/6/4 px; icon-only square; inputs match at 16 px text; fallback gives the same; touch 44 px everywhere.
- Reviewer: 94/100. Its findings (phone trigger override, untested fallback and field heights) were fixed or measured afterwards.
- Left: `sm` fields are 24 px with 16 px text, so they're tight on mouse; watch the CV editor rows.

## 2026-11-25: Type spacing in every control (spec 17, decision 0029)

- Re-read Flovet's notes: `--py` is 0.5em at every size and `line-height` 1.5, so a size is a font size. 0029 (approved: "Font sets size") makes controls 40 / 35 / 30 px at 16 / 14 / 12 px text, 44 px on touch.
- Shared classes in `components.css` (`jb-type`, `jb-type-icon`, `jb-type-square`, `jb-field*`, `jb-type-badge`) now space buttons, inputs, textarea, select trigger and options, menu items, tabs, badges, tooltip, toast action and close, sidebar rows and the phone field. Fields keep 16 px text and take `--py` from their height; end controls (clear, reveal, calendar) match the start icon.
- The rule lives in the new `type-spacing` skill; CLAUDE.md and the reviewer skill point to it.
- Measured on `/design-system`: icon → edge = icon → top = `--py` at every size; start and end icons in a field match (24 px at 5.5 px); badges 25.2 px at line-height 1.5; all 126 controls at least 44 px on touch.
- Reviewer: 81, then 96/100 after fixes (Tailwind `text-sm` line-height override, badge icon, a padded "⋯" button, fixed icon sizes, end slot, tests).
- Flovet approved the 0029 amendment (sidebar rows 40 px with a mouse, superseding 0027's 36 px; avatars and text links exempt). Spec 17 Done (96/100).

## 2026-11-25: Icon size from the font size (spec 18, decision 0030)

- Icons in controls were 150 % of the text (`1lh` at `line-height: 1.5`). Research: IBM Carbon pairs 16–20 px icons with 14–16 px text (1.0–1.25 ×); Atlassian uses 16 px icons with 14 px text (about 1.14 ×). Flovet chose 1.125em (about 110 %).
- `--icon: 1.125em` and `--icon-inset: (1lh − --icon) / 2` on `.jb-type` and `.jb-field`. The inset is added at the icon's sides too, so an icon still sits as far from the edge and the text as from the top. Heights unchanged.
- Measured on `/design-system`: icons 18 / 15.75 / 13.5 px (1.125 ×); icon to edge = top = text (11 px at lg); icon-only square; field start and end icons 18 px at 8.5 px; phone list check 11 px from the edge; all 126 controls at least 44 px on touch.
- Checks pass (259 tests, build). Reviewer: 97/100; its phone-list and comment findings fixed.
- Left: the `/design-system` icon intro still says "20 px in UI, 24 px in navigation", and `--icon-ui` / `--icon-nav` look unused. Both predate this task.

## 2026-11-25: Sidebar polish (Flovet's review of spec 15)

- The sidebar now shows the real logo from `docs/design/brand/logo/jubilee-logo.svg` (new `JubileeLogo`), or the icon in the collapsed rail.
- New `--desk` token for the shell background: #fafafa in light; dark keeps the well colour. Contrast tests added for ink and ink-muted on the desk.
- Sidebar rows:
  - grey (`ink-muted`, about 8:1);
  - the current page in ink (black) on a wash, no longer violet;
  - medium weight, with icons at a 1.75 px stroke.
- The account button is now a standard row: 40 px, 6 px radius and the same type spacing, with the avatar in the icon slot.
- Checks: `pnpm check`. Measured in the browser at 1440 px.

## 2026-11-25: Account menu and dark colours (Flovet's review)

- **Account menu** is now a popover laid out like Flovet's reference:
  - photo, name and plan badge ("Free" until the pass ships), with no email;
  - a dark mode switch;
  - Settings;
  - Language as a three-way switch (EN-US / EN-GB / FR) with arrow keys;
  - Sign out in red;
  - a footer with the version and a link to the terms.
  - No "Need help?": Help is already in the sidebar.
  - Shadow from the new `--shadow-menu` token, with Flovet's two values.
- **Dark mode switch:** saves light or dark in this browser only (localStorage). A small `<head>` script applies it before paint; with no choice saved, the system setting still wins. CSS dark tokens now apply under `:root[data-theme="dark"]` and skip `data-theme="light"`.
- **Dark colours:** the desk is now #0e120e and the card / content window #060d08. Dark contrast tests pass.
- Three static icons drawn in-house: moon, language, log out.
- **Checks:** `pnpm check`. In the browser: menu layout, shadow values, the dark switch, the new dark colours, and the saved theme surviving a reload.
- **Left:**
  - other dark tokens (page, well, line, tint) are still violet-tinted;
  - sign out still not run;
  - phone width not checked.

## 2026-11-25: Neutral dark palette (Flovet's review)

- Dark tokens moved off violet to neutral greys in the same family as the new desk (#0e120e) and card (#060d08):
  - page #0a0f0b, well #141a15, line #262d27, field #7c837d;
  - ink #f1f3f1, ink-muted #b3bab4, ink-subtle #929993;
  - stage-saved #adb3ae, and a neutral scrim.
- Violet stays only where it means something: the action colour, the focus ring and the tint (selected backgrounds).
- Checks: `pnpm check`, including the contrast tests. Home at 1440 px in dark, in the browser.

## 2026-11-25: Saved-CV rows: headline, name, marquee, many CVs (Flovet's review)

- **Rows:** read "Headline | Full name", taken from each CV's basics. `listCvs` selects only those two JSON fields, never the whole document.
- **Text size:** rows are one step smaller (14 px, 35 px rows), so more of the name fits. Cut-off text fades at the end.
- **Marquee:** hovering with a mouse, or focusing with the keyboard, scrolls cut-off text to its end and back at about 40 px/s. It only moves when the text doesn't fit. Reduced motion and touch don't move; the full text is in the row's title and accessible name.
- **Edge cases handled:**
  - **No headline:** the row falls back to the CV's title, then to "Untitled resume / CV".
  - **Name:** a blank name is dropped, and a name equal to the headline isn't repeated.
  - **More than 8 CVs:** the list scrolls inside its section with a bottom fade, and a filter box appears. The filter ignores case and accents, and shows "No resume matches" when nothing fits. Help and the account stay pinned.
  - **Same headline twice:** the language and market tag still tells the rows apart.
- **Tests:** `cvRowText` and `matchesCv`.
- **Design system:** a "Many CVs" state on `/design-system`.
- **Left:**
  - the sidebar list refreshes on the next navigation, not while you type a new headline in the editor;
  - phone width not checked.

## 2026-11-25: Saved-CV rows without the language tag (Flovet's review)

- Removed the language and market tag from each saved-CV row. It doesn't tell two CVs apart when both have the same title and language. What should tell them apart is left for a later decision.
- **Test data:** added 11 resumes to the test account in Supabase (12 in total), each copied from the existing CV with different basics:
  - a duplicate of the existing CV;
  - a long headline;
  - no headline;
  - no headline and no name;
  - no name;
  - a name equal to the headline;
  - French accents;
  - a whitespace-only headline;
  - a long name;
  - two plain ones.
- **Found while adding them:** `cvs.title` can't be empty (check constraint), so the "Untitled" fallback only guards against bad data.
- Checks: `pnpm check` (267 tests, build).

## 2026-11-25: CV editor in two panes, top bar, review without AI (spec 19, decision 0031)

- **Research and decision:** Flovet asked for a redesign of the editor. Research covered Reactive Resume's AI docs, the Rezi Score, Enhancv feedback, web.dev AI patterns, and Teal's "Improve with AI" (search summary only; the page returned 403). Decision 0031 was approved: two panes, a top bar, and review flags on sections. The flags come in phase 1 without AI; "Suggest a rewrite" waits for an AI provider decision.
- **Top bar:**
  - a back button;
  - the name, renamed by clicking it (Enter saves, Escape cancels, focus returns to the name);
  - the automatic name "{headline} · {name}", which follows the content until the user renames it;
  - a More menu with Duplicate (`duplicateCv`, which removes a half-made copy) and Delete (a dialog, then Home).
  - Both actions call `refresh()`, so the sidebar updates. Export and Find jobs aren't shown until #15 and feature 7.
- **Two panes:**
  - **Left:** the section list with entries under each section. With a mouse, an entry's actions show on hover and focus; on touch they're always visible. Edit opens the section's form at that entry, in place of the list.
  - **Right:** Preview and Review tabs. While a form is open, a Guidance tab comes first and is selected.
  - **Narrow windows:** the same tabs in the sheet.
- **Review:** `review.ts` holds 8 pure checks. Findings show in the Review tab with "Go to it", and as muted markers and lines on the list. There's no score, and nothing is sent anywhere.
- **Checks:** `pnpm check` passes (275 tests, build). In the browser:
  - 1440 px in light and dark;
  - 390 px, including the sheet;
  - fr-fr;
  - rename, duplicate and delete on a test resume, which was then deleted.
- **Reviewer:** 84, then 95/100 after fixes (Guidance back in the sheet as 0031 says, focus after a rename, row states, icon sizes, error copy by code, labels, tests).
- **Left:**
  - not yet run: a screen reader pass, a 50-entry section, a long French name in the bar;
  - the section row's `px-3 py-2` predates this task and isn't type spacing;
  - pre-existing: the `Date.now()` prerender error from `AppLayout`, and "Create a CV" doesn't refresh the sidebar.

## 2026-11-25: Product-team skill, four questions on every decision

- Widened the four questions (why this user opens it, how they use it, what they want next, what we leave out) from "before any idea, screen, component or interaction" to every decision, design and detail, however small. Added them to decision entries (Step 2), ground rules, Workflow B and Workflow C. Same change in the global skill (`~/.claude/skills/product-team`).
- No spec (tooling only). Not reviewed (no spec to score against).

## 2026-11-25: Resumes page and five-row sidebar list (spec 20, decision 0032)

- Sidebar shows at most 5 resumes; from 6, "View all resumes (N)" links to the new `/cvs` page. Removed the sidebar filter field and bottom fade.
- New Resumes page: one Create button, search from 6 resumes (accent-insensitive) with a live count, rows "Headline | Name" with "Edited …", empty/error/no-match states.
- Checked in the browser on the 12-resume test account: 375/390 px and 1440 px, light and dark, en-us/en-gb/fr-fr.
- Reviewer 87/100; must-fix ("Edited just now") applied afterwards. Full `pnpm check` passed before that fix; not re-run after it (skipped at Flovet's request).

## 2026-11-26: 14 px base and type sizes by role (spec 21, decision 0033)

- Tokens: 12 caption, 13 secondary, 14 body (base), new 16 `text-md`, 18 section, 24 page title, 32 display; `text-xl` and `text-4xl` removed.
- Fields use `--text-field`: 14 px with a mouse, 16 px on touch (iOS zoom). Buttons lg 16, md 14, sm 12.
- Every size mapped to its role: app page titles 24, dialog/legal/well titles 18, legal body 16/1.6, badges 12, muted hints 13.
- `pnpm check` passed (283 tests, build). Browser: /cvs body 14, h1 24, field 14 mouse / 16 touch; privacy page at 390 dark.
- Reviewer 84/100; its four must-fixes (sign-in display size, editor step heading, design-system headings and intro) applied, not re-graded.

## 2026-11-26: Grid Auditor overlay (spec 22, decision 0034)

- Vendored `grid-auditor` 0.1.0 (`vendor/grid-auditor-0.1.0.tgz`, `file:` dependency). `pnpm-workspace.yaml` excludes it from `minimumReleaseAge`, because pnpm 11 can't find it on npm and the frozen install fails otherwise.
- `src/components/grid-auditor.tsx`, rendered once in the locale layout: always on in dev. In production it needs `NEXT_PUBLIC_GRID_AUDITOR=true` plus `?grid=1`, which is kept in localStorage until `?grid=0`. The library loads only through a dynamic import. Flag validated in `src/env.ts`, documented in `.env.example`.
- Checked in the browser:
  - dev: Shift+G and Ctrl+Shift+G work, no console errors or hydration warnings;
  - `next start` without `?grid=1`: the 69 KB library chunk is never requested;
  - with `?grid=1` it works, persists across locales, and `?grid=0` clears it;
  - 390 px and 1440 px.
- Format, lint, typecheck, tests (283) and the build pass. One earlier test run had a single file fail under machine load; the re-run was clean.
- Reviewer 98/100; its one suggestion (`.catch` on the import) applied afterwards.

## 2026-11-26: Dark mode greys for the shell

- Flovet's values: desk #171717, content window and cards #161616, borders #232323 (`--desk`, `--card`, `--line` in both dark blocks of `globals.css`).
- Page #171717 (same as the desk) and wells #1c1c1c, so no green tint remains in the surfaces.
- Token contrast tests pass (56). Checked /cvs and /privacy at 1440 px dark.

## 2026-11-26: Darker dark content window, neutral dark greys

- Dark `--card` (content window, cards) #161616 → #131313, a shade darker (Flovet).
- Removed the last green tint from dark tokens: ink #f2f2f2, ink-muted #b6b6b6, ink-subtle #969696, field #808080, stage-saved #b0b0b0, scrim rgb(3 3 3 / 0.64).
- Token contrast tests pass (56). Checked /cvs at 1440 px dark.

## 2026-11-26: Sidebar header and flush account menu (spec 23, decision 0035)

- Account button: up/down chevron. Collapsed rail: the logo mark is the expand button; the separate toggle is gone. Logo 18 px, mark 20 px.
- Account menu: new `--menu` token (#ffffff / #1f1f1f), no inner padding, rows and dividers edge to edge, as wide as the sidebar content (232 px). Order: name and plan, Dark mode (small switch 34 × 20), Settings, Language, Sign out. Version and Terms footer removed.
- Language opens a panel in the same menu (back row + full language names, check on the current one); slide-and-fade content and height animation, off under reduced motion. Keyboard: → opens, ← / Escape back, Escape again closes.
- Fixed: on touch, tapping Language closed the menu (the pressed row unmounted and looked like an outside press).
- `pnpm check` passed (289 tests, build). Browser: 1440 px dark (menu, keyboard path, collapsed rail), 390 px light fr-fr (sheet, menu, language panel).
- Reviewer 78 → 88/100; its last must-fix (height animation) was built after, not re-graded.

## 2026-11-26: Account menu rows inset, lighter dividers

- Rows sit 4 px in from the menu's edges with `--radius-control`; dividers stay edge to edge (Flovet).
- New `--menu-line` for the dividers, set so its contrast with `--menu` matches `--desk` against `--line` (dark 1.14:1): dark #292929, light #e9e8ee.
- Fixed: the forced-dark theme block had no `--menu`, so the menu was white when dark mode was switched on by hand.
- Token tests pass (62); lint and typecheck pass. Checked at 1440 px dark.

## 2026-11-26: Decision 0036, a swappable AI layer (Proposed)

- Researched providers (Anthropic, OpenAI, Gemini, Mistral, Groq, OpenRouter, Vercel AI Gateway), the Vercel AI SDK, data terms, EU processing and the EU AI Act. Logged 0036 as Proposed.
- Revised the same day on Flovet's input: the Vercel AI SDK with a per-task router in `src/lib/ai/` (seven tasks, each routed to a `provider:model` with fallbacks); evals decide when a task moves to a cheaper model; every task starts on Claude Haiku 5.5; free tiers get test data only.
- Maps the MVP: AI in features 2, 4, 5, 6, 10; light in 7; optional in 1; none in 3, 8, 9.
- Left: Flovet to approve 0036, the starting model, the two packages and the env var, and the daily caps. Mistral's terms and EU hosting are unverified.

## 2026-11-26: Decision 0036 approved

- Flovet approved 0036 (in chat), with Claude Haiku 5.5 as the starting model for every task. Status line, index and brief updated. Renumbered from 0034, which main had taken for the Grid Auditor decision.
- Left: write the AI foundation spec (router, registry, routing table, usage log, caps, eval script, privacy page). Before building: Flovet to approve adding `ai`, `@ai-sdk/anthropic` and `ANTHROPIC_API_KEY`, create a Console API key in a Jubilee workspace, and set the daily caps.

## 2026-11-26: Layered control surfaces, Geist and radius trial (spec 24, decision 0037)

- New tokens `--control`, `--control-hover`, `--control-press`, `--control-active`, `--field-well` and shadows `--shadow-raised`, `--shadow-primary`, `--shadow-primary-press`, `--shadow-recessed` (light and both dark blocks).
- Primary: violet with a top glow, bottom shade, inner and darker-violet outer rings. Secondary and quiet-on-hover: raised. Fields: recessed well, keeping the `--field` ring for 3:1. Sidebar active row: raised tab. No CSS borders; forced-colors gets a 1 px ButtonBorder outline.
- Design-system page: "Geist" in the font switcher and a Radius switch (ours / pill, not saved).
- `pnpm check` passed. Browser: 1440 px dark (buttons, fields) and light (secondary values); trial CSS checked by setting its attributes.
- Reviewer 84/100; must-fixes (radius not saved, focus-ring 3:1 tests) applied, not re-graded.

## 2026-11-26: Spec 25, AI foundation (Ready)

- Wrote spec 25 implementing 0036: `runTask`, routing table, registry, usage log table with RLS, daily limits, eval script, privacy page update.
- Flovet approved (in chat): `ai` and `@ai-sdk/anthropic`, `ANTHROPIC_API_KEY`, the `ai_usage` table, and daily limits of 10 (free) and 100 (pass).
- Key saved to the local `.env.local` only; it was pasted in chat, so rotate it before launch.

## 2026-11-26: Spec 25 built, AI foundation (in review)

- `src/lib/ai/`: `runTask` (validate, strip contact details, daily limit, routed model and fallbacks, output schema, one usage row per attempt), routing table (all seven tasks on Claude Haiku 5.5), provider registry, Anthropic prompt caching, pricing, limits (10 free, 100 pass; everyone free until #35).
- `ai_usage` table with RLS and `log_ai_usage`; tested on the real project inside a rolled-back transaction (own rows only, direct inserts blocked, nothing kept). Not applied yet.
- `ANTHROPIC_API_KEY` (optional, server only), `ai` and `@ai-sdk/anthropic` pinned; lint rule keeps the AI SDK inside `src/lib/ai`. Privacy page names Anthropic (en, en-GB, fr); `ai.errors` copy.
- `pnpm check` passed without the key; 28 AI tests. `pnpm ai:eval cv.import` reached Anthropic but the account has no credit, so no live pass yet.
- Reviewer 86/100; deviations recorded in the spec, fallback logging and the address matcher fixed after. Left: add API credit, rerun the eval, re-grade, apply the migration.

## 2026-11-26: Decision 0038, Groq free tier for evals; eval run

- The Anthropic key works but the account has no API credit (a Claude Pro plan doesn't pay for API calls). Flovet chose a free provider for testing: 0038, Groq's free tier, made-up fixtures only, never registered for `runTask`.
- Added `@ai-sdk/groq` 4.0.87 (pinned) and an optional `GROQ_API_KEY`; `pnpm ai:eval --provider groq` runs every task on `openai/gpt-oss-120b`.
- Result: 7 of 8 cases pass. `email.followup` fails each run: Groq's JSON mode rejects its placeholder prompt; its feature spec writes the real prompt and schema.
- Both keys were pasted in chat: rotate them before launch.
