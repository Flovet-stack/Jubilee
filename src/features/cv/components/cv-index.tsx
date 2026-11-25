"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { HugeiconsFileTextIcon, HugeiconsSearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { CV_SEARCH_FROM, cvRowText, matchesCv } from "@/features/shell/logic";

export type CvIndexItem = {
  id: string;
  title: string;
  headline: string;
  name: string;
  /** "Edited 3 days ago", formatted on the server. */
  edited: string;
};

/**
 * The Resumes page list (0032): a search from six resumes, a live count,
 * and one link per resume to its editor.
 */
export function CvIndex({
  locale,
  cvs,
}: {
  locale: string;
  cvs: CvIndexItem[];
}) {
  const t = useTranslations("cv.list");
  const [query, setQuery] = useState("");
  const rows = cvs.map((cv) => ({ cv, text: cvRowText(cv, t("untitled")) }));
  const searchable = cvs.length >= CV_SEARCH_FROM;
  const shown = searchable
    ? rows.filter((row) => matchesCv(row.text, query))
    : rows;

  return (
    <div className="flex flex-col gap-4">
      {searchable ? (
        <div className="flex flex-col gap-2">
          <Field label={t("search")}>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              icon={<HugeiconsSearchIcon />}
              autoComplete="off"
            />
          </Field>
          <p className="text-sm text-ink-muted" role="status">
            {shown.length > 0
              ? t("count", { count: shown.length })
              : t("noMatch")}
          </p>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <Button variant="secondary" onClick={() => setQuery("")}>
            {t("clear")}
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
          {shown.map(({ cv, text }) => (
            <li key={cv.id}>
              <Link
                href={`/${locale}/cvs/${cv.id}`}
                className="flex items-start gap-3 px-4 py-3 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--violet)] sm:items-center hover-fine:bg-wash-hover"
              >
                <HugeiconsFileTextIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-ink-muted sm:mt-0"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                  <span className="min-w-0 flex-1 font-semibold break-words text-ink">
                    {text.primary}
                    {text.secondary ? (
                      <>
                        <span aria-hidden="true" className="mx-1.5 text-line">
                          |
                        </span>
                        <span className="font-normal">{text.secondary}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm text-ink-muted">
                    {cv.edited}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
