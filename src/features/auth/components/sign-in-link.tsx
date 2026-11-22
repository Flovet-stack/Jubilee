"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

/**
 * TEMPORARY (spec 05 addendum): the home page's way in to sign-in, until the
 * landing page (#39) and the app header are designed. A link styled as the
 * primary button, since it navigates rather than acts.
 */
export function SignInLink({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  return (
    <Link
      href={`/${locale}/sign-in`}
      className={buttonVariants({ variant: "primary", size: "lg" })}
    >
      {label}
    </Link>
  );
}
