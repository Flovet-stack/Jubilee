import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

/** Every new CV starts from the cards on the Resumes page (0050, spec 31). */
export default async function NewCvPage({
  params,
}: PageProps<"/[locale]/cvs/new">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  redirect(`/${locale}/cvs`);
}
