import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { type ReactNode, Suspense } from "react";

import { signOut } from "@/features/auth/actions";
import { getGreetingName } from "@/features/auth/queries";
import { listCvs } from "@/features/cv/queries";
import { locales, type Locale } from "@/i18n/locales";

import { COLLAPSE_COOKIE, parseCollapsed } from "../logic";
import { CvSection, ShellFrame, type ShellLabels } from "./shell";

/**
 * Server part of the app shell (0027): reads the collapse cookie, the
 * user's first name and the copy, and streams the CV list on its own so a
 * slow query never holds up the page.
 */
export async function AppShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [t, tLocale, jar, name] = await Promise.all([
    getTranslations({ locale, namespace: "shell" }),
    getTranslations({ locale, namespace: "localePicker" }),
    cookies(),
    getGreetingName(locale),
  ]);

  const labels: ShellLabels = {
    appName: t("appName"),
    home: t("home"),
    sidebar: t("sidebar"),
    menu: t("menu"),
    closeMenu: t("closeMenu"),
    collapse: t("collapse"),
    expand: t("expand"),
    notifications: t("notifications"),
    nothingNew: t("nothingNew"),
    nav: {
      home: t("nav.home"),
      jobs: t("nav.jobs"),
      applications: t("nav.applications"),
      toApprove: t("nav.toApprove"),
    },
    help: t("help"),
    account: t("account"),
    settings: t("settings"),
    signOut: t("signOut"),
    plan: t("plan"),
    darkMode: t("darkMode"),
    language: t("language"),
    back: t("back"),
    localeNames: Object.fromEntries(
      locales.map((l) => [l, tLocale(`names.${l}`)]),
    ) as Record<Locale, string>,
    cvs: {
      title: t("cvs.title"),
      short: t("cvs.short"),
      create: t("cvs.create"),
      reassure: t("cvs.reassure"),
      error: t("cvs.error"),
      retry: t("cvs.retry"),
      untitled: t("cvs.untitled"),
      viewAll: t.raw("cvs.viewAll") as string,
    },
  };

  return (
    <ShellFrame
      locale={locale}
      labels={labels}
      initialCollapsed={parseCollapsed(jar.get(COLLAPSE_COOKIE)?.value)}
      name={name}
      signOut={signOut}
      cvList={
        <Suspense fallback={<CvSection state="loading" />}>
          <SavedCvs />
        </Suspense>
      }
    >
      {children}
    </ShellFrame>
  );
}

async function SavedCvs() {
  const result = await listCvs();
  if (!result.ok) return <CvSection state="error" />;
  return (
    <CvSection
      state="ok"
      cvs={result.value.map((cv) => ({
        id: cv.id,
        title: cv.title,
        headline: cv.headline,
        name: cv.name,
      }))}
    />
  );
}
