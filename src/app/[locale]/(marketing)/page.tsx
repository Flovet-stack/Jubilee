import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { LocalePicker } from "@/components/locale-picker/locale-picker";
import { SignInLink } from "@/features/auth/components/sign-in-link";
import { toLocale } from "@/features/auth/logic";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return { alternates: alternatesFor(locale) };
}

// Placeholder home (spec 01). The real home page gets its own spec.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 px-4 py-24">
      <h1 className="text-3xl font-semibold">{site.name}</h1>
      <p>{t("description")}</p>
      {/* Temporary until the landing page (#39); spec 05 addendum. */}
      <div className="mt-5">
        <SignInLink locale={toLocale(locale)} label={t("signIn")} />
      </div>
      <div className="mt-16">
        <LocalePicker locale={toLocale(locale)} />
      </div>
    </main>
  );
}
