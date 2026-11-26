import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { GridAuditor } from "@/components/grid-auditor";
import { env } from "@/env";
import { localeTag } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { jakarta } from "@/lib/fonts";
import { site } from "@/lib/site";

import "../globals.css";
import { THEME_SCRIPT } from "@/lib/theme";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const verification = env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: t("description"),
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={localeTag(locale)}
      className={`${jakarta.variable} h-full antialiased`}
      // The theme script sets data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <GridAuditor />
      </body>
    </html>
  );
}
