"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type DateMessages,
  DateField,
  DateRangeField,
  type DateRangeValue,
} from "@/components/ui/date-field";
import { PasswordField } from "@/components/ui/password-field";
import { PhoneField, type PhoneValue } from "@/components/ui/phone-field";
import { Card, Well } from "@/components/ui/surface";
import { isLocale, localeTag } from "@/i18n/locales";
import { defaultCountryFor } from "@/lib/phone";

/**
 * Spec 13 fields in every state, with their real copy (`fields.*`), so the
 * page shows them in the page's language. Development only.
 */
export function FieldsDemo() {
  const t = useTranslations("fields");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "en-us";
  const languageTag = localeTag(locale);
  const [phone, setPhone] = useState<PhoneValue | null>(null);
  const [range, setRange] = useState<DateRangeValue | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const phoneMessages = {
    country: t("phone.country"),
    search: t("phone.search"),
    noMatch: t("phone.noMatch"),
    invalid: (example: string) => t("phone.invalid", { example }),
    required: t("phone.required"),
  };
  const dateMessages: DateMessages = {
    month: t("date.month"),
    year: t("date.year"),
    monthPlaceholder: t("date.monthPlaceholder"),
    chooseDate: t("date.chooseDate"),
    errors: {
      incomplete: t("date.errors.incomplete"),
      impossible: t("date.errors.impossible"),
      yearMissing: t("date.errors.yearMissing"),
      beforeMin: t("date.errors.beforeMin"),
      afterMax: t("date.errors.afterMax"),
      required: t("date.errors.required"),
    },
  };
  const rangeMessages = {
    ...dateMessages,
    from: t("date.from"),
    to: t("date.to"),
    current: t("date.current"),
    chooseDates: t("date.chooseDates"),
    endBeforeStart: t("date.endBeforeStart"),
  };
  const passwordProps = {
    showLabel: t("password.show"),
    hideLabel: t("password.hide"),
    capsLockLabel: t("password.capsLock"),
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Phone, date and password fields</h2>
        <p className="max-w-(--container-reading) text-ink-muted">
          Spec 13, decision 0021. Copy from the message files in this page’s
          language ({languageTag}). Errors show when a field loses focus or its
          form submits.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Well title="Phone">
          <Card className="gap-6">
            <PhoneField
              label={t("phone.label")}
              hint={t("phone.hint")}
              languageTag={languageTag}
              defaultCountry={defaultCountryFor(locale)}
              onValueChange={setPhone}
              messages={phoneMessages}
            />
            <p className="text-sm text-ink-muted tabular-nums">
              Value: {phone ? `${phone.country} · ${phone.e164 ?? "—"}` : "—"}
            </p>
            <PhoneField
              label="Pasted from another country (filled)"
              languageTag={languageTag}
              defaultCountry={defaultCountryFor(locale)}
              defaultValue="+237671234567"
              messages={phoneMessages}
            />
            <PhoneField
              label="Invalid (server error)"
              error={t("phone.invalid", { example: "06 12 34 56 78" })}
              languageTag={languageTag}
              defaultCountry="FR"
              defaultValue="+33612345678"
              messages={phoneMessages}
            />
            <PhoneField
              label="Disabled"
              languageTag={languageTag}
              defaultCountry={defaultCountryFor(locale)}
              disabled
              messages={phoneMessages}
            />
            <PhoneField
              label="Read-only, sm"
              size="sm"
              languageTag={languageTag}
              defaultCountry="GB"
              defaultValue="+447400123456"
              readOnly
              messages={phoneMessages}
            />
          </Card>
        </Well>

        <Well title="Password">
          <Card className="gap-6">
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(new Date().toLocaleTimeString(languageTag));
              }}
            >
              <PasswordField
                label={t("password.label")}
                purpose="current"
                name="password"
                {...passwordProps}
              />
              <PasswordField
                label="New password"
                purpose="new"
                name="newPassword"
                showLabel="Show new password"
                hideLabel="Hide new password"
                capsLockLabel={passwordProps.capsLockLabel}
              />
              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary">
                  Submit (hides both)
                </Button>
                {submitted ? (
                  <span className="text-sm text-ink-muted">
                    Submitted at {submitted}
                  </span>
                ) : null}
              </div>
            </form>
            <PasswordField
              label="lg, invalid"
              size="lg"
              purpose="current"
              error="Enter your password"
              {...passwordProps}
            />
            <PasswordField
              label="Disabled"
              purpose="current"
              disabled
              {...passwordProps}
            />
          </Card>
        </Well>

        <Well title="Single dates">
          <Card className="gap-6">
            <DateField
              label="Graduation year"
              precision="year"
              languageTag={languageTag}
              messages={dateMessages}
            />
            <DateField
              label="Started (month and year)"
              precision="month"
              languageTag={languageTag}
              defaultValue="2021-03"
              messages={dateMessages}
            />
            <DateField
              label="Interview date"
              hint="Type it or choose it in the calendar."
              precision="day"
              languageTag={languageTag}
              min="2026-01-01"
              max="2027-12-31"
              messages={dateMessages}
            />
            <DateField
              label="Invalid (server error)"
              precision="day"
              languageTag={languageTag}
              error={dateMessages.errors.impossible}
              messages={dateMessages}
            />
            <DateField
              label="Disabled, sm"
              size="sm"
              precision="month"
              languageTag={languageTag}
              disabled
              messages={dateMessages}
            />
            <DateField
              label="Read-only"
              precision="day"
              languageTag={languageTag}
              defaultValue="2026-11-22"
              readOnly
              messages={dateMessages}
            />
          </Card>
        </Well>

        <Well title="Date ranges">
          <Card className="gap-6">
            <DateRangeField
              label="Logistics coordinator, Sawa Logistics"
              precision="month"
              languageTag={languageTag}
              defaultValue={{ start: "2022-03", current: true }}
              onValueChange={setRange}
              messages={rangeMessages}
            />
            <p className="text-sm text-ink-muted tabular-nums">
              Value:{" "}
              {range
                ? `${range.start ?? "—"} → ${range.current ? "current" : (range.end ?? "—")}`
                : "—"}
            </p>
            <DateRangeField
              label="Availability for interviews"
              precision="day"
              languageTag={languageTag}
              messages={{ ...rangeMessages, current: undefined }}
            />
            <DateRangeField
              label="Studies (years)"
              precision="year"
              languageTag={languageTag}
              defaultValue={{ start: "2016", end: "2019" }}
              messages={{ ...rangeMessages, current: undefined }}
            />
          </Card>
        </Well>
      </div>
    </section>
  );
}
