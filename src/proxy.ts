import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { refreshSession } from "@/lib/supabase/proxy";

const handleLocale = createMiddleware(routing);

/**
 * One pass per request. Supabase refreshes the session first and writes the
 * new cookies onto the request; next-intl then picks the locale (URL prefix,
 * then the saved NEXT_LOCALE cookie, then Accept-Language), forwards those
 * request headers, and the fresh cookies are copied onto its response.
 */
export async function proxy(request: NextRequest) {
  const withSession = await refreshSession(request);
  return withSession(handleLocale(request));
}

export const config = {
  // Pages only: skip API routes, Next internals, Vercel internals and files
  // with an extension (favicon, robots.txt, sitemap.xml, images).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
