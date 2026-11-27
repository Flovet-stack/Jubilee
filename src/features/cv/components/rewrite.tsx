"use client";

import { useTranslations } from "next-intl";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { HugeiconsPencilIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ToneMark } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { BULLET_MAX, SUMMARY_MAX } from "../review";
import {
  entryContext,
  maxLengthFor,
  newDetails,
  readTarget,
  type RewriteFinding,
  type RewriteTarget,
  targetKey,
  writeTarget,
} from "../rewrite";
import {
  recordRewriteAction,
  type RewriteFailure,
  suggestRewriteAction,
} from "../rewrite-actions";
import type { CvContent, CvLanguage } from "../schemas";
import { ProposalCard } from "./proposal-card";

/**
 * "Suggest a rewrite" in the editor (spec 29, decisions 0049 and 0031 §4).
 * The editor holds proposals in memory only: closing the form, leaving the
 * page or changing the text drops them. Nothing is written until Accept or
 * Edit. Accept records an "ai" revision (0016); Edit does too, once every
 * new detail is out of the text or she confirms it by leaving it in.
 */

type Proposal =
  | { status: "loading"; original: string; token: number }
  | {
      status: "ready";
      original: string;
      text: string;
      reason: string;
      details: string[];
    }
  | { status: "same"; original: string }
  | { status: "error"; original: string; reason: RewriteFailure }
  /** After Edit with new details: the warning stays under her field. */
  | { status: "check"; details: string[]; note: string };

export type RewriteApi = {
  get: (target: RewriteTarget) => Proposal | undefined;
  request: (target: RewriteTarget, finding?: RewriteFinding) => void;
  accept: (target: RewriteTarget) => void;
  edit: (target: RewriteTarget) => void;
  dismiss: (target: RewriteTarget) => void;
  /** Ends the check after Edit and records the revision. */
  resolve: (target: RewriteTarget) => void;
  clear: () => void;
};

const RewriteContext = createContext<RewriteApi | null>(null);

/** The finding a field's own text would raise, to aim the rewrite. */
function findingFor(
  target: RewriteTarget,
  text: string,
): RewriteFinding | undefined {
  const trimmed = text.trim();
  if (target.kind === "summary")
    return trimmed.length > SUMMARY_MAX ? "longSummary" : undefined;
  if (trimmed.length > BULLET_MAX) return "longBullets";
  return /\d/.test(trimmed) ? undefined : "bulletsWithoutNumbers";
}

/** New details still in her text (case-insensitive). */
const remaining = (details: string[], text: string) =>
  details.filter((d) => text.toLowerCase().includes(d.toLowerCase()));

/** The editor's rewrite state; pass it to RewriteProvider. */
export function useRewriteApi({
  cvId,
  language,
  content,
  update,
  saveAll,
}: {
  cvId: string;
  language: CvLanguage;
  content: CvContent;
  update: (recipe: (current: CvContent) => CvContent) => void;
  /** Saves now; true when every edit is saved. */
  saveAll: () => Promise<boolean>;
}): RewriteApi {
  const t = useTranslations("cv.editor.rewrite");
  const toast = useToast();
  const [proposals, setProposals] = useState<Record<string, Proposal>>({});
  const contentRef = useRef(content);
  const proposalsRef = useRef(proposals);
  const nextToken = useRef(0);
  useEffect(() => {
    contentRef.current = content;
    proposalsRef.current = proposals;
  });

  const drop = useCallback((key: string) => {
    setProposals((all) => {
      if (!(key in all)) return all;
      const next = { ...all };
      delete next[key];
      return next;
    });
  }, []);

  /** Saved first, so the revision holds the new text; skipped if not (0016). */
  const record = useCallback(
    (note: string) =>
      void saveAll().then((saved) =>
        saved ? recordRewriteAction(cvId, note.slice(0, 200)) : undefined,
      ),
    [cvId, saveAll],
  );

  const request = useCallback(
    (target: RewriteTarget, finding?: RewriteFinding) => {
      const key = targetKey(target);
      if (proposalsRef.current[key]?.status === "loading") return;
      const original = readTarget(contentRef.current, target);
      if (!original?.trim()) return;
      const token = ++nextToken.current;
      setProposals((all) => ({
        ...all,
        [key]: { status: "loading", original, token },
      }));
      const aim = finding ?? findingFor(target, original);
      void suggestRewriteAction({
        kind: target.kind,
        text: original,
        language,
        ...entryContext(contentRef.current, target),
        ...(aim ? { finding: aim } : {}),
        maxLength: maxLengthFor(target, aim),
      })
        .catch((): { ok: false; reason: RewriteFailure } => ({
          ok: false,
          reason: "failed",
        }))
        .then((result) => {
          setProposals((all) => {
            const waiting = all[key];
            // Cleared, or asked again since: this answer is stale.
            if (waiting?.status !== "loading" || waiting.token !== token)
              return all;
            const next = { ...all };
            // Her text changed while it was loading: drop the card.
            if (readTarget(contentRef.current, target) !== original) {
              delete next[key];
              return next;
            }
            if (!result.ok)
              next[key] = { status: "error", original, reason: result.reason };
            else if (result.text.trim() === original.trim())
              next[key] = { status: "same", original };
            else
              next[key] = {
                status: "ready",
                original,
                text: result.text,
                reason: result.reason,
                details: newDetails(result.text, contentRef.current),
              };
            return next;
          });
        });
    },
    [language],
  );

  const noteFor = useCallback(
    (target: RewriteTarget) => {
      if (target.kind === "summary") return t("noteSummary");
      const where = entryContext(contentRef.current, target);
      return t("noteBullet", {
        entry:
          [where.title, where.employer].filter(Boolean).join(" · ") ||
          t("noteEntry"),
      });
    },
    [t],
  );

  const apply = useCallback(
    (target: RewriteTarget, mode: "accept" | "edit") => {
      const key = targetKey(target);
      const proposal = proposalsRef.current[key];
      if (proposal?.status !== "ready") return;
      if (readTarget(contentRef.current, target) !== proposal.original) {
        drop(key);
        return;
      }
      const { original, text, details } = proposal;
      update((c) => writeTarget(c, target, text));
      const note = noteFor(target);
      if (mode === "edit" && details.length > 0) {
        // She must still check them (0031 §4): keep the warning.
        setProposals((all) => ({
          ...all,
          [key]: { status: "check", details, note },
        }));
        return;
      }
      drop(key);
      record(note);
      if (mode === "accept")
        toast({
          title: t("accepted"),
          closeLabel: t("dismiss"),
          action: {
            label: t("undo"),
            onClick: () =>
              update((c) =>
                readTarget(c, target) === text
                  ? writeTarget(c, target, original)
                  : c,
              ),
          },
        });
    },
    [drop, noteFor, record, t, toast, update],
  );

  return useMemo<RewriteApi>(
    () => ({
      get: (target) => proposals[targetKey(target)],
      request,
      accept: (target) => {
        const proposal = proposalsRef.current[targetKey(target)];
        if (proposal?.status === "ready" && proposal.details.length === 0)
          apply(target, "accept");
      },
      edit: (target) => apply(target, "edit"),
      dismiss: (target) => drop(targetKey(target)),
      resolve: (target) => {
        const key = targetKey(target);
        const proposal = proposalsRef.current[key];
        if (proposal?.status !== "check") return;
        drop(key);
        record(proposal.note);
      },
      clear: () => {
        // A check left open still records what she kept.
        for (const proposal of Object.values(proposalsRef.current))
          if (proposal.status === "check") record(proposal.note);
        setProposals({});
      },
    }),
    [apply, drop, proposals, record, request],
  );
}

export function RewriteProvider({
  value,
  children,
}: {
  value: RewriteApi;
  children: ReactNode;
}) {
  return (
    <RewriteContext.Provider value={value}>{children}</RewriteContext.Provider>
  );
}

export function useRewrite() {
  return useContext(RewriteContext);
}

/**
 * Under a summary or bullet field: the button and a "Writing a suggestion…"
 * line, then the proposal card or a message, and after Edit the new-detail
 * warning until she has checked them. Focus moves to the card and back.
 */
export function RewriteSlot({
  target,
  text,
}: {
  target: RewriteTarget;
  /** The field's current text. */
  text: string;
}) {
  const api = useRewrite();
  const t = useTranslations("cv.editor.rewrite");
  const errors = useTranslations("ai.errors");
  const actionErrors = useTranslations("cv.editor.actionErrors");
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const proposal = api?.get(target);
  const check = proposal?.status === "check" ? proposal : undefined;
  // A card for text she has since changed is stale: show the button instead.
  const live =
    proposal && proposal.status !== "check" && proposal.original === text
      ? proposal
      : undefined;
  const status = live?.status;
  const shown = status === "ready" || status === "same" || status === "error";
  const unchecked = check ? remaining(check.details, text) : [];

  // Every new detail edited out: the check is done.
  const checkDone = Boolean(check) && unchecked.length === 0;
  useEffect(() => {
    if (checkDone) api?.resolve(target);
  }, [api, checkDone, target]);

  const wasShown = useRef(false);
  /** After Edit, focus goes to her field instead of back to the button. */
  const toField = useRef(false);
  useEffect(() => {
    if (shown && !wasShown.current) card.current?.focus();
    if (!shown && wasShown.current && status !== "loading") {
      const field = toField.current;
      toField.current = false;
      requestAnimationFrame(() =>
        field
          ? root.current?.parentElement
              ?.querySelector<HTMLTextAreaElement>("textarea")
              ?.focus()
          : button.current?.focus(),
      );
    }
    wasShown.current = shown;
  }, [shown, status]);

  if (!api || !text.trim()) return null;

  const failure = (reason: RewriteFailure) =>
    reason === "signedOut" ? actionErrors("signedOut") : errors(reason);

  return (
    <div ref={root} className="flex flex-col gap-2">
      {check && unchecked.length > 0 ? (
        <p className="flex items-start gap-[0.5em] text-sm text-ink">
          <span className="flex h-lh shrink-0 items-center">
            <ToneMark tone="warning" className="size-[1.125em]" />
          </span>
          <span className="min-w-0">
            {t("checkDetails", { list: unchecked.join(", ") })}
          </span>
        </p>
      ) : live?.status === "ready" ? (
        <ProposalCard
          ref={card}
          original={live.original}
          proposed={live.text}
          reason={live.reason}
          details={live.details}
          labels={{
            title: t("cardTitle"),
            was: t("was"),
            now: t("now"),
            accept: t("accept"),
            edit: t("edit"),
            reject: t("reject"),
            newDetails: (list) => t("newDetails", { list }),
          }}
          onAccept={() => api.accept(target)}
          onEdit={() => {
            toField.current = true;
            api.edit(target);
          }}
          onReject={() => api.dismiss(target)}
        />
      ) : live?.status === "same" || live?.status === "error" ? (
        <div
          ref={card}
          tabIndex={-1}
          role="group"
          aria-label={live.status === "same" ? t("cardTitle") : t("errorTitle")}
          className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-well p-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] focus-visible:[outline:var(--focus-ring)] focus-visible:outline-offset-2"
        >
          <span className="min-w-0 flex-1 basis-48">
            {live.status === "same" ? t("same") : failure(live.reason)}
          </span>
          <Button variant="quiet" size="sm" onClick={() => api.dismiss(target)}>
            {t("dismiss")}
          </Button>
        </div>
      ) : (
        <Button
          ref={button}
          variant="quiet"
          size="sm"
          className="self-start"
          icon={<HugeiconsPencilIcon />}
          loading={status === "loading"}
          onClick={() => api.request(target)}
        >
          {t("suggest")}
        </Button>
      )}
      {/* One live region: visible while it writes, read-only after. */}
      <p
        role="status"
        className={cn(
          status === "loading" ? "text-sm text-ink-muted" : "sr-only",
        )}
      >
        {status === "loading"
          ? t("loading")
          : status === "ready" || status === "same"
            ? t("ready")
            : unchecked.length > 0
              ? t("checkDetails", { list: unchecked.join(", ") })
              : ""}
      </p>
    </div>
  );
}
