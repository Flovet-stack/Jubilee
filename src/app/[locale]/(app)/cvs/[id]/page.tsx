import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/feedback";
import { ToastProvider } from "@/components/ui/toast";
import { CvEditor } from "@/features/cv/components/cv-editor";
import { getCvDocument } from "@/features/cv/queries";
import { type CvLanguage, SECTION_KINDS } from "@/features/cv/schemas";
import type { CvLabels } from "@/features/cv/tree";
import { localeTag, type Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cvs/[id]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "cv.editor" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** The words printed on the CV come from the CV's language, not the UI's. */
async function cvLabels(language: CvLanguage): Promise<CvLabels> {
  const locale: Locale = language === "fr" ? "fr-fr" : "en-us";
  const t = await getTranslations({ locale, namespace: "cv.document" });
  const headings = Object.fromEntries(
    SECTION_KINDS.map((kind) => [kind, t(`headings.${kind}`)]),
  ) as CvLabels["headings"];
  return { headings, present: t("present") };
}

/** The CV editor (spec 14). Another user's CV is "not found" (RLS). */
export default async function CvEditorPage({
  params,
  searchParams,
}: PageProps<"/[locale]/cvs/[id]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<EditorSkeleton />}>
        <Editor locale={locale} params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Editor({
  locale,
  params,
  searchParams,
}: {
  locale: Locale;
  params: PageProps<"/[locale]/cvs/[id]">["params"];
  searchParams: PageProps<"/[locale]/cvs/[id]">["searchParams"];
}) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getCvDocument({ kind: "cv", id });
  if (!result.ok) {
    if (
      result.error.code === "not_found" ||
      result.error.code === "unauthenticated"
    )
      notFound();
    const t = await getTranslations({ locale, namespace: "cv.editor" });
    return (
      <div className="mx-auto flex max-w-(--container-reading) flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold">{t("loadError.title")}</h1>
        <p className="text-ink-muted">{t("loadError.body")}</p>
        <Link href={`/${locale}/home`} className="font-semibold text-violet">
          {t("back")}
        </Link>
      </div>
    );
  }

  const cv = result.value;
  const messages = await getMessages({ locale });
  const labels = await cvLabels(cv.language);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ cv: messages.cv, fields: messages.fields }}
    >
      <ToastProvider>
        <CvEditor
          id={cv.id}
          title={cv.title}
          language={cv.language}
          market={cv.market}
          locale={locale}
          languageTag={localeTag(locale)}
          initialContent={cv.content}
          initialUpdatedAt={cv.updatedAt}
          start={query.start === "1"}
          labels={labels}
          homeHref={`/${locale}/home`}
        />
      </ToastProvider>
    </NextIntlClientProvider>
  );
}

function EditorSkeleton() {
  return (
    <div
      className="mx-auto grid w-full max-w-(--container-content) gap-6 px-4 py-6 lg:grid-cols-[14rem_1fr_1fr] lg:px-6"
      aria-hidden="true"
    >
      <Skeleton className="h-80" />
      <Skeleton className="h-96" />
      <Skeleton className="hidden h-[32rem] lg:block" />
    </div>
  );
}
