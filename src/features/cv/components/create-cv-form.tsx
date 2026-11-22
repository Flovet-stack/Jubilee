"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { RadioGroup } from "@/components/ui/radio-group";
import type { Locale } from "@/i18n/locales";

import { type CreateCvState, createCvAction } from "../editor-actions";
import type { CvLanguage, CvMarket } from "../schemas";

/**
 * "Create a CV" (0024 §6): the CV's language and market, prefilled from the
 * locale. The title starts as the plain word and follows the name later.
 */
export function CreateCvForm({
  locale,
  language,
  market,
}: {
  locale: Locale;
  language: CvLanguage;
  market: CvMarket;
}) {
  const t = useTranslations("cv.create");
  const [state, action, pending] = useActionState<CreateCvState, FormData>(
    createCvAction,
    { error: null },
  );
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="title" value={t("titleWord")} />
      {state.error ? <Alert tone="danger" title={t("error")} /> : null}
      <RadioGroup
        name="language"
        legend={t("language")}
        hint={t("languageHint")}
        defaultValue={language}
        appearance="cards"
        options={[
          { value: "en", label: t("languages.en") },
          { value: "fr", label: t("languages.fr") },
        ]}
      />
      <RadioGroup
        name="market"
        legend={t("market")}
        hint={t("marketHint")}
        defaultValue={market}
        appearance="cards"
        options={[
          { value: "US", label: t("markets.US") },
          { value: "FR", label: t("markets.FR") },
        ]}
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={pending}
        className="self-start"
      >
        {t("submit")}
      </Button>
    </form>
  );
}
