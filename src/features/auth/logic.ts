import { hasLocale } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";

/** Pure helpers for sign-in (spec 05, decision 0012). Unit-tested. */

export const PROVIDERS = ["google", "linkedin_oidc"] as const;
export type Provider = (typeof PROVIDERS)[number];

export function isProvider(value: unknown): value is Provider {
  return PROVIDERS.includes(value as Provider);
}

export function toLocale(value: unknown): Locale {
  return typeof value === "string" && hasLocale(routing.locales, value)
    ? value
    : routing.defaultLocale;
}

/** The request header the proxy sets with the current path, for `next`. */
export const PATH_HEADER = "x-jubilee-path";

const BASE = "http://jubilee.invalid";
const LOCALE_PATH = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);
const AUTH_PATH = new RegExp(
  `^/(${routing.locales.join("|")})/(sign-in|auth)(/|$)`,
);

/**
 * The only `next` values we redirect to: a path on our own origin that starts
 * with a locale, and isn't a sign-in or auth page (no loops). Rejects `//x`,
 * `/\x`, absolute URLs, paths without a locale and control characters.
 * Returns the normalised path and query, or null.
 */
export function safeNextPath(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) {
    return null;
  }
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return null;
  }
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE) return null;
  if (!LOCALE_PATH.test(url.pathname) || AUTH_PATH.test(url.pathname)) {
    return null;
  }
  return `${url.pathname}${url.search}`;
}

export function homePath(locale: Locale): string {
  return `/${locale}/home`;
}

/** Where to go after a successful sign-in. */
export function nextOrHome(raw: unknown, locale: Locale): string {
  return safeNextPath(raw) ?? homePath(locale);
}

/** Trims and lowercases, so "  Ada@Example.com " signs in as one account. */
export function normaliseEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

/** Keeps digits only, so pasting "123 456" or "123456 " works. */
export function normaliseCode(raw: unknown): string {
  return typeof raw === "string" ? raw.replace(/\D/g, "") : "";
}

export const CODE_LENGTH = 6;
/** Fallback wait before another code, when the error gives no number. */
export const RESEND_SECONDS = 60;

/** Message keys under `auth.errors` in the message files. */
export type AuthErrorKey =
  | "cancelled"
  | "provider"
  | "codeInvalid"
  | "codeFormat"
  | "linkExpired"
  | "rateLimited"
  | "emailInvalid"
  | "emailNotAllowed"
  | "unknown";

export type AuthError = { key: AuthErrorKey; seconds?: number };

type SupabaseLikeError = { code?: string | undefined; message?: string };

function secondsFrom(message: string | undefined): number {
  const match = message?.match(/(\d+)\s*second/);
  const seconds = match?.[1] ? Number(match[1]) : NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : RESEND_SECONDS;
}

/**
 * Maps a Supabase auth error to a message key. Supabase returns the same
 * `otp_expired` code for a wrong code and an expired one, so both get one
 * message that covers either case.
 */
export function authErrorFor(
  error: SupabaseLikeError,
  context: "code" | "link" | "oauth",
): AuthError {
  switch (error.code) {
    case "otp_expired":
      return { key: context === "link" ? "linkExpired" : "codeInvalid" };
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return { key: "rateLimited", seconds: secondsFrom(error.message) };
    case "email_address_invalid":
    case "validation_failed":
      return { key: "emailInvalid" };
    case "email_address_not_authorized":
    case "otp_disabled":
    case "signup_disabled":
      return { key: "emailNotAllowed" };
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
    case "bad_oauth_state":
    case "bad_oauth_callback":
      return { key: "provider" };
    default:
      return { key: context === "oauth" ? "provider" : "unknown" };
  }
}

/** The email form's state, returned by its server action. */
export type EmailFormState = {
  step: "email" | "code";
  email: string;
  error: AuthError | null;
  /** Seconds before another code can be asked for (after a send or a limit). */
  wait: number;
  /** True after a second code was sent from the code step. */
  resent: boolean;
  /** New on every response; the form remounts on it (countdown, "Change email"). */
  nonce: number;
};

export const initialEmailState: EmailFormState = {
  step: "email",
  email: "",
  error: null,
  wait: 0,
  resent: false,
  nonce: 0,
};

/** The state after a response: a fresh nonce, and the wait a limit asks for. */
export function nextEmailState(
  previous: EmailFormState,
  patch: Partial<Omit<EmailFormState, "nonce" | "wait">>,
): EmailFormState {
  const error = patch.error ?? null;
  const wait =
    error?.key === "rateLimited"
      ? (error.seconds ?? RESEND_SECONDS)
      : patch.step === "code" && !error
        ? RESEND_SECONDS
        : 0;
  return {
    ...previous,
    ...patch,
    error,
    wait,
    resent: patch.resent ?? false,
    nonce: previous.nonce + 1,
  };
}

/**
 * The state after asking for a code. `fromEmailStep` is true when the email
 * form sent it (first time, or after "Change email"): a failure stays on the
 * email step, and a success is a first send, not a resend.
 */
export function afterSend(
  previous: EmailFormState,
  sent: { email: string; fromEmailStep: boolean; error: AuthError | null },
): EmailFormState {
  if (sent.error) {
    return nextEmailState(previous, {
      step: sent.fromEmailStep ? "email" : previous.step,
      email: sent.email,
      error: sent.error,
    });
  }
  return nextEmailState(previous, {
    step: "code",
    email: sent.email,
    resent: !sent.fromEmailStep && previous.step === "code",
  });
}

/** Error keys the sign-in page accepts from its URL. Anything else is ignored. */
const PAGE_ERRORS = [
  "cancelled",
  "provider",
  "linkExpired",
  "unknown",
] as const;
export type PageErrorKey = (typeof PAGE_ERRORS)[number];

export function pageErrorFrom(raw: unknown): PageErrorKey | null {
  return PAGE_ERRORS.includes(raw as PageErrorKey)
    ? (raw as PageErrorKey)
    : null;
}

/** An OAuth provider's `error` query value: a cancel, or anything else. */
export function oauthReturnError(raw: string | null): PageErrorKey | null {
  if (!raw) return null;
  return raw === "access_denied" ? "cancelled" : "provider";
}

/** `/en/sign-in?error=…&provider=…&next=…`, skipping empty parts. */
export function signInPath(
  locale: Locale,
  query: {
    error?: PageErrorKey | null;
    provider?: Provider | null;
    next?: string | null;
  } = {},
): string {
  const params = new URLSearchParams();
  if (query.error) params.set("error", query.error);
  if (query.provider) params.set("provider", query.provider);
  const next = safeNextPath(query.next);
  if (next) params.set("next", next);
  const search = params.toString();
  return `/${locale}/sign-in${search ? `?${search}` : ""}`;
}

/** The first word of a profile's full name, or null. */
export function firstName(fullName: string | null | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  return first ? first : null;
}
