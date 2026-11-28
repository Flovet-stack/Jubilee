import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ButtonLink } from "@/components/ui/button";
import { HugeiconsPlusIcon } from "@/components/icons";
import { CardLink, Well } from "@/components/ui/surface";
import { listCvs } from "@/features/cv/queries";
import { Skeleton } from "@/components/ui/feedback";
import { getGreetingName } from "@/features/auth/queries";
import { routing, type Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/home">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth.home" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * TEMPORARY (spec 05, decision 0012): where people land after sign-in, until
 * Home's own spec. Sign out lives in the shell's account menu (spec 15).
 */
export default async function HomePage({
  params,
}: PageProps<"/[locale]/home">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "auth.home" });

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-8 px-4 py-10 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <Suspense fallback={<Skeleton className="h-10 w-56" />}>
          <Greeting locale={locale} />
        </Suspense>
        <p className="text-ink-muted">{t("body")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <CvList locale={locale} />
      </Suspense>
    </main>
  );
}

async function Greeting({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "auth.home" });
  const name = await getGreetingName(locale);
  return (
    <h1 className="text-2xl font-bold text-ink">
      {name ? t("greeting", { name }) : t("greetingNoName")}
    </h1>
  );
}

/** The user's CVs (spec 14), until the app shell decision replaces Home. */
async function CvList({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "cv.home" });
  const result = await listCvs();
  const cvs = result.ok ? result.value : [];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  // With no CVs the sidebar shows the one violet "Create" (0007, 0027).
  const create = (
    <ButtonLink
      href={`/${locale}/cvs`}
      variant={result.ok && cvs.length === 0 ? "secondary" : "primary"}
      icon={<HugeiconsPlusIcon />}
    >
      {t("create")}
    </ButtonLink>
  );

  return (
    <Well title={t("title")} actions={cvs.length > 0 ? create : undefined}>
      {cvs.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-ink-muted">{t("empty")}</p>
          {create}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {cvs.map((cv) => (
            <li key={cv.id}>
              <CardLink
                href={`/${locale}/cvs/${cv.id}`}
                className="flex flex-col gap-1 p-4"
              >
                <span className="font-semibold text-ink">{cv.title}</span>
                <span className="text-sm text-ink-muted">
                  {t("edited", { date: date.format(new Date(cv.updatedAt)) })}
                </span>
              </CardLink>
            </li>
          ))}
        </ul>
      )}
    </Well>
  );
}
