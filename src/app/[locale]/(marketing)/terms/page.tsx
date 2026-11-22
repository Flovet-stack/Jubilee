import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LegalDocument } from "@/components/legal/legal-document";
import { TextLink } from "@/components/ui/text-link";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/seo";

/** Change with every edit to the terms text (spec 07, decision 0014). */
const LAST_UPDATED = "2026-11-21";

/** Section order from decision 0014. The ids are the jump-link anchors. */
const SECTIONS = [
  "summary",
  "who",
  "service",
  "account",
  "content",
  "ai",
  "fairUse",
  "price",
  "ending",
  "responsibility",
  "changes",
  "law",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/terms"),
  };
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Links inside the terms. Contact goes to the contact page, never an
  // email address, like the privacy policy (spec 07).
  const links = {
    contact: (chunks: ReactNode) => (
      <TextLink href={`/${locale}/contact`}>{chunks}</TextLink>
    ),
    privacy: (chunks: ReactNode) => (
      <TextLink href={`/${locale}/privacy`}>{chunks}</TextLink>
    ),
  };

  return (
    <LegalDocument
      locale={locale}
      namespace="terms"
      sections={SECTIONS}
      lastUpdated={LAST_UPDATED}
      links={links}
    />
  );
}
