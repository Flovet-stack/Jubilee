import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getFormatter, getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { HugeiconsPlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { CvIndex } from "@/features/cv/components/cv-index";
import { listCvs } from "@/features/cv/queries";
import { editedJustNow } from "@/features/shell/logic";
import { routing, type Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cvs">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "cv.list" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** Every resume, a search, and the way to create one (0032, spec 20). */
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
  const href = `/${locale}/cvs/new`;

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

  // The one violet action on the page (0007).
  const create = (
    <ButtonLink href={href} variant="primary" icon={<HugeiconsPlusIcon />}>
      {t("create")}
    </ButtonLink>
  );

  if (result.value.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        {create}
        <p className="text-ink-muted">{t("reassure")}</p>
      </div>
    );
  }

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
    <div className="flex flex-col gap-6">
      <div>{create}</div>
      <NextIntlClientProvider
        locale={locale}
        messages={{ cv: { list: messages.cv.list } }}
      >
        <CvIndex locale={locale} cvs={cvs} />
      </NextIntlClientProvider>
    </div>
  );
}
