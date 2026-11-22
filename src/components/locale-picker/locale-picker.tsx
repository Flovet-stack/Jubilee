import { getTranslations } from "next-intl/server";

import { locales, type Locale } from "@/i18n/locales";

import { LocaleLinks } from "./locale-links";

/**
 * Language and region picker (decision 0017). Each name is written in its
 * own language. Placed at the bottom of the placeholder home page and the
 * legal pages until the app shell gives it a home (spec 08).
 */
export async function LocalePicker({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "localePicker" });
  const names = Object.fromEntries(
    locales.map((l) => [l, t(`names.${l}`)]),
  ) as Record<Locale, string>;

  return (
    <nav
      aria-label={t("label")}
      className="flex flex-col gap-2 border-t border-line pt-6 text-sm text-ink-muted"
    >
      <h2 className="font-semibold text-ink-muted">{t("label")}</h2>
      <LocaleLinks current={locale} names={names} />
    </nav>
  );
}
