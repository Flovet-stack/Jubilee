import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/env";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

import {
  afterSend,
  authErrorFor,
  homePath,
  nextEmailState,
  isProvider,
  nextOrHome,
  normaliseCode,
  normaliseEmail,
  safeNextPath,
  signInPath,
  toLocale,
  type AuthError,
  type EmailFormState,
} from "./logic";
import { codeSchema, emailSchema } from "./schemas";

/**
 * Writes for sign-in (decision 0002: the only Supabase writes). The exported
 * server actions carry their own "use server"; `exchangeOAuthCode` and
 * `verifyEmailLink` are plain server functions for the route handlers, so
 * they can't be called from the browser.
 */

/** The origin the request came from, so previews call back to themselves. */
async function requestOrigin(): Promise<string> {
  const origin = (await headers()).get("origin");
  return origin ?? env.NEXT_PUBLIC_SITE_URL;
}

/* ── Google and LinkedIn ─────────────────────────────────────────────── */

export async function continueWithProvider(formData: FormData) {
  "use server";

  const locale = toLocale(formData.get("locale"));
  const provider = formData.get("provider");
  const next = safeNextPath(formData.get("next"));
  if (!isProvider(provider)) redirect(signInPath(locale, { next }));

  const callback = new URL(`/${locale}/auth/callback`, await requestOrigin());
  callback.searchParams.set("provider", provider);
  if (next) callback.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url) {
    redirect(signInPath(locale, { error: "provider", provider, next }));
  }
  redirect(data.url);
}

/** Route handler: `/[locale]/auth/callback`. True when a session was set. */
export async function exchangeOAuthCode(code: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return !error;
}

/* ── Email code and link ─────────────────────────────────────────────── */

/**
 * One action for the email form, so it's one state machine:
 * `intent=send` sends (or re-sends) a code, `intent=verify` checks it.
 */
export async function emailFormAction(
  previous: EmailFormState,
  formData: FormData,
): Promise<EmailFormState> {
  "use server";

  const locale = toLocale(formData.get("locale"));
  const next = safeNextPath(formData.get("next"));
  const email = normaliseEmail(formData.get("email"));

  if (formData.get("intent") === "verify") {
    return verifyCode(email, formData.get("code"), locale, next, previous);
  }

  const fromEmailStep = formData.get("from") === "email";
  if (!emailSchema.safeParse(email).success) {
    return afterSend(previous, {
      email,
      fromEmailStep,
      error: { key: "emailInvalid" },
    });
  }

  // The link in the email comes back to /auth/confirm; the template appends
  // `&token_hash=…&type=email`, so the URL always carries a query.
  const confirm = new URL(`/${locale}/auth/confirm`, await requestOrigin());
  confirm.searchParams.set("next", next ?? homePath(locale));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: confirm.toString() },
  });
  return afterSend(previous, {
    email,
    fromEmailStep,
    error: error ? authErrorFor(error, "code") : null,
  });
}

async function verifyCode(
  email: string,
  rawCode: FormDataEntryValue | null,
  locale: Locale,
  next: string | null,
  previous: EmailFormState,
): Promise<EmailFormState> {
  const token = normaliseCode(rawCode);
  if (!emailSchema.safeParse(email).success) {
    return nextEmailState(previous, {
      step: "email",
      email,
      error: { key: "emailInvalid" },
    });
  }
  if (!codeSchema.safeParse(token).success) {
    return nextEmailState(previous, {
      step: "code",
      email,
      error: { key: "codeFormat" },
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) {
    return nextEmailState(previous, {
      step: "code",
      email,
      error: authErrorFor(error, "code"),
    });
  }
  redirect(nextOrHome(next, locale));
}

/** Route handler: `/[locale]/auth/confirm`. Null when signed in. */
export async function verifyEmailLink(
  tokenHash: string,
): Promise<AuthError | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });
  return error ? authErrorFor(error, "link") : null;
}

/* ── Sign out ────────────────────────────────────────────────────────── */

/** Ends this device's session only (0012), then goes to the home page. */
export async function signOut(formData: FormData) {
  "use server";

  const locale = toLocale(formData.get("locale"));
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect(`/${locale}`);
}
