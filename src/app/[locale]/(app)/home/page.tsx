import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { signOut } from "@/features/auth/actions";
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
 * TEMPORARY (spec 05, decision 0012): where people land after sign-in until
 * the app shell decision replaces it. A greeting and Sign out, nothing else.
 */
export default async function HomePage({
  params,
}: PageProps<"/[locale]/home">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "auth.home" });

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <Suspense fallback={<Skeleton className="h-10 w-56" />}>
          <Greeting locale={locale} />
        </Suspense>
        <p className="text-ink-muted">{t("body")}</p>
      </div>
      <form action={signOut}>
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit">{t("signOut")}</Button>
      </form>
    </main>
  );
}

async function Greeting({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "auth.home" });
  const name = await getGreetingName(locale);
  return (
    <h1 className="text-3xl font-bold text-ink sm:text-4xl">
      {name ? t("greeting", { name }) : t("greetingNoName")}
    </h1>
  );
}
