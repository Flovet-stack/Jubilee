"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  HugeiconsArrowLeftIcon,
  HugeiconsChevronRightIcon,
  HugeiconsFileTextIcon,
  HugeiconsPlusIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/dialog";
import { Input } from "@/components/ui/field";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { useToast } from "@/components/ui/toast";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

import {
  type EditorStep,
  defaultTitle,
  emptySection,
  move,
  nextFirstPassStep,
  sameStep,
  stepStatus,
} from "../editor";
import {
  type CvContent,
  type CvLanguage,
  type CvMarket,
  SECTION_KINDS,
  type SectionKind,
} from "../schemas";
import { ClassicPreview } from "../templates/classic/classic-preview";
import { buildCvTree, type CvLabels, type TreeEntry } from "../tree";
import {
  ContactForm,
  Guidance,
  SectionForm,
  SummaryForm,
} from "./section-forms";
import { type SaveStatus, useAutosave } from "./use-autosave";

/**
 * The CV editor (spec 14; decisions 0024, 0025, 0026). A section list with
 * a guided first pass, one form at a time, a live Classic preview beside it
 * (≥ 1024 px) or in a sheet (phones), and autosave.
 */

type CvEditorProps = {
  id: string;
  title: string;
  language: CvLanguage;
  market: CvMarket;
  locale: Locale;
  languageTag: string;
  initialContent: CvContent;
  initialUpdatedAt: string;
  /** True right after "Create a CV": the first pass (0024 §1). */
  start: boolean;
  /** Headings and "Present" in the CV's language. */
  labels: CvLabels;
  homeHref: string;
};

const PREVIEW_DELAY_MS = 150;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function CvEditor(props: CvEditorProps) {
  const { id, language, market, locale, languageTag, labels, homeHref } = props;
  const t = useTranslations("cv.editor");
  const toast = useToast();
  const { content, update, flush, rename, status, heldBack } = useAutosave({
    id,
    initialContent: props.initialContent,
    initialUpdatedAt: props.initialUpdatedAt,
  });

  const [step, setStep] = useState<EditorStep>({ type: "contact" });
  const [firstPass, setFirstPass] = useState(props.start);
  // Phones show the list or one form; from 1024 px both are on screen.
  const [listOnPhone, setListOnPhone] = useState(!props.start);
  const [previewOpen, setPreviewOpen] = useState(false);
  const formTop = useRef<HTMLHeadingElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const previewContent = useDebounced(content, PREVIEW_DELAY_MS);
  const tree = useMemo(
    () => buildCvTree(previewContent, { language, market, labels }),
    [previewContent, language, market, labels],
  );
  // Every entry as it prints, hidden sections included, for the card lines.
  const printed = useMemo(() => {
    const all = buildCvTree(
      {
        ...content,
        sections: content.sections.map((s) => ({ ...s, hidden: false })),
      },
      { language, market, labels },
    );
    const map = new Map<string, TreeEntry>();
    for (const section of all.sections) {
      if (section.layout === "entries")
        for (const entry of section.entries) map.set(entry.id, entry);
    }
    return map;
  }, [content, language, market, labels]);

  const kindName = (kind: SectionKind) => t(`kinds.${kind}`);
  const stepName = (s: EditorStep): string => {
    if (s.type === "contact") return t("steps.contact");
    if (s.type === "summary") return t("steps.summary");
    const section = content.sections.find((x) => x.id === s.id);
    return section ? section.title.trim() || kindName(section.kind) : "";
  };

  const open = (next: EditorStep) => {
    void flush();
    setStep(next);
    setListOnPhone(false);
    requestAnimationFrame(() => formTop.current?.focus());
  };

  // A step whose section was removed falls back to Contact.
  const current =
    step.type === "section" && !content.sections.some((s) => s.id === step.id)
      ? ({ type: "contact" } as const)
      : step;
  const next = firstPass ? nextFirstPassStep(content, current) : null;

  /* ── Title ───────────────────────────────────────────────────────── */
  const [title, setTitle] = useState(props.title);
  const savedTitle = useRef(props.title);
  const saveTitle = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === savedTitle.current) {
      setTitle(savedTitle.current);
      return;
    }
    const result = await rename(trimmed);
    if (result.ok) savedTitle.current = result.value.title;
    else setTitle(savedTitle.current);
  };
  // The default title follows the name until the user renames it (0024 §6).
  const titleWord = t("titleWord");
  const onContactBlur = () => {
    void flush();
    if (savedTitle.current === titleWord && content.basics.name.trim()) {
      const named = defaultTitle(content.basics.name, titleWord);
      setTitle(named);
      void saveTitle(named);
    }
  };

  /* ── Sections ────────────────────────────────────────────────────── */
  const setSections = (
    recipe: (sections: CvContent["sections"]) => CvContent["sections"],
  ) => update((c) => ({ ...c, sections: recipe(c.sections) }));

  const addSection = (kind: SectionKind) => {
    const section = emptySection(kind);
    setSections((sections) => [...sections, section]);
    open({ type: "section", id: section.id });
  };

  const removeSection = (sectionId: string) => {
    const before = content.sections;
    setSections((sections) => sections.filter((s) => s.id !== sectionId));
    if (current.type === "section" && current.id === sectionId)
      setStep({ type: "contact" });
    toast({
      title: t("sectionRemoved"),
      closeLabel: t("dismiss"),
      action: { label: t("undo"), onClick: () => setSections(() => before) },
    });
  };

  const sectionMenu = (index: number): MenuEntry[] => {
    const section = content.sections[index];
    if (!section) return [];
    return [
      {
        label: t("section.moveUp"),
        onSelect: () => setSections((s) => move(s, index, -1)),
        disabled: index === 0,
      },
      {
        label: t("section.moveDown"),
        onSelect: () => setSections((s) => move(s, index, 1)),
        disabled: index === content.sections.length - 1,
      },
      {
        label: section.hidden ? t("section.show") : t("section.hide"),
        onSelect: () =>
          setSections((all) =>
            all.map((s) =>
              s.id === section.id ? { ...s, hidden: !s.hidden } : s,
            ),
          ),
      },
      { type: "separator" },
      {
        label: t("section.remove"),
        tone: "danger",
        onSelect: () => removeSection(section.id),
      },
    ];
  };

  /* ── Rows of the list ────────────────────────────────────────────── */
  const rowSummary = (s: EditorStep): string => {
    if (s.type === "contact") {
      const { name, email, phone } = content.basics;
      return (
        [name, email || phone].filter(Boolean).join(" · ") || t("notStarted")
      );
    }
    if (s.type === "summary") {
      const text = content.basics.summary.trim();
      return text ? text.slice(0, 80) : t("notStarted");
    }
    const section = content.sections.find((x) => x.id === s.id);
    const count = section?.entries.length ?? 0;
    if (!section || count === 0) return t("notStarted");
    const first = section.entries[0];
    const latest = first ? (printed.get(first.id)?.line1Left ?? "") : "";
    return [t("entries", { count }), latest].filter(Boolean).join(" · ");
  };

  const rows: { step: EditorStep; index?: number; hidden?: boolean }[] = [
    { step: { type: "contact" } },
    { step: { type: "summary" } },
    ...content.sections.map((s, index) => ({
      step: { type: "section", id: s.id } as EditorStep,
      index,
      hidden: s.hidden,
    })),
  ];

  const list = (
    <nav aria-label={t("sectionsLabel")} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-ink-muted">
        {t("sectionsLabel")}
      </h2>
      <ul className="flex flex-col gap-2 rounded-card bg-well p-2 shadow-[inset_0_0_0_1px_var(--line)]">
        {rows.map(({ step: s, index, hidden }) => {
          const done = stepStatus(content, s) === "done";
          const active = sameStep(s, current);
          return (
            <li
              key={s.type === "section" ? s.id : s.type}
              className="group/row flex items-stretch gap-1"
            >
              <button
                type="button"
                onClick={() => open(s)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-11 min-w-0 flex-1 flex-col items-start gap-0.5 rounded-control px-3 py-2 text-start",
                  active
                    ? "bg-card shadow-[inset_0_0_0_1px_var(--line)]"
                    : "active:bg-wash-press hover-fine:bg-wash-hover",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate font-semibold",
                      hidden ? "text-ink-muted" : "text-ink",
                    )}
                  >
                    {stepName(s)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm",
                      done ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {hidden
                      ? t("hidden")
                      : done
                        ? t("status.done")
                        : t("status.todo")}
                  </span>
                </span>
                <span className="w-full truncate text-sm text-ink-muted">
                  {rowSummary(s)}
                </span>
              </button>
              {index !== undefined ? (
                <Menu
                  align="end"
                  trigger={
                    <Button
                      variant="quiet"
                      size="sm"
                      className="self-center px-2"
                      aria-label={t("section.more", { section: stepName(s) })}
                    >
                      ⋯
                    </Button>
                  }
                  items={sectionMenu(index)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      <Menu
        trigger={
          <Button
            variant="quiet"
            className="self-start"
            icon={<HugeiconsPlusIcon size={18} />}
            disabled={content.sections.length >= 20}
          >
            {t("addSection")}
          </Button>
        }
        items={SECTION_KINDS.map((kind) => ({
          label: kindName(kind),
          onSelect: () => addSection(kind),
        }))}
      />
    </nav>
  );

  /* ── The open form ───────────────────────────────────────────────── */
  const section =
    current.type === "section"
      ? content.sections.find((s) => s.id === current.id)
      : undefined;
  const guidanceKey =
    current.type === "section" ? (section?.kind ?? "custom") : current.type;

  const finishFirstPass = () => {
    void flush();
    setFirstPass(false);
    if (window.matchMedia("(min-width: 1024px)").matches) {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      previewRef.current?.focus();
    } else {
      setPreviewOpen(true);
    }
  };

  const form = (
    <section aria-labelledby="cv-step-title" className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setListOnPhone(true)}
        className="flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-violet lg:hidden"
      >
        <HugeiconsArrowLeftIcon size={18} />
        {t("allSections")}
      </button>
      <div className="flex flex-col gap-3">
        <h2
          id="cv-step-title"
          ref={formTop}
          tabIndex={-1}
          className="text-2xl outline-none"
        >
          {stepName(current)}
        </h2>
        <Guidance step={guidanceKey} />
      </div>
      {current.type === "contact" ? (
        <ContactForm
          content={content}
          update={update}
          flush={onContactBlur}
          languageTag={languageTag}
          locale={locale}
        />
      ) : current.type === "summary" ? (
        <SummaryForm
          content={content}
          update={update}
          flush={() => void flush()}
        />
      ) : section ? (
        <SectionForm
          key={section.id}
          section={section}
          printed={printed}
          defaultHeading={
            labels.headings[section.kind] || kindName(section.kind)
          }
          update={update}
          flush={() => void flush()}
          languageTag={languageTag}
        />
      ) : null}
      {firstPass ? (
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          {next ? (
            <Button
              variant="primary"
              iconEnd={<HugeiconsChevronRightIcon size={18} />}
              onClick={() => open(next)}
            >
              {t("next", { section: stepName(next) })}
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<HugeiconsFileTextIcon size={18} />}
              onClick={finishFirstPass}
            >
              {t("seeCv")}
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );

  const preview = (
    <ClassicPreview
      tree={tree}
      pageBreakLabel={(page) => t("pageBreak", { page })}
      namePlaceholder={t("namePlaceholder")}
    />
  );

  return (
    <div className="mx-auto flex w-full max-w-(--container-content) flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={homeHref}
          className="flex min-h-11 items-center gap-1 text-sm font-semibold text-violet"
        >
          <HugeiconsArrowLeftIcon size={18} />
          {t("back")}
        </Link>
        <div className="min-w-0 flex-1 basis-56">
          <label htmlFor="cv-title" className="sr-only">
            {t("titleLabel")}
          </label>
          <Input
            id="cv-title"
            size="sm"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => void saveTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="font-semibold"
          />
        </div>
        <SaveStatusLine
          status={status}
          heldBack={heldBack}
          onRetry={() => void flush()}
        />
        <Button
          variant="secondary"
          size="sm"
          className="lg:hidden"
          onClick={() => setPreviewOpen(true)}
          icon={<HugeiconsFileTextIcon size={18} />}
        >
          {t("preview")}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <div
          className={cn(
            listOnPhone ? "block" : "hidden",
            "lg:sticky lg:top-6 lg:block",
          )}
        >
          {list}
        </div>
        <div className={cn(listOnPhone ? "hidden" : "block", "lg:block")}>
          {form}
        </div>
        <aside
          ref={previewRef}
          tabIndex={-1}
          aria-label={t("previewLabel")}
          className="hidden outline-none lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pb-4"
        >
          {preview}
        </aside>
      </div>

      <Sheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={t("previewLabel")}
        closeLabel={t("closePreview")}
        side="bottom"
      >
        {previewOpen ? <div className="pb-4">{preview}</div> : null}
      </Sheet>
    </div>
  );
}

function SaveStatusLine({
  status,
  heldBack,
  onRetry,
}: {
  status: SaveStatus;
  heldBack: number;
  onRetry: () => void;
}) {
  const t = useTranslations("cv.editor.save");
  let message: string;
  let action: { label: string; onClick: () => void } | null = null;
  switch (status) {
    case "saved":
      message = t("saved");
      break;
    case "saving":
      message = t("saving");
      break;
    case "pending":
      message = heldBack > 0 ? t("heldBack", { count: heldBack }) : t("saving");
      break;
    case "offline":
      message = t("offline");
      action = { label: t("retry"), onClick: onRetry };
      break;
    case "conflict":
      message = t("conflict");
      action = { label: t("reload"), onClick: () => window.location.reload() };
      break;
    case "tooLarge":
      message = t("tooLarge");
      break;
  }
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-ink-muted">
      <span
        className={cn(
          status === "offline" || status === "conflict" || status === "tooLarge"
            ? "text-ink"
            : undefined,
        )}
      >
        {message}
      </span>
      {action ? (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </p>
  );
}
