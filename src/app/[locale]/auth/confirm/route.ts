import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";

import { verifyEmailLink } from "@/features/auth/actions";
import { nextOrHome, signInPath } from "@/features/auth/logic";
import { routing } from "@/i18n/routing";

/**
 * The sign-in link in the email (decision 0012). The template sends
 * `?next=…&token_hash=…&type=email`; a used or expired link goes back to
 * sign-in, where the code still works.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/[locale]/auth/confirm">,
) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return new NextResponse(null, { status: 404 });
  }

  const query = request.nextUrl.searchParams;
  const next = query.get("next");
  const tokenHash = query.get("token_hash");
  const back = (error: "linkExpired" | "unknown") =>
    NextResponse.redirect(
      new URL(signInPath(locale, { error, next }), request.url),
    );

  if (!tokenHash || query.get("type") !== "email") return back("linkExpired");

  const error = await verifyEmailLink(tokenHash);
  if (error)
    return back(error.key === "linkExpired" ? "linkExpired" : "unknown");

  return NextResponse.redirect(new URL(nextOrHome(next, locale), request.url));
}
