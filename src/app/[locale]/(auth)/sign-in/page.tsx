import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { JubileeIcon } from "@/components/brand/jubilee-icon";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { TextLink } from "@/components/ui/text-link";
import { continueWithProvider, emailFormAction } from "@/features/auth/actions";
import { EmailSignIn } from "@/features/auth/components/email-sign-in";
import { ProviderButtons } from "@/features/auth/components/provider-buttons";
import {
  isProvider,
  nextOrHome,
  pageErrorFrom,
  safeNextPath,
} from "@/features/auth/logic";
import { getCurrentUserId } from "@/features/auth/queries";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth.signIn" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * Sign-in and sign-up in one page (decision 0012), laid out per 0013: no
 * card, one centred column. The frame is static; the options read the URL
 * and the session, so they stream in.
 */
export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "auth.signIn" });

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center sm:px-6 sm:py-16">
      <div className="flex w-full max-w-[400px] flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <JubileeIcon height={40} />
          <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
        </div>
        <Suspense fallback={<OptionsSkeleton />}>
          <SignInOptions locale={locale} searchParams={searchParams} />
        </Suspense>
        <div className="flex flex-col gap-4 text-center text-sm text-ink-muted">
          <p>{t("newHere")}</p>
          <p>
            {t.rich("legal", {
              terms: (chunks) => (
                <TextLink href={`/${locale}/terms`}>{chunks}</TextLink>
              ),
              privacy: (chunks) => (
                <TextLink href={`/${locale}/privacy`}>{chunks}</TextLink>
              ),
            })}
          </p>
          <p>
            {t.rich("help", {
              link: (chunks) => (
                <TextLink href={`mailto:${site.supportEmail}`}>
                  {chunks}
                </TextLink>
              ),
            })}
          </p>
        </div>
      </div>
    </main>
  );
}

async function SignInOptions({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<"/[locale]/sign-in">["searchParams"];
}) {
  const query = await searchParams;
  const next = safeNextPath(query.next);

  // Already signed in: nothing to do here.
  if (await getCurrentUserId()) redirect(nextOrHome(next, locale));

  const t = await getTranslations({ locale, namespace: "auth" });
  const error = pageErrorFrom(query.error);
  const provider = isProvider(query.provider) ? query.provider : null;
  const pageError = error ? (
    <Alert
      tone="danger"
      title={t(`errors.${error}`, {
        provider: provider ? t(`providers.${provider}`) : "",
      })}
    />
  ) : null;

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={{ auth: messages.auth }}>
      <EmailSignIn
        locale={locale}
        next={next}
        action={emailFormAction}
        pageError={pageError}
        providers={
          <ProviderButtons
            locale={locale}
            next={next}
            action={continueWithProvider}
          />
        }
      />
    </NextIntlClientProvider>
  );
}

function OptionsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-(--control-h-lg) rounded-control-lg" />
        <Skeleton className="h-(--control-h-lg) rounded-control-lg" />
      </div>
      <Skeleton className="mx-auto h-4 w-8" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-(--control-h-lg) rounded-control-lg" />
        <Skeleton className="h-(--control-h-lg) rounded-control-lg" />
      </div>
    </div>
  );
}
