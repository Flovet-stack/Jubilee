import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { LocalePicker } from "@/components/locale-picker/locale-picker";
import { Well } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import type { Locale } from "@/i18n/locales";

/** A section body is a run of paragraphs, with an optional bulleted list. */
type Block = string | { list: string[] };

type RichTags = Record<string, (chunks: ReactNode) => ReactNode>;

/**
 * Layout shared by the legal pages (privacy 0011, terms 0014): title, last
 * updated date, intro, a contents list, then numbered sections whose copy
 * lives in `{namespace}.sections.{id}` in the message files.
 */
export async function LegalDocument({
  locale,
  namespace,
  sections,
  lastUpdated,
  links,
}: {
  locale: Locale;
  namespace: "privacy" | "terms";
  sections: readonly string[];
  /** ISO date; change with every edit to the text. */
  lastUpdated: string;
  /** Tags the section copy may use, e.g. `<contact>`. */
  links: RichTags;
}) {
  const t = await getTranslations({ locale, namespace });
  const format = await getFormatter({ locale });

  const updated = format.dateTime(new Date(`${lastUpdated}T00:00:00Z`), {
    dateStyle: "long",
    timeZone: "UTC",
  });

  return (
    <main className="mx-auto w-full max-w-(--container-reading) px-4 pt-12 pb-24 sm:pt-16">
      <article className="flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-muted">
            {t.rich("updated", {
              date: updated,
              time: (chunks) => <time dateTime={lastUpdated}>{chunks}</time>,
            })}
          </p>
          <p className="text-md/[1.6] text-ink">{t("intro")}</p>
        </header>

        <nav aria-label={t("contents")}>
          <Well title={t("contents")}>
            <ul className="flex flex-col gap-2 px-1 pb-1">
              {sections.map((id) => (
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
          {sections.map((id) => {
            const blocks = t.raw(`sections.${id}.blocks`) as Block[];
            return (
              <section
                key={id}
                id={id}
                aria-labelledby={`${id}-title`}
                // Receives focus from the contents links, so keyboard users
                // continue from the section they jumped to.
                tabIndex={-1}
                className="flex scroll-mt-6 flex-col gap-3 text-md/[1.6] outline-none"
              >
                <h2 id={`${id}-title`} className="text-lg font-bold text-ink">
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

        <LocalePicker locale={locale} />
      </article>
    </main>
  );
}
