import { getLocale, getTranslations } from "next-intl/server";

import { NotFoundContent } from "@/components/not-found-content";

// Shown when a page under a valid locale calls notFound().
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-24">
      <NotFoundContent
        title={t("title")}
        body={t("body")}
        homeLabel={t("home")}
        homeHref={`/${locale}`}
      />
    </main>
  );
}
