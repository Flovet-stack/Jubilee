"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  useActionState,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { LinkedInLogo } from "@/components/brand/logos";
import {
  HugeiconsBriefcaseBusinessIcon,
  HugeiconsFileTextIcon,
  HugeiconsPlusIcon,
  HugeiconsUploadIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, Sheet } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/field";
import { FileField } from "@/components/ui/file-field";
import { Tabs } from "@/components/ui/tabs";
import {
  createCvAction,
  type CreateCvState,
} from "@/features/cv/editor-actions";
import type { CvLanguage, CvMarket } from "@/features/cv/schemas";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

import {
  importCvAction,
  type ImportFailure,
  type ImportState,
} from "../actions";

/**
 * The start cards at the top of the Resumes page (0050, spec 31): Blank,
 * For a job (disabled until its own decision and spec), Import from
 * LinkedIn and Upload a CV. Blank creates at once; the two imports open a
 * dialog (a sheet on phones) whose one primary button reads the input and
 * opens the new CV.
 */

const BLANK_FORM = "start-blank";
const MAX_PASTE = 30_000;

type Source = "linkedin" | "upload";

export function StartCards({
  locale,
  language,
  market,
}: {
  locale: Locale;
  language: CvLanguage;
  market: CvMarket;
}) {
  const t = useTranslations("cv.start");
  const create = useTranslations("cv.create");
  const [open, setOpen] = useState<Source | null>(null);
  const [blank, blankAction, blankPending] = useActionState<
    CreateCvState,
    FormData
  >(createCvAction, { error: null });

  return (
    <section aria-label={t("label")} className="flex flex-col gap-3">
      {/* Blank: one click (0050). Also "Start blank instead" in the dialogs. */}
      <form id={BLANK_FORM} action={blankAction} className="hidden">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="title" value={create("titleWord")} />
        <input type="hidden" name="language" value={language} />
        <input type="hidden" name="market" value={market} />
      </form>
      {blank.error ? <Alert tone="danger" title={create("error")} /> : null}
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li>
          <StartCard
            primary
            form={BLANK_FORM}
            type="submit"
            busy={blankPending}
            icon={<HugeiconsPlusIcon />}
            title={t("blank.title")}
            line={t("blank.line")}
          />
        </li>
        <li>
          {/* TODO(spec: for-a-job): enable once the tailoring decision
              (0049 place 3: Job tab, match score, versions) and its spec
              land. Must ship enabled before launch (Flovet, 2026-11-28). */}
          <StartCard
            disabled
            icon={<HugeiconsBriefcaseBusinessIcon />}
            title={t("job.title")}
            line={t("job.soon")}
          />
        </li>
        <li>
          <StartCard
            icon={<LinkedInLogo />}
            title={t("linkedin.title")}
            line={t("linkedin.line")}
            onClick={() => setOpen("linkedin")}
          />
        </li>
        <li>
          <StartCard
            icon={<HugeiconsUploadIcon />}
            title={t("upload.title")}
            line={t("upload.line")}
            onClick={() => setOpen("upload")}
          />
        </li>
      </ul>
      {open ? (
        <ImportDialog
          key={open}
          source={open}
          locale={locale}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </section>
  );
}

function StartCard({
  icon,
  title,
  line,
  primary,
  disabled,
  busy,
  onClick,
  form,
  type = "button",
}: {
  icon: ReactNode;
  title: string;
  line: string;
  primary?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onClick?: () => void;
  form?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled || busy}
      aria-disabled={disabled || undefined}
      aria-busy={busy || undefined}
      className={cn(
        "flex h-full w-full flex-col items-start gap-2 rounded-card p-4 text-start",
        "transition-[background-color,scale] duration-(--dur-fast) ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet",
        "not-disabled:active:scale-(--press-scale)",
        primary
          ? "bg-violet text-on-violet shadow-primary hover-fine:not-disabled:bg-[color-mix(in_oklab,var(--violet)_88%,var(--ink))]"
          : "bg-control text-ink shadow-raised hover-fine:not-disabled:bg-control-hover",
        disabled &&
          "cursor-not-allowed bg-well text-ink-subtle shadow-[inset_0_0_0_1px_var(--line)]",
        busy && "cursor-progress",
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-6 items-center [&_svg]:size-6"
      >
        {icon}
      </span>
      <span className="font-semibold">{title}</span>
      <span
        className={cn(
          "text-sm",
          primary ? "text-on-violet/85" : disabled ? "" : "text-ink-muted",
        )}
      >
        {line}
      </span>
    </button>
  );
}

/** Phones and touch get the sheet and the paste tab first (0050, 0052). */
function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function ImportDialog({
  source,
  locale,
  onClose,
}: {
  source: Source;
  locale: Locale;
  onClose: () => void;
}) {
  const t = useTranslations("cv.import");
  const ai = useTranslations("ai.errors");
  const format = useFormatter();
  const phone = useMedia("(max-width: 639px)");
  const [mode, setMode] = useState<"pdf" | "paste">(() =>
    source === "linkedin" &&
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse), (max-width: 639px)").matches
      ? "paste"
      : "pdf",
  );
  const [state, action, pending] = useActionState<ImportState, FormData>(
    importCvAction,
    { error: null },
  );
  const formId = `import-${source}`;
  const copy = source === "linkedin" ? "linkedin" : "upload";

  const message = (reason: ImportFailure) =>
    reason === "limit" || reason === "unavailable" || reason === "failed"
      ? ai(reason)
      : t(`errors.${reason}`);
  const fileError =
    state.error === "too_large" || state.error === "not_pdf"
      ? message(state.error)
      : null;

  const file = (
    <FileField
      name="file"
      label={t("file.label")}
      hint={t("file.hint")}
      chooseLabel={t("file.choose")}
      dropLabel={t("file.drop")}
      removeLabel={t("file.remove")}
      accept="application/pdf,.pdf"
      required
      readOnly={pending}
      error={fileError}
      formatSize={(bytes) =>
        bytes < 1_000_000
          ? format.number(Math.max(1, Math.round(bytes / 1000)), {
              style: "unit",
              unit: "kilobyte",
            })
          : format.number(bytes / 1_000_000, {
              style: "unit",
              unit: "megabyte",
              maximumFractionDigits: 1,
            })
      }
    />
  );

  const paste = (
    <Field
      label={t("linkedin.pasteLabel")}
      error={state.error === "too_long" ? message("too_long") : null}
    >
      <Textarea
        name="text"
        required
        maxLength={MAX_PASTE}
        readOnly={pending}
        className="min-h-40"
      />
    </Field>
  );

  const body = (
    <form id={formId} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      <input
        type="hidden"
        name="mode"
        value={source === "upload" ? "pdf" : mode}
      />
      {source === "linkedin" ? (
        <Tabs
          label={t("linkedin.tabs.label")}
          value={mode}
          onValueChange={(value) =>
            setMode(value === "paste" ? "paste" : "pdf")
          }
          items={[
            {
              value: "pdf",
              label: t("linkedin.tabs.pdf"),
              panel: (
                <div className="flex flex-col gap-3 pt-4">
                  <p className="text-sm text-ink-muted">
                    {t("linkedin.pdfHelp")}
                  </p>
                  {mode === "pdf" ? file : null}
                </div>
              ),
            },
            {
              value: "paste",
              label: t("linkedin.tabs.paste"),
              panel: (
                <div className="flex flex-col gap-3 pt-4">
                  <p className="text-sm text-ink-muted">
                    {t("linkedin.pasteHelp")}
                  </p>
                  {mode === "paste" ? paste : null}
                </div>
              ),
            },
          ]}
        />
      ) : (
        file
      )}
      <p className="text-sm text-ink-muted">
        {source === "linkedin" ? t("linkedin.own") : t("upload.own")}
      </p>
      {state.error && !fileError && state.error !== "too_long" ? (
        <Alert
          tone="danger"
          title={message(state.error)}
          action={
            <Button
              type="submit"
              form={BLANK_FORM}
              variant="quiet"
              size="sm"
              disabled={pending}
            >
              {t("startBlank")}
            </Button>
          }
        />
      ) : null}
      <p aria-live="polite" className="text-sm text-ink-muted">
        {pending ? t("pending") : ""}
      </p>
    </form>
  );

  const footer = (
    <Button
      type="submit"
      form={formId}
      variant="primary"
      loading={pending}
      icon={source === "upload" ? <HugeiconsFileTextIcon /> : undefined}
    >
      {t(`${copy}.submit`)}
    </Button>
  );

  const props = {
    open: true,
    // No closing while it reads: the CV would open behind her back.
    onOpenChange: (next: boolean) => {
      if (!next && !pending) onClose();
    },
    title: t(`${copy}.title`),
    closeLabel: t("close"),
    footer,
    children: body,
  };
  return phone ? <Sheet {...props} side="bottom" /> : <Dialog {...props} />;
}
