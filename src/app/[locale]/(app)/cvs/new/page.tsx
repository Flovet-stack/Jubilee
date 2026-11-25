import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HugeiconsArrowLeftIcon } from "@/components/icons";
import { CreateCvForm } from "@/features/cv/components/create-cv-form";
import { languageOf } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cvs/new">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "cv.create" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** "Create a CV" (spec 14). Only "Start from scratch" until import (#16). */
export default async function NewCvPage({
  params,
}: PageProps<"/[locale]/cvs/new">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "cv.create" });
  const messages = await getMessages({ locale });
  const language = languageOf(locale);

  return (
    <main className="mx-auto flex w-full max-w-(--container-reading) flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={`/${locale}/home`}
        className="flex min-h-11 items-center gap-1 self-start text-base font-semibold text-violet"
      >
        <HugeiconsArrowLeftIcon size={18} />
        {t("back")}
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-ink-muted">{t("intro")}</p>
      </div>
      <NextIntlClientProvider
        locale={locale}
        messages={{ cv: { create: messages.cv.create } }}
      >
        <CreateCvForm
          locale={locale}
          language={language}
          market={language === "fr" ? "FR" : "US"}
        />
      </NextIntlClientProvider>
    </main>
  );
}
