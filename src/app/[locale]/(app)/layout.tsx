import { getTranslations } from "next-intl/server";
import { Suspense, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { toLocale } from "@/features/auth/logic";
import { requireUserId } from "@/features/auth/queries";
import { AppShell } from "@/features/shell/components/app-shell";

/**
 * Everything in (app) is for signed-in users (decision 0012). The guard reads
 * the session on the server and sends anyone else to sign-in, with a way
 * back. Signed-in pages render inside the app shell (0027, spec 15). Pages still read the user through the same DAL, so data stays safe
 * even when a layout is reused across navigations.
 */
export default function AppLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  return (
    <Suspense fallback={<GuardFallback params={params} />}>
      <SignedInOnly params={params}>{children}</SignedInOnly>
    </Suspense>
  );
}

async function SignedInOnly({
  params,
  children,
}: {
  params: LayoutProps<"/[locale]">["params"];
  children: ReactNode;
}) {
  const locale = toLocale((await params).locale);
  await requireUserId(locale);
  // The shell renders only after the guard, never for a guest (0027).
  return <AppShell locale={locale}>{children}</AppShell>;
}

async function GuardFallback({
  params,
}: {
  params: LayoutProps<"/[locale]">["params"];
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: toLocale(locale),
    namespace: "auth.home",
  });
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Spinner label={t("loading")} />
    </main>
  );
}
