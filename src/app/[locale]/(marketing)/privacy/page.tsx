import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LegalDocument } from "@/components/legal/legal-document";
import { TextLink } from "@/components/ui/text-link";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/seo";

/** Change with every edit to the policy text (spec 04, decision 0011). */
const LAST_UPDATED = "2026-11-28";

/** Section order from decision 0011. The ids are the jump-link anchors. */
const SECTIONS = [
  "summary",
  "who",
  "collect",
  "why",
  "processors",
  "storage",
  "retention",
  "rights",
  "ai",
  "cookies",
  "children",
  "changes",
  "complaints",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/privacy"),
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "privacy" });

  // Links inside the policy text. Contact goes to the contact page, never
  // an email address (spec 04).
  const links = {
    contact: (chunks: ReactNode) => (
      <TextLink href={`/${locale}/contact`}>{chunks}</TextLink>
    ),
    cnil: (chunks: ReactNode) => (
      <TextLink
        href="https://www.cnil.fr"
        external
        externalHint={t("externalHint")}
      >
        {chunks}
      </TextLink>
    ),
  };

  return (
    <LegalDocument
      locale={locale}
      namespace="privacy"
      sections={SECTIONS}
      lastUpdated={LAST_UPDATED}
      links={links}
    />
  );
}
