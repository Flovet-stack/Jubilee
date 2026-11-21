import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { env } from "@/env";
import type { Database } from "@/types/database.types";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

/**
 * Refreshes the Supabase session before any other proxy step (spec 01).
 *
 * New cookies are written onto the request, so the request headers that
 * next-intl forwards carry the fresh token and Server Components in the same
 * request see it. The returned function copies the same cookies, and the
 * no-cache headers, onto whatever response next-intl builds.
 */
export async function refreshSession(
  request: NextRequest,
): Promise<(response: NextResponse) => NextResponse> {
  let cookies: CookieToSet[] = [];
  let headers: Record<string, string> = {};

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookies = cookiesToSet;
          headers = cacheHeaders;
        },
      },
    },
  );

  // Do not add code between client creation and this call.
  await supabase.auth.getClaims();

  return (response) => {
    cookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    // Stops CDNs from caching a response that carries a session token.
    Object.entries(headers).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  };
}
