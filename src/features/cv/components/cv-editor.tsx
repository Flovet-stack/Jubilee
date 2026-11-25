"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  HugeiconsArrowLeftIcon,
  HugeiconsBadgeAlertIcon,
  HugeiconsChevronRightIcon,
  HugeiconsCopyIcon,
  HugeiconsFileTextIcon,
  HugeiconsPencilIcon,
  HugeiconsPlusIcon,
  HugeiconsTrashIcon,
  MoreIcon,
} from "@/components/icons";
import { Button, buttonVariants, IconButton } from "@/components/ui/button";
import { Dialog, Sheet } from "@/components/ui/dialog";
import { Input } from "@/components/ui/field";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

import {
  type AnyEntry,
  type EditorStep,
  cvName,
  emptySection,
  followsContent,
  move,
  nextFirstPassStep,
  sameStep,
  stepStatus,
} from "../editor";
import { deleteCvAction, duplicateCvAction } from "../editor-actions";
import type { CvError } from "../logic";
import { type Finding, reviewCv } from "../review";
import {
  type CvContent,
  type CvLanguage,
  type CvMarket,
  type CvSection,
  SECTION_KINDS,
  type SectionKind,
} from "../schemas";
import { ClassicPreview } from "../templates/classic/classic-preview";
import { buildCvTree, type CvLabels, type TreeEntry } from "../tree";
import { RowActions } from "./fields";
import {
  ContactForm,
  Guidance,
  SectionForm,
  SummaryForm,
  summaryLine,
} from "./section-forms";
import { type SaveStatus, useAutosave } from "./use-autosave";

/**
 * The CV editor (spec 19; decisions 0031, 0024, 0025, 0026). A top bar with
 * the CV's name and a More menu, then two panes: the section list (or one
 * section's form) on the left, and Preview / Review tabs on the right, with
 * a Guidance tab while a form is open. Narrow windows show one pane and open
 * the tabs in a sheet. Autosave as in 0024 §4.
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

type Tab = "guidance" | "preview" | "review";

const PREVIEW_DELAY_MS = 150;
/** The content window width where both panes show (56rem, @4xl). */
const TWO_PANES_PX = 896;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const twoPanes = () =>
  (document.getElementById("cv-editor-root")?.clientWidth ?? 0) >= TWO_PANES_PX;

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
  const [openEntry, setOpenEntry] = useState<string | undefined>();
  /** True while a form fills the left pane; false shows the section list. */
  const [formOpen, setFormOpen] = useState(props.start);
  const [firstPass, setFirstPass] = useState(props.start);
  const [tab, setTab] = useState<Tab>(props.start ? "guidance" : "preview");
  /** The tab to return to when the form closes (0031 §2). */
  const [tabBeforeForm, setTabBeforeForm] =
    useState<Exclude<Tab, "guidance">>("preview");
  const [sheetOpen, setSheetOpen] = useState(false);
  const formTop = useRef<HTMLHeadingElement>(null);
  const listTop = useRef<HTMLHeadingElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const previewContent = useDebounced(content, PREVIEW_DELAY_MS);
  const tree = useMemo(
    () => buildCvTree(previewContent, { language, market, labels }),
    [previewContent, language, market, labels],
  );
  // Every entry as it prints, hidden sections included, for the list lines.
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

  const findings = useMemo(() => reviewCv(content), [content]);
  const isTwoPanes = useTwoPanes();

  const kindName = (kind: SectionKind) => t(`kinds.${kind}`);
  const stepName = (s: EditorStep): string => {
    if (s.type === "contact") return t("steps.contact");
    if (s.type === "summary") return t("steps.summary");
    const section = content.sections.find((x) => x.id === s.id);
    return section ? section.title.trim() || kindName(section.kind) : "";
  };
  const entryLabel = (entry: AnyEntry) =>
    summaryLine(entry, printed.get(entry.id)) || t("entry.untitled");

  /* ── Opening and closing a form (0031 §2) ─────────────────────────── */
  const open = (next: EditorStep, entryId?: string) => {
    void flush();
    setStep(next);
    setOpenEntry(entryId);
    if (!formOpen && tab !== "guidance") setTabBeforeForm(tab);
    setFormOpen(true);
    setTab("guidance");
    setSheetOpen(false);
    requestAnimationFrame(() => formTop.current?.focus());
  };

  const closeForm = (then?: Exclude<Tab, "guidance">) => {
    void flush();
    setFormOpen(false);
    setFirstPass(false);
    setTab(then ?? tabBeforeForm);
    requestAnimationFrame(() => listTop.current?.focus());
  };

  // A step whose section was removed falls back to Contact.
  const current =
    step.type === "section" && !content.sections.some((s) => s.id === step.id)
      ? ({ type: "contact" } as const)
      : step;
  const next = firstPass ? nextFirstPassStep(content, current) : null;

  /* ── The CV's name (0031 §1) ──────────────────────────────────────── */
  const [title, setTitle] = useState(props.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const savedTitle = useRef(props.title);
  /** The basics the automatic name was last made from. */
  const nameBasis = useRef(props.initialContent.basics);
  const titleWord = t("titleWord");

  const titleButton = useRef<HTMLButtonElement>(null);
  const titleCancelled = useRef(false);

  /** True when the name on screen is saved. */
  const saveTitle = async (value: string): Promise<boolean> => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === savedTitle.current) {
      setTitle(savedTitle.current);
      return true;
    }
    setTitle(trimmed);
    const result = await rename(trimmed);
    if (result.ok) savedTitle.current = result.value.title;
    else setTitle(savedTitle.current);
    return result.ok;
  };

  const stopEditingTitle = () => {
    setEditingTitle(false);
    requestAnimationFrame(() => titleButton.current?.focus());
  };

  // The automatic name follows the headline and name until renamed.
  const onContactBlur = () => {
    void flush();
    const { basics } = content;
    if (!followsContent(savedTitle.current, nameBasis.current, titleWord))
      return;
    const named = cvName(basics, titleWord).slice(0, 120);
    if (named === savedTitle.current) return;
    void saveTitle(named).then((saved) => {
      if (saved) nameBasis.current = basics;
    });
  };

  /* ── Duplicate and delete (0031 §1) ───────────────────────────────── */
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const failed = (code: CvError["code"]) =>
    toast({
      title:
        code === "not_found"
          ? t("actionErrors.notFound")
          : code === "unauthenticated"
            ? t("actionErrors.signedOut")
            : t("actionError"),
      closeLabel: t("dismiss"),
    });

  const duplicate = () =>
    startTransition(async () => {
      await flush();
      const result = await duplicateCvAction(
        id,
        t("copyTitle", { title: savedTitle.current }),
        locale,
      );
      if (result?.error) failed(result.error.code);
    });

  const remove = () =>
    startTransition(async () => {
      const result = await deleteCvAction(id, locale);
      if (result?.error) {
        setDeleteOpen(false);
        failed(result.error.code);
      }
    });

  const moreItems: MenuEntry[] = [
    {
      label: t("duplicate"),
      icon: <HugeiconsCopyIcon />,
      onSelect: duplicate,
      disabled: pending,
    },
    { type: "separator" },
    {
      label: t("delete"),
      icon: <HugeiconsTrashIcon />,
      tone: "danger",
      onSelect: () => setDeleteOpen(true),
      disabled: pending,
    },
  ];

  /* ── Sections and entries ─────────────────────────────────────────── */
  const setSections = (
    recipe: (sections: CvContent["sections"]) => CvContent["sections"],
  ) => update((c) => ({ ...c, sections: recipe(c.sections) }));

  const setEntries = (
    sectionId: string,
    recipe: (entries: AnyEntry[]) => AnyEntry[],
  ) =>
    setSections((sections) =>
      sections.map((s) =>
        s.id === sectionId
          ? ({ ...s, entries: recipe(s.entries as AnyEntry[]) } as CvSection)
          : s,
      ),
    );

  const addSection = (kind: SectionKind) => {
    const section = emptySection(kind);
    setSections((sections) => [...sections, section]);
    open({ type: "section", id: section.id });
  };

  const removeSection = (sectionId: string) => {
    const before = content.sections;
    setSections((sections) => sections.filter((s) => s.id !== sectionId));
    toast({
      title: t("sectionRemoved"),
      closeLabel: t("dismiss"),
      action: { label: t("undo"), onClick: () => setSections(() => before) },
    });
  };

  const removeEntry = (sectionId: string, entryId: string) => {
    const before = content.sections;
    setEntries(sectionId, (entries) => entries.filter((e) => e.id !== entryId));
    toast({
      title: t("entry.deleted"),
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

  /* ── The section list (left pane) ─────────────────────────────────── */
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
    return count === 0 ? t("notStarted") : t("entries", { count });
  };

  const findingsAt = (s: EditorStep) =>
    findings.filter((f) => sameStep(f.step, s));
  const message = (f: Finding) =>
    t(`review.findings.${f.code}`, { count: f.count ?? 0 });

  const rows: { step: EditorStep; section?: CvSection; index?: number }[] = [
    { step: { type: "contact" } },
    { step: { type: "summary" } },
    ...content.sections.map((section, index) => ({
      step: { type: "section", id: section.id } as EditorStep,
      section,
      index,
    })),
  ];

  const list = (
    <nav aria-labelledby="cv-sections-title" className="flex flex-col gap-3">
      <h2
        id="cv-sections-title"
        ref={listTop}
        tabIndex={-1}
        className="text-sm font-semibold text-ink-muted outline-none"
      >
        {t("sectionsLabel")}
      </h2>
      <ul className="flex flex-col gap-2 rounded-card bg-well p-2 shadow-[inset_0_0_0_1px_var(--line)]">
        {rows.map(({ step: s, section, index }) => {
          const done = stepStatus(content, s) === "done";
          const rowFindings = findingsAt(s);
          const sectionWide = rowFindings.filter((f) => !f.entryId);
          const entries = (section?.entries ?? []) as AnyEntry[];
          return (
            <li
              key={s.type === "section" ? s.id : s.type}
              className="flex flex-col rounded-control bg-card shadow-[inset_0_0_0_1px_var(--line)]"
            >
              <div className="flex items-stretch gap-1 pe-1">
                <button
                  type="button"
                  onClick={() => open(s)}
                  className="flex min-h-11 min-w-0 flex-1 flex-col items-start gap-0.5 rounded-control px-3 py-2 text-start active:bg-wash-press hover-fine:bg-wash-hover"
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span
                      className={cn(
                        "flex min-w-0 items-center gap-1.5 font-semibold",
                        section?.hidden ? "text-ink-muted" : "text-ink",
                      )}
                    >
                      <span className="truncate">{stepName(s)}</span>
                      {rowFindings.length > 0 ? (
                        <FindingMarker
                          label={t("review.marker", {
                            count: rowFindings.length,
                          })}
                        />
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-base",
                        done ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      {section?.hidden
                        ? t("hidden")
                        : done
                          ? t("status.done")
                          : t("status.todo")}
                    </span>
                  </span>
                  <span className="w-full truncate text-sm text-ink-muted">
                    {rowSummary(s)}
                  </span>
                  {sectionWide.map((f) => (
                    <FindingLine key={f.key}>{message(f)}</FindingLine>
                  ))}
                </button>
                {index !== undefined ? (
                  <Menu
                    align="end"
                    trigger={
                      <IconButton
                        size="sm"
                        className="self-center"
                        label={t("section.more", { section: stepName(s) })}
                        icon={<MoreIcon />}
                      />
                    }
                    items={sectionMenu(index)}
                  />
                ) : null}
              </div>
              {section && entries.length > 0 ? (
                <ul className="flex flex-col border-t border-line py-1">
                  {entries.map((entry, i) => {
                    const label = entryLabel(entry);
                    const entryFindings = rowFindings.filter(
                      (f) => f.entryId === entry.id,
                    );
                    return (
                      <li
                        key={entry.id}
                        className="group/row flex items-center gap-1 px-1"
                      >
                        <button
                          type="button"
                          onClick={() => open(s, entry.id)}
                          className="jb-type flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center rounded-control text-start text-base text-ink active:bg-wash-press hover-fine:bg-wash-hover"
                        >
                          <span className="w-full truncate">{label}</span>
                          {entryFindings.map((f) => (
                            <FindingLine key={f.key}>{message(f)}</FindingLine>
                          ))}
                        </button>
                        <IconButton
                          size="sm"
                          label={t("editEntry", { entry: label })}
                          icon={<HugeiconsPencilIcon />}
                          onClick={() => open(s, entry.id)}
                          className="pointer-fine:opacity-0 pointer-fine:group-focus-within/row:opacity-100 pointer-fine:group-hover/row:opacity-100"
                        />
                        <RowActions
                          onUp={
                            i > 0
                              ? () =>
                                  setEntries(section.id, (all) =>
                                    move(all, i, -1),
                                  )
                              : undefined
                          }
                          onDown={
                            i < entries.length - 1
                              ? () =>
                                  setEntries(section.id, (all) =>
                                    move(all, i, 1),
                                  )
                              : undefined
                          }
                          onRemove={() => removeEntry(section.id, entry.id)}
                          labels={{
                            up: t("moveUp"),
                            down: t("moveDown"),
                            remove: t("entry.delete"),
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
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
            icon={<HugeiconsPlusIcon />}
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

  /* ── One section's form (left pane, in place of the list) ─────────── */
  const section =
    current.type === "section"
      ? content.sections.find((s) => s.id === current.id)
      : undefined;
  const guidanceKey =
    current.type === "section" ? (section?.kind ?? "custom") : current.type;

  const finishFirstPass = () => {
    closeForm("preview");
    if (twoPanes())
      tabsRef.current?.querySelector<HTMLElement>("[role=tab]")?.focus();
    else setSheetOpen(true);
  };

  const form = (
    <section aria-labelledby="cv-step-title" className="flex flex-col gap-6">
      <Button
        variant="quiet"
        size="sm"
        className="self-start"
        icon={<HugeiconsArrowLeftIcon />}
        onClick={() => closeForm()}
      >
        {t("allSections")}
      </Button>
      <h2
        id="cv-step-title"
        ref={formTop}
        tabIndex={-1}
        className="text-lg outline-none"
      >
        {stepName(current)}
      </h2>
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
          key={`${section.id}:${openEntry ?? ""}`}
          section={section}
          initialOpenId={openEntry}
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
              iconEnd={<HugeiconsChevronRightIcon />}
              onClick={() => open(next)}
            >
              {t("next", { section: stepName(next) })}
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<HugeiconsFileTextIcon />}
              onClick={finishFirstPass}
            >
              {t("seeCv")}
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );

  /* ── The right pane: Guidance, Preview, Review ────────────────────── */
  const review = (
    <ReviewPanel
      findings={findings}
      stepName={stepName}
      entryName={(f) => {
        if (!f.entryId || f.step.type !== "section") return null;
        const stepId = f.step.id;
        const entries = (content.sections.find((s) => s.id === stepId)
          ?.entries ?? []) as AnyEntry[];
        const entry = entries.find((e) => e.id === f.entryId);
        return entry ? entryLabel(entry) : null;
      }}
      message={message}
      onGo={(f) => open(f.step, f.entryId)}
    />
  );

  const shownTab: Tab = tab === "guidance" && !formOpen ? tabBeforeForm : tab;

  const tabs = (
    <div ref={tabsRef}>
      <Tabs
        label={t("tabs.label")}
        value={shownTab}
        onValueChange={(value) => setTab(value as Tab)}
        items={[
          ...(formOpen
            ? [
                {
                  value: "guidance",
                  label: t("tabs.guidance"),
                  panel: <Guidance step={guidanceKey} />,
                },
              ]
            : []),
          {
            value: "preview",
            label: t("tabs.preview"),
            panel: (
              <ClassicPreview
                tree={tree}
                pageBreakLabel={(page) => t("pageBreak", { page })}
                namePlaceholder={t("namePlaceholder")}
              />
            ),
          },
          {
            value: "review",
            label: t("tabs.review"),
            meta: findings.length > 0 ? findings.length : undefined,
            panel: review,
          },
        ]}
      />
    </div>
  );

  return (
    <div
      className="@container mx-auto w-full max-w-[100rem]"
      id="cv-editor-root"
    >
      <div className="flex w-full flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <header className="flex items-center gap-2 border-b border-line pb-4">
          <Tooltip content={t("back")}>
            <Link
              href={homeHref}
              aria-label={t("back")}
              className={buttonVariants({
                variant: "quiet",
                size: "md",
                iconOnly: true,
              })}
            >
              <span className="jb-type-icon">
                <HugeiconsArrowLeftIcon />
              </span>
            </Link>
          </Tooltip>
          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <>
                <label htmlFor="cv-title" className="sr-only">
                  {t("titleLabel")}
                </label>
                <Input
                  id="cv-title"
                  autoFocus
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => {
                    titleCancelled.current = false;
                  }}
                  onBlur={(e) => {
                    setEditingTitle(false);
                    if (!titleCancelled.current) void saveTitle(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void saveTitle(e.currentTarget.value);
                      titleCancelled.current = true;
                      stopEditingTitle();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      titleCancelled.current = true;
                      setTitle(savedTitle.current);
                      stopEditingTitle();
                    }
                  }}
                  className="font-semibold"
                />
              </>
            ) : (
              <button
                ref={titleButton}
                type="button"
                title={title}
                aria-label={t("rename", { title })}
                onClick={() => setEditingTitle(true)}
                className="jb-type max-w-full truncate rounded-control text-start text-lg font-semibold text-ink hover-fine:bg-wash-hover"
              >
                {title}
              </button>
            )}
          </div>
          <SaveStatusLine
            status={status}
            heldBack={heldBack}
            onRetry={() => void flush()}
          />
          <Button
            variant="secondary"
            size="sm"
            className="@4xl:hidden"
            onClick={() => setSheetOpen(true)}
            icon={<HugeiconsFileTextIcon />}
          >
            {t("preview")}
          </Button>
          <Menu
            align="end"
            trigger={<IconButton label={t("more")} icon={<MoreIcon />} />}
            items={moreItems}
          />
        </header>

        <div className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] @4xl:items-start">
          <div className="min-w-0">{formOpen ? form : list}</div>
          <aside
            aria-label={t("tabs.label")}
            className="hidden @4xl:sticky @4xl:top-6 @4xl:block @4xl:max-h-[calc(100dvh-3rem)] @4xl:overflow-y-auto @4xl:pb-4"
          >
            {isTwoPanes ? tabs : null}
          </aside>
        </div>

        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title={t("tabs.label")}
          closeLabel={t("closePreview")}
          side="bottom"
          className="h-dvh max-h-none rounded-none"
        >
          {sheetOpen && !isTwoPanes ? <div className="pb-4">{tabs}</div> : null}
        </Sheet>

        <Dialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t("deleteDialog.title")}
          description={t("deleteDialog.body", { title })}
          closeLabel={t("deleteDialog.cancel")}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                {t("deleteDialog.cancel")}
              </Button>
              <Button variant="danger" onClick={remove} loading={pending}>
                {t("deleteDialog.confirm")}
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

/** Whether both panes are on screen: one copy of the tabs is mounted. */
function useTwoPanes(): boolean {
  // Two panes until measured: desktop is the common case, and a phone only
  // mounts the hidden pane for one frame.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const root = document.getElementById("cv-editor-root");
    if (!root) return;
    const observer = new ResizeObserver(() => setWide(twoPanes()));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  return wide;
}

/* ── Review (0031 §3) ───────────────────────────────────────────────── */

function FindingMarker({ label }: { label: string }) {
  return (
    <span
      className="inline-flex size-[1.125em] shrink-0 text-ink-muted [&_svg]:size-full"
      title={label}
    >
      <HugeiconsBadgeAlertIcon aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function FindingLine({ children }: { children: ReactNode }) {
  return (
    <span className="flex w-full items-start gap-[0.5em] text-sm text-ink-muted">
      {/* 1.125em icon (0030), centred on the first line. */}
      <span className="flex h-lh shrink-0 items-center [&_svg]:size-[1.125em]">
        <HugeiconsBadgeAlertIcon aria-hidden="true" />
      </span>
      <span className="min-w-0">{children}</span>
    </span>
  );
}

function ReviewPanel({
  findings,
  stepName,
  entryName,
  message,
  onGo,
}: {
  findings: Finding[];
  stepName: (step: EditorStep) => string;
  entryName: (finding: Finding) => string | null;
  message: (finding: Finding) => string;
  onGo: (finding: Finding) => void;
}) {
  const t = useTranslations("cv.editor.review");
  const groups: { step: EditorStep; items: Finding[] }[] = [];
  for (const finding of findings) {
    const group = groups.find((g) => sameStep(g.step, finding.step));
    if (group) group.items.push(finding);
    else groups.push({ step: finding.step, items: [finding] });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-ink">
          {t("summary", { count: findings.length })}
        </h3>
        <p className="text-sm text-ink-muted">
          {findings.length === 0 ? t("clear") : t("intro")}
        </p>
      </div>
      {groups.map((group) => (
        <section
          key={group.items[0]?.key}
          className="flex flex-col gap-2"
          aria-label={stepName(group.step)}
        >
          <h4 className="text-sm font-semibold text-ink-muted">
            {stepName(group.step)}
          </h4>
          <ul className="flex flex-col gap-2">
            {group.items.map((finding) => {
              const where = entryName(finding);
              return (
                <li
                  key={finding.key}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-card bg-well p-4 shadow-[inset_0_0_0_1px_var(--line)]"
                >
                  <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
                    {where ? (
                      <span className="truncate text-base font-semibold text-ink">
                        {where}
                      </span>
                    ) : null}
                    <span className="text-ink">{message(finding)}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onGo(finding)}
                  >
                    {t("goTo")}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
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
    case "invalid":
      message = t("invalid");
      break;
  }
  const routine =
    status === "saved" || status === "saving" || status === "pending";
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 text-sm text-ink-muted",
        routine && "max-sm:sr-only",
      )}
    >
      <span
        className={cn(
          status === "offline" ||
            status === "conflict" ||
            status === "tooLarge" ||
            status === "invalid"
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
