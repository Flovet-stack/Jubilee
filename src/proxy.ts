import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { PATH_HEADER } from "@/features/auth/logic";
import { localeRedirect } from "@/i18n/redirects";
import { routing } from "@/i18n/routing";
import { refreshSession } from "@/lib/supabase/proxy";

const handleLocale = createMiddleware(routing);

/**
 * One pass per request. Supabase refreshes the session first and writes the
 * new cookies onto the request. The 0017 redirects run next (`/` by saved
 * choice then Accept-Language, old and mixed-case prefixes); otherwise
 * next-intl routes by the URL prefix alone and forwards the request
 * headers. The fresh cookies are copied onto whichever response is sent.
 */
export async function proxy(request: NextRequest) {
  // The page the user asked for, so a signed-out visit to an (app) page can
  // come back to it after sign-in (spec 05). Always overwritten, never
  // trusted: the guard checks it with safeNextPath.
  request.headers.set(
    PATH_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const withSession = await refreshSession(request);
  return withSession(localeRedirect(request) ?? handleLocale(request));
}

export const config = {
  // Pages only: skip API routes, Next internals, Vercel internals and files
  // with an extension (favicon, robots.txt, sitemap.xml, images).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
