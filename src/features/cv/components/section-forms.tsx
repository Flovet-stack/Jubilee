"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { HugeiconsPlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PhoneField } from "@/components/ui/phone-field";
import { useToast } from "@/components/ui/toast";
import type { Locale } from "@/i18n/locales";
import { defaultCountryFor } from "@/lib/phone";
import { cn } from "@/lib/utils";

import { type AnyEntry, emptyEntry, insertByDate, move } from "../editor";
import type { CvContent, CvSection, SectionKind } from "../schemas";
import type { TreeEntry } from "../tree";
import {
  BulletsField,
  DatesField,
  ItemsField,
  MonthField,
  RowActions,
  TextField,
} from "./fields";

/**
 * The forms of the CV editor (spec 14, decision 0024 §2): Contact, Summary,
 * and one form per section kind. One entry is open at a time; the others
 * are cards with one summary line.
 */

type Update = (recipe: (content: CvContent) => CvContent) => void;

type Common = {
  update: Update;
  /** Saves now: called when a field or entry is left. */
  flush: () => void;
  languageTag: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Guidance (0024 §5) ─────────────────────────────────────────────── */

export function Guidance({ step }: { step: GuidanceKey }) {
  const t = useTranslations(`cv.guidance.${step}`);
  const g = useTranslations("cv.guidance");
  const tips = t.raw("tips") as string[];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-ink-muted">{t("hint")}</p>
      <details className="group rounded-card bg-well p-4 shadow-[inset_0_0_0_1px_var(--line)]">
        <summary className="cursor-pointer font-semibold text-ink marker:text-ink-muted">
          {g("howTo")}
        </summary>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-ink">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-semibold text-ink">
          {g("exampleLabel")}
        </p>
        <p className="mt-1 text-sm text-ink-muted italic">{t("example")}</p>
      </details>
    </div>
  );
}

export type GuidanceKey = "contact" | "summary" | SectionKind;

/* ── Contact and summary ────────────────────────────────────────────── */

export function ContactForm({
  content,
  update,
  flush,
  languageTag,
  locale,
}: Common & { content: CvContent; locale: Locale }) {
  const t = useTranslations("cv.editor.contact");
  const e = useTranslations("cv.editor");
  const p = useTranslations("fields.phone");
  const { basics } = content;
  const set = (patch: Partial<CvContent["basics"]>) =>
    update((c) => ({ ...c, basics: { ...c.basics, ...patch } }));
  const setLocation = (patch: Partial<CvContent["basics"]["location"]>) =>
    update((c) => ({
      ...c,
      basics: { ...c.basics, location: { ...c.basics.location, ...patch } },
    }));

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label={t("name")}
        value={basics.name}
        onChange={(name) => set({ name })}
        onBlur={flush}
        autoComplete="name"
        maxLength={120}
      />
      <TextField
        label={t("headline")}
        hint={t("headlineHint")}
        optional
        value={basics.headline}
        onChange={(headline) => set({ headline })}
        onBlur={flush}
        autoComplete="organization-title"
        maxLength={160}
      />
      <TextField
        label={t("email")}
        type="email"
        value={basics.email}
        onChange={(email) => set({ email: email.trim() })}
        onBlur={flush}
        autoComplete="email"
        maxLength={254}
        check={(v) => (v && !EMAIL.test(v) ? e("errors.email") : null)}
      />
      <PhoneField
        label={p("label")}
        hint={p("hint")}
        optionalLabel={e("optional")}
        languageTag={languageTag}
        defaultCountry={defaultCountryFor(locale)}
        value={basics.phone || null}
        onValueChange={(v) => {
          if (v.e164) set({ phone: v.e164 });
        }}
        messages={{
          country: p("country"),
          search: p("search"),
          noMatch: p("noMatch"),
          invalid: (example: string) => p("invalid", { example }),
          required: p("required"),
        }}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={t("city")}
          optional
          value={basics.location.city}
          onChange={(city) => setLocation({ city })}
          onBlur={flush}
          autoComplete="address-level2"
          maxLength={100}
        />
        <TextField
          label={t("region")}
          optional
          value={basics.location.region}
          onChange={(region) => setLocation({ region })}
          onBlur={flush}
          autoComplete="address-level1"
          maxLength={100}
        />
      </div>
      <LinksField content={content} update={update} flush={flush} />
    </div>
  );
}

function LinksField({
  content,
  update,
  flush,
}: {
  content: CvContent;
  update: Update;
  flush: () => void;
}) {
  const t = useTranslations("cv.editor.contact");
  const e = useTranslations("cv.editor");
  const links = content.basics.links;
  const setLinks = (next: CvContent["basics"]["links"]) =>
    update((c) => ({ ...c, basics: { ...c.basics, links: next } }));
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-ink">
        {t("links")}{" "}
        <span className="font-normal text-ink-muted">{e("optional")}</span>
      </legend>
      <p className="-mt-1 text-sm text-ink-muted">{t("linksHint")}</p>
      {links.map((link, index) => (
        <div key={link.id} className="group/row flex items-end gap-2">
          <TextField
            className="flex-1"
            label={t("linkUrl", { number: index + 1 })}
            type="url"
            value={link.url}
            placeholder="https://"
            onChange={(url) =>
              setLinks(
                links.map((l) =>
                  l.id === link.id ? { ...l, url: url.trim() } : l,
                ),
              )
            }
            onBlur={flush}
            check={(v) =>
              v && !/^https?:\/\/\S+\.\S+/i.test(v) ? e("errors.url") : null
            }
          />
          <RowActions
            className="mb-1"
            onRemove={() => setLinks(links.filter((l) => l.id !== link.id))}
            labels={{
              up: e("moveUp"),
              down: e("moveDown"),
              remove: t("removeLink"),
            }}
          />
        </div>
      ))}
      <Button
        variant="quiet"
        size="sm"
        className="self-start"
        icon={<HugeiconsPlusIcon size={18} />}
        disabled={links.length >= 10}
        onClick={() =>
          setLinks([...links, { id: crypto.randomUUID(), label: "", url: "" }])
        }
      >
        {t("addLink")}
      </Button>
    </fieldset>
  );
}

export function SummaryForm({
  content,
  update,
  flush,
}: Omit<Common, "languageTag"> & { content: CvContent }) {
  const t = useTranslations("cv.editor.summary");
  return (
    <TextField
      label={t("label")}
      multiline
      maxLength={2000}
      value={content.basics.summary}
      onChange={(summary) =>
        update((c) => ({ ...c, basics: { ...c.basics, summary } }))
      }
      onBlur={flush}
    />
  );
}

/* ── Sections ───────────────────────────────────────────────────────── */

type SectionFormProps = Common & {
  section: CvSection;
  /** Entries as the CV prints them, for the cards' summary lines. */
  printed: Map<string, TreeEntry>;
  defaultHeading: string;
};

export function SectionForm({
  section,
  printed,
  defaultHeading,
  update,
  flush,
  languageTag,
}: SectionFormProps) {
  const t = useTranslations("cv.editor");
  const toast = useToast();
  const [openId, setOpenId] = useState<string | null>(() =>
    section.entries.length === 1 ? (section.entries[0]?.id ?? null) : null,
  );

  const setEntries = (recipe: (entries: AnyEntry[]) => AnyEntry[]) =>
    update((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === section.id
          ? ({ ...s, entries: recipe(s.entries as AnyEntry[]) } as CvSection)
          : s,
      ),
    }));

  const setEntry = (id: string, patch: Partial<AnyEntry>) =>
    setEntries((entries) =>
      entries.map((e) => (e.id === id ? ({ ...e, ...patch } as AnyEntry) : e)),
    );

  const add = () => {
    const entry = emptyEntry(section.kind);
    setEntries((entries) => [...entries, entry]);
    setOpenId(entry.id);
  };

  /** Closing an entry puts it in date order (0024 §2) and saves. */
  const close = (id: string) => {
    setEntries((entries) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return entries;
      return insertByDate(
        entries.filter((e) => e.id !== id),
        entry,
      );
    });
    setOpenId(null);
    flush();
  };

  const remove = (index: number) => {
    const before = section.entries as AnyEntry[];
    setEntries((entries) => entries.filter((_, i) => i !== index));
    if (openId === before[index]?.id) setOpenId(null);
    toast({
      title: t("entry.deleted"),
      closeLabel: t("dismiss"),
      action: { label: t("undo"), onClick: () => setEntries(() => before) },
    });
  };

  const entries = section.entries as AnyEntry[];

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label={t("heading")}
        hint={t("headingHint")}
        optional
        value={section.title}
        placeholder={defaultHeading}
        maxLength={80}
        onChange={(title) =>
          update((c) => ({
            ...c,
            sections: c.sections.map((s) =>
              s.id === section.id ? { ...s, title } : s,
            ),
          }))
        }
        onBlur={flush}
      />

      {entries.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {entries.map((entry, index) => {
            const open = entry.id === openId;
            const label =
              summaryLine(entry, printed.get(entry.id)) || t("entry.untitled");
            return (
              <li
                key={entry.id}
                className={cn(
                  "group/row rounded-card bg-card shadow-[inset_0_0_0_1px_var(--line)]",
                  open
                    ? "p-4 lg:p-5"
                    : "flex items-center gap-2 py-1 ps-4 pe-1",
                )}
              >
                {open ? (
                  <div className="flex flex-col gap-5">
                    <EntryForm
                      kind={section.kind}
                      entry={entry}
                      set={(patch) => setEntry(entry.id, patch)}
                      flush={flush}
                      languageTag={languageTag}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => close(entry.id)}
                      >
                        {t("entry.done")}
                      </Button>
                      <RowActions
                        onUp={
                          index > 0
                            ? () => setEntries((all) => move(all, index, -1))
                            : undefined
                        }
                        onDown={
                          index < entries.length - 1
                            ? () => setEntries((all) => move(all, index, 1))
                            : undefined
                        }
                        onRemove={() => remove(index)}
                        labels={{
                          up: t("moveUp"),
                          down: t("moveDown"),
                          remove: t("entry.delete"),
                        }}
                        className="pointer-fine:opacity-100"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="min-h-11 min-w-0 flex-1 truncate py-2 text-start text-ink"
                      onClick={() => {
                        if (openId) close(openId);
                        setOpenId(entry.id);
                      }}
                      aria-label={t("entry.edit", { entry: label })}
                    >
                      {label}
                    </button>
                    <RowActions
                      onUp={
                        index > 0
                          ? () => setEntries((all) => move(all, index, -1))
                          : undefined
                      }
                      onDown={
                        index < entries.length - 1
                          ? () => setEntries((all) => move(all, index, 1))
                          : undefined
                      }
                      onRemove={() => remove(index)}
                      labels={{
                        up: t("moveUp"),
                        down: t("moveDown"),
                        remove: t("entry.delete"),
                      }}
                    />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      <Button
        variant={entries.length === 0 ? "secondary" : "quiet"}
        className="self-start"
        icon={<HugeiconsPlusIcon size={18} />}
        disabled={entries.length >= 50}
        onClick={() => {
          if (openId) close(openId);
          add();
        }}
      >
        {t(`add.${section.kind}`)}
      </Button>
    </div>
  );
}

function summaryLine(entry: AnyEntry, printed: TreeEntry | undefined): string {
  if ("keywords" in entry)
    return [entry.name, entry.keywords.join(", ")].filter(Boolean).join(": ");
  if ("fluency" in entry)
    return [entry.language, entry.fluency].filter(Boolean).join(" · ");
  if (!printed) return "";
  return [printed.line1Left, printed.line2Left, printed.line1Right]
    .filter(Boolean)
    .join(" · ");
}

/* ── One entry's fields, by kind ────────────────────────────────────── */

function EntryForm({
  kind,
  entry,
  set,
  flush,
  languageTag,
}: {
  kind: SectionKind;
  entry: AnyEntry;
  set: (patch: Partial<AnyEntry>) => void;
  flush: () => void;
  languageTag: string;
}) {
  const t = useTranslations("cv.editor.fields");
  const e = useTranslations("cv.editor");
  const text = (
    key: string,
    value: string,
    max: number,
    extra?: {
      optional?: boolean;
      multiline?: boolean;
      hint?: ReactNode;
      type?: "url";
    },
  ) => (
    <TextField
      label={t(key)}
      value={value}
      maxLength={max}
      optional={extra?.optional}
      multiline={extra?.multiline}
      hint={extra?.hint}
      type={extra?.type}
      placeholder={extra?.type === "url" ? "https://" : undefined}
      check={
        extra?.type === "url"
          ? (v) =>
              v && !/^https?:\/\/\S+\.\S+/i.test(v) ? e("errors.url") : null
          : undefined
      }
      onChange={(v) =>
        set({
          [key]: extra?.type === "url" ? v.trim() : v,
        } as Partial<AnyEntry>)
      }
      onBlur={flush}
    />
  );
  const dates = (current: string) => (
    <DatesField
      label={t("dates")}
      start={"startDate" in entry ? entry.startDate : undefined}
      end={"endDate" in entry ? entry.endDate : undefined}
      currentLabel={current}
      languageTag={languageTag}
      onChange={(d) => set(d as Partial<AnyEntry>)}
    />
  );
  const bullets = (items: string[]) => (
    <BulletsField
      label={t("highlights")}
      hint={t("highlightsHint")}
      items={items}
      onChange={(highlights) => set({ highlights } as Partial<AnyEntry>)}
      onBlur={flush}
    />
  );
  const month = (value: string | undefined) => (
    <MonthField
      label={t("date")}
      value={value}
      languageTag={languageTag}
      onChange={(date) => set({ date } as Partial<AnyEntry>)}
    />
  );
  const pair = (...children: ReactNode[]) => (
    <div className="grid gap-5 sm:grid-cols-2">{children}</div>
  );

  switch (kind) {
    case "work": {
      const w = entry as Extract<
        CvSection,
        { kind: "work" }
      >["entries"][number];
      return (
        <>
          {text("position", w.position, 120)}
          {pair(
            text("name", w.name, 120),
            text("location", w.location, 120, { optional: true }),
          )}
          {dates(t("currentWork"))}
          {text("summary", w.summary, 2000, {
            optional: true,
            multiline: true,
          })}
          {bullets(w.highlights)}
        </>
      );
    }
    case "volunteer": {
      const v = entry as Extract<
        CvSection,
        { kind: "volunteer" }
      >["entries"][number];
      return (
        <>
          {text("position", v.position, 120)}
          {text("organization", v.organization, 120)}
          {dates(t("currentOngoing"))}
          {text("summary", v.summary, 2000, {
            optional: true,
            multiline: true,
          })}
          {bullets(v.highlights)}
        </>
      );
    }
    case "education": {
      const d = entry as Extract<
        CvSection,
        { kind: "education" }
      >["entries"][number];
      return (
        <>
          {pair(
            text("studyType", d.studyType, 120),
            text("area", d.area, 120, { optional: true }),
          )}
          {pair(
            text("institution", d.institution, 160),
            text("location", d.location, 120, { optional: true }),
          )}
          {dates(t("currentStudy"))}
          {text("score", d.score, 40, { optional: true })}
          <ItemsField
            label={t("courses")}
            hint={t("listHint")}
            items={d.courses}
            max={30}
            addLabel={t("listHint")}
            removeLabel={(item) => t("removeItem", { item })}
            onChange={(courses) => set({ courses } as Partial<AnyEntry>)}
          />
        </>
      );
    }
    case "skills": {
      const s = entry as Extract<
        CvSection,
        { kind: "skills" }
      >["entries"][number];
      return (
        <>
          <ItemsField
            label={t("keywords")}
            hint={t("listHint")}
            items={s.keywords}
            max={30}
            addLabel={t("listHint")}
            removeLabel={(item) => t("removeItem", { item })}
            onChange={(keywords) => set({ keywords } as Partial<AnyEntry>)}
          />
          {text("group", s.name, 80, { optional: true, hint: t("groupHint") })}
        </>
      );
    }
    case "languages": {
      const l = entry as Extract<
        CvSection,
        { kind: "languages" }
      >["entries"][number];
      return pair(
        text("language", l.language, 60),
        text("fluency", l.fluency, 60, { hint: t("fluencyHint") }),
      );
    }
    case "projects": {
      const p = entry as Extract<
        CvSection,
        { kind: "projects" }
      >["entries"][number];
      return (
        <>
          {text("projectName", p.name, 120)}
          {dates(t("currentOngoing"))}
          {text("url", p.url, 2048, { optional: true, type: "url" })}
          {text("description", p.description, 2000, {
            optional: true,
            multiline: true,
          })}
          {bullets(p.highlights)}
        </>
      );
    }
    case "certificates": {
      const c = entry as Extract<
        CvSection,
        { kind: "certificates" }
      >["entries"][number];
      return (
        <>
          {text("certificate", c.name, 160)}
          {pair(
            text("issuer", c.issuer, 120, { optional: true }),
            month(c.date),
          )}
          {text("url", c.url, 2048, { optional: true, type: "url" })}
        </>
      );
    }
    case "awards": {
      const a = entry as Extract<
        CvSection,
        { kind: "awards" }
      >["entries"][number];
      return (
        <>
          {text("title", a.title, 160)}
          {pair(
            text("awarder", a.awarder, 120, { optional: true }),
            month(a.date),
          )}
          {text("summary", a.summary, 1000, {
            optional: true,
            multiline: true,
          })}
        </>
      );
    }
    case "custom": {
      const c = entry as Extract<
        CvSection,
        { kind: "custom" }
      >["entries"][number];
      return (
        <>
          {text("title", c.title, 160)}
          {text("subtitle", c.subtitle, 160, { optional: true })}
          {dates(t("currentOngoing"))}
          {text("summary", c.summary, 2000, {
            optional: true,
            multiline: true,
          })}
          {bullets(c.highlights)}
        </>
      );
    }
  }
}
