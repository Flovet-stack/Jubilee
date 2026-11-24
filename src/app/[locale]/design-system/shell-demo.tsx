"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  type ShellLabels,
  SidebarPreview,
} from "@/features/shell/components/shell";
import { isLocale, locales, type Locale } from "@/i18n/locales";

const SAMPLE_CVS = [
  { id: "a", title: "Marketing coordinator", tag: "EN · US" },
  {
    id: "b",
    title: "Chargée de communication digitale et événementielle",
    tag: "FR · FR",
  },
  { id: "c", title: "Product marketing", tag: "EN · US" },
];

/** The app shell sidebar of spec 15 in each state, with its real copy. */
export function ShellDemo() {
  const t = useTranslations("shell");
  const tl = useTranslations("localePicker");
  const current = useLocale();
  const locale: Locale = isLocale(current) ? current : "en-us";
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
    localeNames: Object.fromEntries(
      locales.map((l) => [l, tl(`names.${l}`)]),
    ) as Record<Locale, string>,
    cvs: {
      title: t("cvs.title"),
      short: t("cvs.short"),
      create: t("cvs.create"),
      reassure: t("cvs.reassure"),
      error: t("cvs.error"),
      retry: t("cvs.retry"),
    },
  };
  const states = [
    {
      caption: "With CVs",
      collapsed: false,
      name: "Amina",
      cvs: { state: "ok", cvs: SAMPLE_CVS },
    },
    {
      caption: "No CVs yet",
      collapsed: false,
      name: "Amina",
      cvs: { state: "ok", cvs: [] },
    },
    {
      caption: "Loading, no name",
      collapsed: false,
      name: null,
      cvs: { state: "loading" },
    },
    {
      caption: "Error",
      collapsed: false,
      name: "Amina",
      cvs: { state: "error" },
    },
    {
      caption: "Collapsed",
      collapsed: true,
      name: "Amina",
      cvs: { state: "ok", cvs: SAMPLE_CVS },
    },
  ] as const;

  return (
    <div className="flex flex-wrap items-start gap-6">
      {states.map((s) => (
        <figure key={s.caption} className="flex flex-col gap-2">
          <SidebarPreview
            locale={locale}
            labels={labels}
            collapsed={s.collapsed}
            name={s.name}
            cvs={
              s.cvs.state === "ok"
                ? { state: "ok", cvs: [...s.cvs.cvs] }
                : s.cvs
            }
          />
          <figcaption className="text-sm text-ink-muted">
            {s.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
