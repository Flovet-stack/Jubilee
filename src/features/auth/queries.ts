import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

import { firstName, PATH_HEADER, signInPath } from "./logic";

/**
 * Reads for sign-in (decision 0002: the only Supabase reads). The session is
 * checked here, on the server, with `getClaims` (it verifies the JWT), not
 * only in the proxy (Next.js data-security guide).
 */

/** The signed-in user's id, or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims.sub;
  return typeof sub === "string" && sub.length > 0 ? sub : null;
}

/**
 * The signed-in user's id. Signed out, it redirects to sign-in and brings
 * the user back to the page they asked for (the proxy sets PATH_HEADER).
 */
export async function requireUserId(locale: Locale): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    const path = (await headers()).get(PATH_HEADER);
    redirect(signInPath(locale, { next: path }));
  }
  return userId;
}

/** What the temporary home shows: the first word of the profile name. */
export async function getGreetingName(locale: Locale): Promise<string | null> {
  const userId = await requireUserId(locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  return firstName(data?.full_name);
}
