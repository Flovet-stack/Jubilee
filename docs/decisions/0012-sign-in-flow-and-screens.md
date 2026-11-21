# 0012: Sign-in flow and screens

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Tech Lead, PM, Product Designer, UX, UI, Copy, Frontend, Backend)
- **Approved:** 2026-11-21 by Flovet, with one change before approval: the brand logos may come from another icon library when ours lacks them (see "Provider buttons")
- **Builds on:** 0004 (methods, callback route), 0006 (email code, profiles, identity linking), 0007–0009 (visual system), 0003 (en/fr)
- **Specs:** (filled in by the sign-in spec for #9)

## Context

0004 and 0006 settle _which_ sign-in methods exist and what is stored. Issue #9 needs the part users see and the routes behind it: one page or two, the order of options, how the email code step works, how Google and LinkedIn buttons may look, where people land, how routes are protected and how they sign out. None of this is logged, so it can't be built yet.

Google and LinkedIn now both sign in end to end on the `jubilee` project (checked by Flovet on 2026-11-21 through `/auth/v1/authorize?provider=linkedin_oidc`).

Brief: "Personal data … is sensitive: least privilege." "Many users job-hunt on their phones."

## Research

| Reference                                                 | What they do                                                                                                                                                                                                                                                                                                                                      | Adopt / adapt / reject | Why                                                                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase: Passwordless email sign-in                      | `signInWithOtp` sends one email; the same message can carry a link and a 6-digit `{{ .Token }}`; signs the user up unless `shouldCreateUser: false`; with PKCE the link goes to `/auth/confirm?token_hash=…&type=email` and is checked with `verifyOtp`; one request per period, the code expires after a set validity (Auth > Providers > Email) | Adopt                  | One call covers sign-in and sign-up; the code works when the email opens on another device                                                                  |
| Supabase: Next.js server-side auth (with-nextjs tutorial) | OAuth callback route calls `exchangeCodeForSession(code)` and redirects to `next`, accepting it only if it starts with `/`                                                                                                                                                                                                                        | Adapt                  | `startsWith('/')` still lets `//evil.com` and `/\evil.com` through; we accept only a locale path on our own origin                                          |
| Supabase: Production checklist                            | Custom SMTP default limit is 30 new users per hour                                                                                                                                                                                                                                                                                                | Adopt (as a limit)     | Confirms 0006: email sign-in waits for the email decision (#24)                                                                                             |
| Google: Sign-in branding guidelines                       | Custom buttons allowed; must use the full-colour "G" unchanged in size and colour, on white, neutral or dark fill (light: `#FFFFFF`, 1 px `#747775` stroke, `#1F1F1F` text; dark: `#131314`, `#8E918F`, `#E3E3E3`); text "Sign in / Sign up / Continue with Google", localised; at least as prominent as other providers; G padding 12 / 10 px    | Adopt                  | Needed for Google's app verification                                                                                                                        |
| LinkedIn: Brand guidelines and [in] logo page             | Use only downloaded official assets; [in] in blue, black or white only, preferably blue on white; never recolour, reshape or imply endorsement. No published "Sign in with LinkedIn" button spec                                                                                                                                                  | Adapt                  | Same button shape as Google, with the official blue [in]. LinkedIn's OIDC page also says it "does not verify user identities", so we never call it verified |
| GOV.UK: Confirm an email address                          | After sending, show the address used, what to do next, resend, and change the address; explain expiry and why when a code fails                                                                                                                                                                                                                   | Adopt                  | The "check your email" step                                                                                                                                 |
| web.dev: SMS OTP form                                     | One `<input type="text" inputmode="numeric" autocomplete="one-time-code" pattern="\d{6}">`, no `type="number"`, no split boxes                                                                                                                                                                                                                    | Adopt                  | Works with paste, autofill and screen readers                                                                                                               |
| 0007–0009                                                 | One violet button per screen; buttons 48 px; forms max 640 px; one icon set, brand marks not covered                                                                                                                                                                                                                                              | Adapt                  | Brand logos are a narrow exception, not a second icon set                                                                                                   |

Sources (opened 2026-11-21):

- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- https://supabase.com/docs/guides/deployment/going-into-prod
- https://developers.google.com/identity/branding-guidelines
- https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- https://brand.linkedin.com/policies and https://brand.linkedin.com/in-logo
- https://design-system.service.gov.uk/patterns/confirm-an-email-address/
- https://web.dev/articles/sms-otp-form

**Gaps:** NN/g's magic-link article returned 404, so the order of options and the combined sign-in/sign-up page rest on Google's prominence rule and the sources above, not on NN/g. The sign-in screens of the design references in 0007 weren't opened in a browser. Look at them before approving if you want that evidence.

## Options

**Pages**

1. **One page, `/[locale]/sign-in`, for sign-in and sign-up** ("Continue with…"). Pros: Supabase creates the account on first use anyway, so nobody has to remember whether they have an account yet. Cons: the first-time user gets no separate welcome step (onboarding, 0008 §2, comes after).
2. **Separate sign-in and sign-up pages.** Cons: the two pages would do the same thing, and choosing the wrong one becomes an error state.

**Where people land after sign-in.** The app shell decision isn't made (README "Still to decide").

1. **A temporary signed-in home** at `/[locale]/(app)/home`: a greeting with the profile name and a Sign out button, replaced when the app shell lands. Pros: unblocks #9 now. Cons: one throwaway screen.
2. **Decide the app shell first.** Cons: blocks auth on a larger decision.

## Decision

Pages option 1 and landing option 1.

### The sign-in page (`/[locale]/sign-in`, in `(auth)`, no app shell)

- A single centred card on the page, max 400 px wide (inside 0007's 640 px form width). The order: the logo, the heading "Sign in to Jubilee", **Continue with Google**, **Continue with LinkedIn**, a divider reading "or", an Email field, and **Email me a code** (the one violet button). Below that, one line: "New here? This creates your account." plus a link to the Privacy policy (0011). A Terms link is added when #37 ships.
- **Provider buttons:** 48 px tall, full width, the same size and weight as each other, styled as secondary buttons using Google's light and dark colours above (close to our `--card` / `--field`). Our set (Hugeicons) has only one-colour outline versions of these logos, which break both brands' rules. Flovet allowed another icon library for them (2026-11-21), on one condition: the mark must be the full-colour Google "G" and the blue LinkedIn [in], in their official shapes. The first choice is Iconify's `logos` set (`logos:google-icon`, `logos:linkedin-icon`, CC0), copied as SVG into `src/components/brand/` with its source and licence noted, so no package is added. The fallback is each brand's own asset download. One-colour library versions (Hugeicons, Simple Icons, Lucide) are not allowed. This is the only exception to 0009's single icon set. They are never animated, recoloured or resized out of ratio. The button label uses our font (Google asks for Google Sans; see Consequences).
- **Copy (en / fr):** "Continue with Google" / "Continuer avec Google", "Continue with LinkedIn" / "Continuer avec LinkedIn", "Email me a code" / "Recevoir un code par e-mail". Final wording goes through the Copy role at spec time, in the message files (0003).

### The email code step (same page, second state)

- After **Email me a code**, the page shows: "Check your email", then "We sent a 6-digit code to **name@example.com**." It also shows a single code field (`type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, 6 digits, paste allowed, spaces stripped), the **Sign in** button, and two quiet actions: **Change email** and **Send a new code**. The resend action shows a countdown until the rate limit allows another code.
- The email holds the code first and the link second (0006). The link goes to `/[locale]/auth/confirm?token_hash=…&type=email` (PKCE), which calls `verifyOtp` and redirects like the callback does.
- **Remote change (approving this decision approves it):** edit the Magic Link email template on the `jubilee` project to show `{{ .Token }}` and the `token_hash` link, in English and French text in one message (Supabase has one template per project). Code length 6 and the default validity stay as they are.

### Routes and session

- `/[locale]/auth/callback` (0004) handles Google and LinkedIn: `exchangeCodeForSession`, then a redirect.
- **The `next` redirect:** it must be a path on our own origin that starts with `/en/` or `/fr/` and doesn't start with `//` or `/\`. Anything else falls back to `/[locale]/home`. This is a pure function with unit tests.
- **Protected routes:** the `(app)` layout gets the user through `features/auth/queries.ts` (`getClaims`, per Next.js data-security guidance and 0002) and redirects to `/[locale]/sign-in?next=…` when there is none. A signed-in user who opens `/sign-in` goes to `/home`.
- **Sign out:** a server action in `features/auth/actions.ts` (`signOut({ scope: 'local' })`, this device only), then a redirect to `/[locale]`. It's a reversible action, so there's no confirmation (0008 §1b).

### Errors (every message says what happened and what to do)

| Case                                      | What the user sees                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Cancelled at Google or LinkedIn           | Back on sign-in: "Sign-in was cancelled. Choose a way to continue."                   |
| Provider or exchange error                | "We couldn't sign you in with Google. Try again, or use your email." (provider named) |
| Wrong code                                | Under the field: "That code doesn't match. Check the latest email from Jubilee."      |
| Expired or used code or link              | "This code has expired. Codes last a short time and work once. Send a new code."      |
| Too many requests                         | "Wait {seconds} seconds before asking for another code."                              |
| Email not delivered (dev-only SMTP, 0006) | Nothing is shown in the app. Covered by #24                                           |

### Temporary home (`/[locale]/(app)/home`)

The page shows "Hello, {first name}" (or no name if the profile has none), one sentence saying the workspace is coming soon, and the **Sign out** button. It's marked in code and in the spec as temporary until the app shell decision.

## Consequences

- #9 can be specified and built in one session: sign-in page (2 states), `auth/callback`, `auth/confirm`, `features/auth/{queries,actions,logic}.ts`, the `(app)` guard, the temporary home, en/fr messages and the brand SVGs.
- **No new dependency.** Unit tests (Vitest) cover the `next` check and the mapping from errors to messages. The end-to-end proof is manual (screenshots at 390 / 1440 px, light and dark, both locales) until a Playwright decision exists (0001).
- **Risk: Google verification.** Using our font instead of Google Sans is a small departure from the guidelines. Fallback: swap in Google's pre-approved SVG button if verification flags it.
- **Risk: LinkedIn button.** LinkedIn publishes no sign-in button spec. We use only the official [in] asset, unmodified, and never use wording that implies endorsement.
- Email sign-in reaches only Supabase team members until #24 picks custom SMTP. The UI ships anyway, and production traffic relies on Google and LinkedIn until then.
- Same email through Google and LinkedIn gives one account (0006). The spec's check tests this.
- Reviews check: one violet button on the sign-in page; brand logos unmodified and equal in prominence; the `next` check rejects `//`, `/\`, absolute URLs and paths without a locale; every error state has en and fr copy; the `(app)` guard runs in the DAL, not only in the proxy; the callback and confirm route handlers call functions in `features/auth/` and never import `@/lib/supabase/*` themselves (0002's lint rule).
