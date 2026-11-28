"use client";

import { useTranslations } from "next-intl";
import { MotionConfig } from "motion/react";
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
  HugeiconsChevronRightIcon,
  HugeiconsCopyIcon,
  HugeiconsDownloadIcon,
  HugeiconsFileTextIcon,
  HugeiconsPencilIcon,
  HugeiconsPlusIcon,
  HugeiconsTrashIcon,
  HugeiconsMoreHorizontalIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants, IconButton } from "@/components/ui/button";
import { Dialog, Sheet } from "@/components/ui/dialog";
import { Alert, ToneMark } from "@/components/ui/feedback";
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
  emptyEntry,
  emptySection,
  followsContent,
  clearImportMark,
  importKey,
  move,
  nextFirstPassStep,
  sameStep,
} from "../editor";
import { deleteCvAction, duplicateCvAction } from "../editor-actions";
import { fileNameFromDisposition } from "../file-name";
import type { CvError } from "../logic";
import {
  type Finding,
  reviewCv,
  type Severity,
  severityOf,
  strongest,
} from "../review";
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
import { type RewriteFinding, targetFor } from "../rewrite";
import {
  ContactForm,
  Guidance,
  SectionForm,
  SummaryForm,
  summaryLine,
} from "./section-forms";
import {
  EmptyLine,
  EntryList,
  SkillGroups,
  headerAction,
  SectionBlock,
  SummaryCard,
} from "./section-list";
import { RewriteProvider, useRewriteApi } from "./rewrite";
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
  const importT = useTranslations("cv.import");
  const toast = useToast();
  const { content, update, flush, saveAll, rename, status, heldBack } =
    useAutosave({
      id,
      initialContent: props.initialContent,
      initialUpdatedAt: props.initialUpdatedAt,
    });

  const rewrites = useRewriteApi({
    cvId: id,
    language,
    content,
    update,
    saveAll,
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
  // Every entry as it prints, hidden sections and entries included, for the
  // list lines.
  const printed = useMemo(() => {
    const all = buildCvTree(
      {
        ...content,
        sections: content.sections.map(
          (s) =>
            ({
              ...s,
              hidden: false,
              entries: s.entries.map((e) => ({ ...e, hidden: false })),
            }) as CvSection,
        ),
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
    // Opening an imported section counts as checking it (0050, spec 31).
    const key = importKey(next);
    if (content.imported?.includes(key)) {
      update((c) => clearImportMark(c, key));
    }
    void flush();
    // Proposals belong to the form they were asked in (spec 29).
    rewrites.clear();
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
    rewrites.clear();
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

  /* ── Download PDF (0038; a top-bar button since 0042) ──────────────────────────────────────────── */
  const [downloading, setDownloading] = useState(false);
  const downloadingRef = useRef(false);

  const downloadPdf = async () => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setDownloading(true);
    try {
      // The file must match the screen: save first, and stop if we can't.
      if (!(await saveAll())) {
        toast({ title: t("pdf.unsaved"), closeLabel: t("dismiss") });
        return;
      }
      const response = await fetch(`/api/cvs/${id}/pdf`, {
        cache: "no-store",
      }).catch(() => null);
      if (!response?.ok) {
        if (response?.status === 401) failed("unauthenticated");
        else if (response?.status === 404) failed("not_found");
        else
          toast({
            title: t("pdf.failed"),
            closeLabel: t("dismiss"),
            action: {
              label: t("pdf.retry"),
              onClick: () => void downloadPdf(),
            },
          });
        return;
      }
      const blob = await response.blob();
      const name =
        fileNameFromDisposition(response.headers.get("Content-Disposition")) ??
        `${savedTitle.current}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.append(link);
      link.click();
      link.remove();
      // Give the browser time to start reading the file before freeing it.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast({
        title: t("pdf.failed"),
        closeLabel: t("dismiss"),
        action: { label: t("pdf.retry"), onClick: () => void downloadPdf() },
      });
    } finally {
      downloadingRef.current = false;
      setDownloading(false);
    }
  };

  const moreItems: MenuEntry[] = [
    {
      label: t("duplicate"),
      icon: <HugeiconsCopyIcon />,
      onSelect: duplicate,
      disabled: pending || downloading,
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
    const importedBefore = content.imported;
    update((c) => ({
      ...c,
      sections: c.sections.filter((s) => s.id !== sectionId),
      ...(c.imported
        ? { imported: c.imported.filter((k) => k !== sectionId) }
        : {}),
    }));
    toast({
      title: t("sectionRemoved"),
      closeLabel: t("dismiss"),
      action: {
        label: t("undo"),
        onClick: () =>
          update((c) => ({
            ...c,
            sections: before,
            ...(importedBefore ? { imported: importedBefore } : {}),
          })),
      },
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
    const text = content.basics.summary.trim();
    return text ? text.slice(0, 80) : t("notStarted");
  };

  /** "Suggest a rewrite" on a finding: open its form, then ask (spec 29). */
  const rewriteTarget = (f: Finding) => targetFor(f, content);
  const rewriteFinding = (f: Finding) => {
    const target = rewriteTarget(f);
    if (!target) return;
    open(f.step, f.entryId);
    rewrites.request(target, f.code as RewriteFinding);
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

  const addEntry = (section: CvSection) => {
    const entry = emptyEntry(section.kind);
    setEntries(section.id, (all) => [...all, entry as AnyEntry]);
    open({ type: "section", id: section.id }, entry.id);
  };

  const toggleEntry = (sectionId: string, entryId: string) =>
    setEntries(sectionId, (all) =>
      all.map((e) => (e.id === entryId ? { ...e, hidden: !e.hidden } : e)),
    );

  /** Hide or show one skill in a group (0048); stale names are dropped. */
  const toggleSkill = (sectionId: string, entryId: string, skill: string) =>
    setEntries(sectionId, (all) =>
      all.map((e) => {
        if (e.id !== entryId || !("keywords" in e)) return e;
        const off = new Set(
          (e.hiddenKeywords ?? []).filter((k) => e.keywords.includes(k)),
        );
        if (off.has(skill)) off.delete(skill);
        else off.add(skill);
        return { ...e, hiddenKeywords: [...off] };
      }),
    );

  const entryLabels = {
    move: (entry: string) => t("entry.move", { entry }),
    moveUp: t("moveUp"),
    moveDown: t("moveDown"),
    show: (entry: string) => t("entry.show", { entry }),
    remove: (entry: string) => t("entry.deleteNamed", { entry }),
  };

  const list = (
    <nav aria-label={t("sectionsLabel")} className="flex flex-col">
      <h2 ref={listTop} tabIndex={-1} className="sr-only">
        {t("sectionsLabel")}
      </h2>
      {content.importUnread?.length ? (
        <Alert
          tone="info"
          title={importT("unread.title")}
          dismissLabel={importT("unread.dismiss")}
          onDismiss={() =>
            update((c) => {
              const next = { ...c };
              delete next.importUnread;
              return next;
            })
          }
          className="m-3"
        >
          {importT("unread.body", { items: content.importUnread.join(", ") })}
        </Alert>
      ) : null}
      <MotionConfig reducedMotion="user">
        <ul className="flex flex-col">
          {rows.map(({ step: s, section, index }) => {
            const rowFindings = findingsAt(s);
            const sectionWide = rowFindings.filter((f) => !f.entryId);
            const entries = (section?.entries ?? []) as AnyEntry[];
            const name = stepName(s);
            return (
              <SectionBlock
                key={s.type === "section" ? s.id : s.type}
                title={name}
                marker={
                  <>
                    {rowFindings.length > 0 ? (
                      <FindingMarker
                        label={t("review.marker", {
                          count: rowFindings.length,
                        })}
                        severity={strongest(rowFindings) ?? "tip"}
                      />
                    ) : null}
                    {content.imported?.includes(importKey(s)) ? (
                      <Badge tone="violet" className="ms-2 shrink-0">
                        {importT("mark")}
                      </Badge>
                    ) : null}
                  </>
                }
                hiddenLabel={
                  section?.hidden ? t("section.hiddenMarker") : undefined
                }
                actions={
                  section && index !== undefined ? (
                    <>
                      <IconButton
                        size="sm"
                        label={t("entry.add", { section: name })}
                        icon={<HugeiconsPlusIcon />}
                        className={headerAction}
                        disabled={entries.length >= 50}
                        onClick={() => addEntry(section)}
                      />
                      <Menu
                        align="end"
                        trigger={
                          <IconButton
                            size="sm"
                            label={t("section.more", { section: name })}
                            icon={<HugeiconsMoreHorizontalIcon />}
                            className={headerAction}
                          />
                        }
                        items={sectionMenu(index)}
                      />
                    </>
                  ) : null
                }
              >
                {sectionWide.map((f) => (
                  <div key={f.key} className="flex flex-col items-start gap-1">
                    <FindingLine severity={severityOf(f.code)}>
                      {message(f)}
                    </FindingLine>
                    {rewriteTarget(f) ? (
                      <Button
                        variant="quiet"
                        size="sm"
                        icon={<HugeiconsPencilIcon />}
                        onClick={() => rewriteFinding(f)}
                      >
                        {t("rewrite.suggest")}
                      </Button>
                    ) : null}
                  </div>
                ))}
                {!section ? (
                  <SummaryCard onOpen={() => open(s)}>
                    <span className="w-full truncate">{rowSummary(s)}</span>
                  </SummaryCard>
                ) : entries.length === 0 ? (
                  <EmptyLine>{t("entry.none")}</EmptyLine>
                ) : section.kind === "skills" ? (
                  <SkillGroups
                    groups={entries.flatMap((entry) => {
                      if (!("keywords" in entry)) return [];
                      const off = new Set(entry.hiddenKeywords ?? []);
                      return [
                        {
                          id: entry.id,
                          name: entry.name.trim() || t("entry.untitledGroup"),
                          hidden: Boolean(entry.hidden),
                          skills: entry.keywords
                            .filter((k) => k.trim())
                            .map((k) => ({ name: k, hidden: off.has(k) })),
                        },
                      ];
                    })}
                    onOpen={(entryId) => open(s, entryId)}
                    onToggleGroup={(entryId) =>
                      toggleEntry(section.id, entryId)
                    }
                    onToggleSkill={(entryId, skill) =>
                      toggleSkill(section.id, entryId, skill)
                    }
                    showLabel={entryLabels.show}
                    emptyLabel={t("entry.noSkills")}
                  />
                ) : (
                  <EntryList
                    entries={entries}
                    rows={entries.map((entry) => ({
                      id: entry.id,
                      label: entryLabel(entry),
                      hidden: Boolean(entry.hidden),
                      findings: rowFindings
                        .filter((f) => f.entryId === entry.id)
                        .map((f) => (
                          <FindingLine
                            key={f.key}
                            severity={severityOf(f.code)}
                          >
                            {message(f)}
                          </FindingLine>
                        )),
                    }))}
                    onReorder={(next) => setEntries(section.id, () => next)}
                    onMove={(i, by) =>
                      setEntries(section.id, (all) => move(all, i, by))
                    }
                    onOpen={(entryId) => open(s, entryId)}
                    onToggle={(entryId) => toggleEntry(section.id, entryId)}
                    onRemove={(entryId) => removeEntry(section.id, entryId)}
                    labels={entryLabels}
                  />
                )}
              </SectionBlock>
            );
          })}
        </ul>
      </MotionConfig>
      <div className="p-4">
        <Menu
          trigger={
            <Button
              variant="secondary"
              className="w-full"
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
      </div>
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
      canRewrite={(f) => rewriteTarget(f) !== null}
      onRewrite={rewriteFinding}
    />
  );

  const shownTab: Tab = tab === "guidance" && !formOpen ? tabBeforeForm : tab;

  // Flush pane (0042): a white tab bar, panels padded on their own.
  const pad = "p-4 lg:p-6";
  const tabs = (
    <div ref={tabsRef} className="flex flex-1 flex-col">
      <Tabs
        className="flex-1 gap-0"
        listClassName="sticky top-0 z-10 bg-card px-4 lg:px-6"
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
                  panelClassName: pad,
                },
              ]
            : []),
          {
            value: "preview",
            label: t("tabs.preview"),
            panel: (
              <ClassicPreview
                tree={tree}
                namePlaceholder={t("namePlaceholder")}
              />
            ),
            panelClassName: cn("flex-1 bg-well", pad),
          },
          {
            value: "review",
            label: t("tabs.review"),
            meta: findings.length > 0 ? findings.length : undefined,
            panel: review,
            panelClassName: pad,
          },
        ]}
      />
    </div>
  );

  return (
    <RewriteProvider value={rewrites}>
      <div
        className="@container flex min-h-0 w-full flex-1 flex-col"
        id="cv-editor-root"
      >
        {/* Two panes fill the window; each scrolls on its own (0047). */}
        <div className="flex w-full flex-1 flex-col @4xl:min-h-0 @4xl:overflow-hidden">
          <header className="flex items-center gap-2 border-b border-line px-4 py-2 lg:px-6">
            <Tooltip content={t("back")}>
              <Link
                href={homeHref}
                aria-label={t("back")}
                className={buttonVariants({
                  variant: "secondary",
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
                      if (!titleCancelled.current)
                        void saveTitle(e.target.value);
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
            <Button
              variant="secondary"
              icon={<HugeiconsDownloadIcon />}
              loading={downloading}
              loadingLabel={t("pdf.preparing")}
              disabled={pending}
              onClick={() => void downloadPdf()}
            >
              {/* Icon only on phones, so the title keeps its room (0043). */}
              <span className="max-sm:sr-only">{t("pdf.download")}</span>
            </Button>
            <Menu
              align="end"
              trigger={
                <IconButton
                  variant="secondary"
                  label={t("more")}
                  icon={<HugeiconsMoreHorizontalIcon />}
                />
              }
              items={moreItems}
            />
          </header>

          <div className="grid flex-1 @4xl:min-h-0 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] @4xl:grid-rows-[minmax(0,1fr)]">
            <div className="min-w-0 @4xl:overflow-y-auto @4xl:overscroll-contain @4xl:border-e @4xl:border-line">
              {formOpen ? <div className="p-4 lg:p-6">{form}</div> : list}
            </div>
            <aside
              aria-label={t("tabs.label")}
              className="hidden @4xl:flex @4xl:flex-col @4xl:overflow-y-auto @4xl:overscroll-contain"
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
            {sheetOpen && !isTwoPanes ? (
              <div className="pb-4">{tabs}</div>
            ) : null}
          </Sheet>

          <Dialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={t("deleteDialog.title")}
            description={t("deleteDialog.body", { title })}
            closeLabel={t("deleteDialog.cancel")}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setDeleteOpen(false)}
                >
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
    </RewriteProvider>
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

const tone = (severity: Severity) =>
  severity === "warning" ? "warning" : "info";

/** Inside the section title's control, so it takes the control's icon size (0029, 0030). */
function FindingMarker({
  label,
  severity,
}: {
  label: string;
  severity: Severity;
}) {
  return (
    <span className="jb-type-icon" title={label}>
      <ToneMark tone={tone(severity)} className="size-full" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Warnings read in ink, tips in muted ink; the icon carries the tone (0042). */
function FindingLine({
  severity,
  children,
}: {
  severity: Severity;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex w-full items-start gap-[0.5em] text-sm",
        severity === "warning" ? "text-ink" : "text-ink-muted",
      )}
    >
      {/* 1.125em icon (0030), centred on the first line. */}
      <span className="flex h-lh shrink-0 items-center">
        <ToneMark tone={tone(severity)} className="size-[1.125em]" />
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
  canRewrite,
  onRewrite,
}: {
  findings: Finding[];
  stepName: (step: EditorStep) => string;
  entryName: (finding: Finding) => string | null;
  message: (finding: Finding) => string;
  onGo: (finding: Finding) => void;
  canRewrite: (finding: Finding) => boolean;
  onRewrite: (finding: Finding) => void;
}) {
  const t = useTranslations("cv.editor.review");
  const r = useTranslations("cv.editor.rewrite");
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
                    <span className="flex items-start gap-[0.5em] text-ink">
                      <span className="flex h-lh shrink-0 items-center">
                        <ToneMark
                          tone={tone(severityOf(finding.code))}
                          className="size-[1.125em]"
                        />
                      </span>
                      <span className="min-w-0">{message(finding)}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canRewrite(finding) ? (
                      <Button
                        variant="quiet"
                        size="sm"
                        icon={<HugeiconsPencilIcon />}
                        onClick={() => onRewrite(finding)}
                      >
                        {r("suggest")}
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onGo(finding)}
                    >
                      {t("goTo")}
                    </Button>
                  </div>
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
