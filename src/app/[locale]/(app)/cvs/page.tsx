import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getFormatter, getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/feedback";
import { CvIndex } from "@/features/cv/components/cv-index";
import { StartCards } from "@/features/cv-import/components/start-cards";
import { listCvs } from "@/features/cv/queries";
import { editedJustNow } from "@/features/shell/logic";
import { languageOf } from "@/i18n/locales";
import { routing, type Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cvs">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "cv.list" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** The start cards, then every resume and a search (0032, 0050, spec 31). */
export default async function CvsPage({ params }: PageProps<"/[locale]/cvs">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "cv.list" });

  return (
    <main className="mx-auto flex w-full max-w-(--container-reading) flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        }
      >
        <CvsList locale={locale} />
      </Suspense>
    </main>
  );
}

async function CvsList({ locale }: { locale: Locale }) {
  const [t, format, messages, result] = await Promise.all([
    getTranslations({ locale, namespace: "cv.list" }),
    getFormatter({ locale }),
    getMessages({ locale }),
    listCvs(),
  ]);
  if (!result.ok) {
    return (
      <p className="text-ink-muted">
        {t("error")}{" "}
        <a
          href={`/${locale}/cvs`}
          className="font-semibold text-violet underline"
        >
          {t("retry")}
        </a>
      </p>
    );
  }

  const language = languageOf(locale);
  // The cards are the page until she has a CV (0050).
  const start = (
    <NextIntlClientProvider
      locale={locale}
      messages={{
        cv: {
          start: messages.cv.start,
          import: messages.cv.import,
          create: messages.cv.create,
        },
        ai: messages.ai,
      }}
    >
      <StartCards
        locale={locale}
        language={language}
        market={language === "fr" ? "FR" : "US"}
      />
    </NextIntlClientProvider>
  );

  if (result.value.length === 0) return start;

  const now = new Date();
  const cvs = result.value.map((cv) => ({
    id: cv.id,
    title: cv.title,
    headline: cv.headline,
    name: cv.name,
    edited: editedJustNow(new Date(cv.updatedAt), now)
      ? t("justNow")
      : t("edited", {
          when: format.relativeTime(new Date(cv.updatedAt), now),
        }),
  }));

  return (
    <div className="flex flex-col gap-8">
      {start}
      <NextIntlClientProvider
        locale={locale}
        messages={{ cv: { list: messages.cv.list } }}
      >
        <CvIndex locale={locale} cvs={cvs} />
      </NextIntlClientProvider>
    </div>
  );
}
