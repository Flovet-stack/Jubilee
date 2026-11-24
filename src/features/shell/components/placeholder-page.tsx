import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

export type PlaceholderKey = "jobs" | "applications" | "toApprove" | "settings";

/** Metadata for a page that its own spec hasn't built yet (spec 15). */
export async function placeholderMetadata(
  params: Promise<{ locale: string }>,
  key: PlaceholderKey,
): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: `shell.pages.${key}` });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * The page's title and one plain sentence on what will appear here. No
 * "coming soon" banner and no buttons: there is nothing to do yet.
 */
export async function PlaceholderPage({
  params,
  page,
}: {
  params: Promise<{ locale: string }>;
  page: PlaceholderKey;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: `shell.pages.${page}` });
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-2 px-4 py-10 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
      <p className="text-ink-muted">{t("body")}</p>
    </main>
  );
}
