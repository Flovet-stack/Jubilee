import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[...rest]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "notFound" });
  return { title: t("title") };
}

// Any unknown path under a known locale (/fr/nope) renders the localised
// [locale]/not-found.tsx inside the layout. URLs with no locale at all still
// fall through to app/global-not-found.tsx.
export default function CatchAll() {
  notFound();
}
