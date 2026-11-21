import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Well } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/seo";

/** Change with every edit to the policy text (spec 04, decision 0011). */
const LAST_UPDATED = "2026-11-21";

/** Section order from decision 0011. The ids are the jump-link anchors. */
const SECTIONS = [
  "summary",
  "who",
  "collect",
  "why",
  "processors",
  "storage",
  "retention",
  "rights",
  "ai",
  "cookies",
  "children",
  "changes",
  "complaints",
] as const;

/** A section body is a run of paragraphs, with an optional bulleted list. */
type Block = string | { list: string[] };

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/privacy"),
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "privacy" });
  const format = await getFormatter({ locale });

  // Links inside the policy text. Contact goes to the contact page, never
  // an email address (spec 04).
  const links = {
    contact: (chunks: ReactNode) => (
      <TextLink href={`/${locale}/contact`}>{chunks}</TextLink>
    ),
    cnil: (chunks: ReactNode) => (
      <TextLink
        href="https://www.cnil.fr"
        external
        externalHint={t("externalHint")}
      >
        {chunks}
      </TextLink>
    ),
  };

  const updated = format.dateTime(new Date(`${LAST_UPDATED}T00:00:00Z`), {
    dateStyle: "long",
    timeZone: "UTC",
  });

  return (
    <main className="mx-auto w-full max-w-(--container-reading) px-4 pt-12 pb-24 sm:pt-16">
      <article className="flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-sm text-ink-muted">
            {t.rich("updated", {
              date: updated,
              time: (chunks) => <time dateTime={LAST_UPDATED}>{chunks}</time>,
            })}
          </p>
          <p className="text-lg text-ink">{t("intro")}</p>
        </header>

        <nav aria-label={t("contents")}>
          <Well title={t("contents")}>
            <ul className="flex flex-col gap-2 px-1 pb-1">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <TextLink href={`#${id}`}>
                    {t(`sections.${id}.title`)}
                  </TextLink>
                </li>
              ))}
            </ul>
          </Well>
        </nav>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((id) => {
            const blocks = t.raw(`sections.${id}.blocks`) as Block[];
            return (
              <section
                key={id}
                id={id}
                aria-labelledby={`${id}-title`}
                // Receives focus from the contents links, so keyboard users
                // continue from the section they jumped to.
                tabIndex={-1}
                className="flex scroll-mt-6 flex-col gap-3 outline-none"
              >
                <h2 id={`${id}-title`} className="text-xl font-bold text-ink">
                  {t(`sections.${id}.title`)}
                </h2>
                {blocks.map((block, i) =>
                  typeof block === "string" ? (
                    <p key={i}>{t.rich(`sections.${id}.blocks.${i}`, links)}</p>
                  ) : (
                    <ul
                      key={i}
                      className="flex list-disc flex-col gap-2 ps-5 marker:text-ink-subtle"
                    >
                      {block.list.map((_, j) => (
                        <li key={j}>
                          {t.rich(
                            `sections.${id}.blocks.${i}.list.${j}`,
                            links,
                          )}
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            );
          })}
        </div>
      </article>
    </main>
  );
}
