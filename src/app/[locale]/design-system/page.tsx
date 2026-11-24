import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

import { trialFontVariables } from "./font-lab";
import { Gallery } from "./gallery";

import "./font-lab.css";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Every token and component in every state (spec 03). Development only: a
 * reference for builders and reviewers, not a product page, so its sample
 * copy lives beside it rather than in the message files. The form fields of
 * spec 13 read their real copy (`fields.*`) to show it in each language.
 */
export default async function DesignSystemPage({
  params,
}: PageProps<"/[locale]/design-system">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{
        fields: messages.fields,
        shell: messages.shell,
        localePicker: messages.localePicker,
      }}
    >
      <Gallery fontVariables={trialFontVariables} />
    </NextIntlClientProvider>
  );
}
