import { type AnyEntry, type EditorStep, entryHasContent } from "./editor";
import type { CvContent } from "./schemas";

/**
 * Review without AI (decision 0031 §3, phase 1): plain checks on the CV
 * that say what's lacking and where. Pure, so they run on every change and
 * nothing leaves the browser. Findings are advice, never errors.
 */

export type FindingCode =
  | "contactReach"
  | "noHeadline"
  | "noSummary"
  | "longSummary"
  | "noBullets"
  | "bulletsWithoutNumbers"
  | "longBullets"
  | "noDates";

export type Finding = {
  /** Stable for React keys: code plus where. */
  key: string;
  code: FindingCode;
  step: EditorStep;
  /** The entry it's about, for list sections. */
  entryId?: string;
  /** How many bullets, for the bullet checks. */
  count?: number;
};

export type Severity = "warning" | "tip";

/**
 * Warnings are what a recruiter needs or expects; tips are polish (0042).
 * Never red: findings are advice, not errors (0024, 0031).
 */
const SEVERITY: Record<FindingCode, Severity> = {
  contactReach: "warning",
  noHeadline: "warning",
  noSummary: "warning",
  noBullets: "warning",
  noDates: "warning",
  longSummary: "tip",
  bulletsWithoutNumbers: "tip",
  longBullets: "tip",
};

export const severityOf = (code: FindingCode): Severity => SEVERITY[code];

/** The strongest tone among some findings, or null when there are none. */
export function strongest(findings: Finding[]): Severity | null {
  if (findings.length === 0) return null;
  return findings.some((f) => severityOf(f.code) === "warning")
    ? "warning"
    : "tip";
}

/** About 4–5 lines on the page. */
export const SUMMARY_MAX = 600;
/** About two lines on the page (0024 §2 aims for one or two). */
export const BULLET_MAX = 200;

const filled = (value: string | undefined) => (value ?? "").trim().length > 0;
const hasNumber = (text: string) => /\d/.test(text);

/** Kinds whose entries are jobs: they need bullets and dates. */
const JOB_KINDS = new Set(["work", "volunteer"]);

export function reviewCv(content: CvContent): Finding[] {
  const findings: Finding[] = [];
  const { basics } = content;

  const contact: EditorStep = { type: "contact" };
  if (!filled(basics.email) && !filled(basics.phone))
    findings.push({ key: "contactReach", code: "contactReach", step: contact });
  if (!filled(basics.headline))
    findings.push({ key: "noHeadline", code: "noHeadline", step: contact });

  const summary: EditorStep = { type: "summary" };
  if (!filled(basics.summary))
    findings.push({ key: "noSummary", code: "noSummary", step: summary });
  else if (basics.summary.trim().length > SUMMARY_MAX)
    findings.push({ key: "longSummary", code: "longSummary", step: summary });

  for (const section of content.sections) {
    if (section.hidden) continue;
    const step: EditorStep = { type: "section", id: section.id };
    for (const entry of section.entries as AnyEntry[]) {
      if (entry.hidden || !entryHasContent(entry)) continue;
      const at = (code: FindingCode, count?: number): Finding => ({
        key: `${code}:${entry.id}`,
        code,
        step,
        entryId: entry.id,
        ...(count === undefined ? {} : { count }),
      });

      if (
        JOB_KINDS.has(section.kind) &&
        "startDate" in entry &&
        !entry.startDate
      )
        findings.push(at("noDates"));

      if (!("highlights" in entry)) continue;
      const bullets = entry.highlights.filter(filled);
      if (bullets.length === 0) {
        if (JOB_KINDS.has(section.kind)) findings.push(at("noBullets"));
        continue;
      }
      const withoutNumbers = bullets.filter((b) => !hasNumber(b)).length;
      if (withoutNumbers > 0)
        findings.push(at("bulletsWithoutNumbers", withoutNumbers));
      const long = bullets.filter((b) => b.trim().length > BULLET_MAX).length;
      if (long > 0) findings.push(at("longBullets", long));
    }
  }
  return findings;
}
