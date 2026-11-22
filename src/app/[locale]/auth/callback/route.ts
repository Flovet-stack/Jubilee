import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";

import { exchangeOAuthCode } from "@/features/auth/actions";
import {
  isProvider,
  nextOrHome,
  oauthReturnError,
  signInPath,
} from "@/features/auth/logic";
import { routing } from "@/i18n/routing";

/**
 * Google and LinkedIn come back here (decision 0004). A code becomes a
 * session; a cancel or failure goes back to sign-in with a message (0012).
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/[locale]/auth/callback">,
) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return new NextResponse(null, { status: 404 });
  }

  const query = request.nextUrl.searchParams;
  const rawProvider = query.get("provider");
  const provider = isProvider(rawProvider) ? rawProvider : null;
  const next = query.get("next");
  const back = (error: "cancelled" | "provider") =>
    NextResponse.redirect(
      new URL(signInPath(locale, { error, provider, next }), request.url),
    );

  const returned = oauthReturnError(query.get("error"));
  if (returned)
    return back(returned === "cancelled" ? "cancelled" : "provider");

  const code = query.get("code");
  if (!code || !(await exchangeOAuthCode(code))) return back("provider");

  return NextResponse.redirect(new URL(nextOrHome(next, locale), request.url));
}
