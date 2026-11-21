# 05: Sign-in

Status: In progress (first review 75/100, findings 1, 7, 9, 10 and 12 fixed since; end-to-end check waiting on Flovet) · Written: 2026-11-21 · Issue: #9

## Goal

Let people create an account and sign in with Google, LinkedIn or an emailed code, and keep the signed-in part of the app private to them. After this, every later feature can assume a signed-in user and a `profiles` row.

## Decisions

Implements [0012](../docs/decisions/0012-sign-in-flow-and-screens.md), on [0004](../docs/decisions/0004-auth-database-and-env.md) and [0006](../docs/decisions/0006-account-data-and-email-code.md). Follows [0002](../docs/decisions/0002-project-structure.md), [0003](../docs/decisions/0003-internationalisation.md), [0007](../docs/decisions/0007-visual-foundations.md), [0008](../docs/decisions/0008-interaction-disclosure-and-space.md), [0009](../docs/decisions/0009-design-system-components-icons-motion.md), [0011](../docs/decisions/0011-privacy-policy-page.md).

## Acceptance criteria

1. `/en/sign-in` and `/fr/sign-in` (in `(auth)`) show the page from 0012, in its order, with one violet button. The Privacy link goes to `/[locale]/privacy`.
2. **Google and LinkedIn:** each button starts `signInWithOAuth` (`google`, `linkedin_oidc`) with `redirectTo` set to `/[locale]/auth/callback?next=…`. A successful return lands on `next` or `/[locale]/home`, with a session cookie.
3. **Email code:** submitting an email calls `signInWithOtp` and moves to the "check your email" state from 0012. That state shows the address and the code field with the attributes 0012 lists, plus Change email and Send a new code (with a countdown). A correct code (`verifyOtp`, `type: 'email'`) signs the user in and redirects as in criterion 2.
4. **Email link:** `/[locale]/auth/confirm?token_hash=…&type=email` verifies the link and redirects as in criterion 2. The remote Magic Link template shows the code first and this link second (approved in 0012).
5. **`next` check:** a pure function in `features/auth/logic.ts` accepts only `/en/…` or `/fr/…` paths. Unit tests reject `//x`, `/\x`, `https://x`, `/x` (no locale), an empty value and encoded variants (`%2F%2F`).
6. **Errors:** every case in 0012's table shows its message in the right place, in both languages. A pure function maps Supabase and provider errors to message keys, with unit tests.
7. **Guard:** the `(app)` layout reads the user through `features/auth/queries.ts`. A signed-out request to any `(app)` page redirects to `/[locale]/sign-in?next=<that path>`. A signed-in visit to `/sign-in` redirects to `/[locale]/home`.
8. **Temporary home:** `/[locale]/home` greets the user by the first word of `profiles.full_name` (no name if it's null) and has a Sign out button. Sign out ends this device's session only and redirects to `/[locale]`. A code comment and this spec mark the page as temporary until the app shell decision.
9. **Brand logos:** the Google "G" and LinkedIn [in] are full colour, from Iconify `logos` (CC0), in `src/components/brand/` with a `SOURCES.md` naming the source and licence. They are `aria-hidden` and never animated, and both buttons are the same size.
10. **Structure:** route handlers and pages call `features/auth/{queries,actions}.ts` only. 0002's lint rule passes unchanged. No new dependency.
11. All copy is in `src/messages/{en,fr}.json` under an `auth` namespace, and the key-parity test passes.
12. **Metadata:** sign-in has a localised title, is `noindex`, and isn't in the sitemap. `/home` is `noindex`.

13. **Addendum (Flovet, 2026-11-21):** the placeholder home page (`/[locale]`) shows a temporary **Sign in** button (a link styled as the primary button) to `/[locale]/sign-in`, until the landing page (#39) replaces it. The home page stays static.

## Out of scope

App shell and navigation, onboarding, profile editing, account linking UI, CAPTCHA, custom SMTP, Terms page, account deletion, Playwright.

## Edge cases

- Same email through Google, then LinkedIn: one user, one profile (0006). Check in Supabase > Users.
- A user who cancels at the provider comes back with `error=access_denied` and sees the cancelled message, not a crash.
- An email with leading or trailing spaces or capitals is trimmed and lowercased before sending.
- Pasting "123 456" or "123456 " into the code field works.
- A code requested in one tab and entered in another still works. Asking for a new code makes the old one invalid, and the message says so.
- A slow network shows the button's loading state (0009: spinner after 400 ms). Double-submits don't send two emails.
- A French label that runs long wraps inside the button and is never cut off, at 360 px.
- Signing in from `/fr/…` keeps the user in French all the way through, provider round trip included.

## Files and patterns to follow

- `src/app/[locale]/(auth)/sign-in/page.tsx`, `src/app/[locale]/auth/callback/route.ts`, `src/app/[locale]/auth/confirm/route.ts`, `src/app/[locale]/(app)/layout.tsx`, `src/app/[locale]/(app)/home/page.tsx`.
- `src/features/auth/{queries,actions,logic,schemas}.ts` plus `logic.test.ts`, and `src/features/auth/components/` for the form.
- `src/components/ui/` (Button, Field, Input, Alert, TextLink, Card) and the existing `src/lib/supabase/*` clients.
- Read `node_modules/next/dist/docs/` on route handlers, `redirect`, server actions, `cookies()` and Suspense with `cacheComponents` before writing. Check `@supabase/ssr` and `supabase-js` versions in `package.json` against the method names.

## Boundaries

- Always: verify the session on the server (`getClaims`), never trust only the proxy; no Supabase secret key anywhere.
- Ask first: any change to Supabase settings other than the Magic Link template; any new dependency; any table or migration.
- Never: log tokens, codes or emails; put the email in a URL; call LinkedIn sign-in "verified".

## Check

- `pnpm check` passes, including the new unit tests.
- Manual, on `pnpm dev` against `jubilee`: Google, LinkedIn, email code and email link each reach `/home` and sign out. A signed-out visit to `/en/home` comes back to `/en/home` after sign-in. Each error state is triggered once.
- Screenshots of sign-in (both states) and `/home` at 390 px and 1440 px, light and dark, in `en` and `fr`.
- Keyboard only: Tab order follows the visual order, focus is visible, and Enter submits each form.
- Reviewer skill run against this spec; score of 90 or more, recorded above. One entry in `docs/log.md`.

## Build notes (2026-11-21)

- **No logo on the sign-in card.** 0012 puts the logo first, but the logo decision (0010) is still Proposed, so none is drawn. Flovet to decide: wait for 0010, or show the name "Jubilee" as a text wordmark until then.
- **Wrong and expired codes share one message.** Supabase returns `otp_expired` for both, so the app can't tell them apart. `codeInvalid` covers either case. This departs from 0012's table and needs Flovet's approval as an amendment.
- **LinkedIn mark.** The Iconify file has cut-out letters, so a white square sits behind them to keep "in" white on the dark button. 0012 says "unmodified". Flovet to approve this, or the build switches to LinkedIn's own download.
- **Button spinner delay.** The shared `Button` shows its spinner at once, not after 400 ms (0009 §8). It's a design-system component, so the fix belongs in its own change.
- **Rate limits by IP.** Codes are requested and checked on the server, so Supabase may count every user against the server's IP. To check under #24 (transactional email).
- **Before the Check can pass:** paste `supabase/templates/magic-link.html` and its subject (in `config.toml`) into the hosted Magic Link template. The hosted redirect allowlist needs the production and Vercel preview origins (`<origin>/**`), or the email link falls back to the Site URL and breaks.
