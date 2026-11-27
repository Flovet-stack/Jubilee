import type { AnyEntry } from "./editor";
import { BULLET_MAX, type Finding, SUMMARY_MAX } from "./review";
import type { CvContent } from "./schemas";

/**
 * "Suggest a rewrite" (spec 29, decision 0049): what can be rewritten, how
 * to read and write it, and the new-detail check. Pure, so the editor and
 * tests share it.
 */

export type RewriteTarget =
  { kind: "summary" } | { kind: "bullet"; entryId: string; index: number };

/** Findings that have text of hers to reword (0031 §4). */
export const REWRITE_FINDINGS = [
  "longSummary",
  "bulletsWithoutNumbers",
  "longBullets",
] as const;

export type RewriteFinding = (typeof REWRITE_FINDINGS)[number];

const REWRITE_CODES = new Set<string>(REWRITE_FINDINGS);

/** The field limits from the schema. */
export const FIELD_MAX = { summary: 2000, bullet: 300 } as const;

export const targetKey = (target: RewriteTarget) =>
  target.kind === "summary"
    ? "summary"
    : `bullet:${target.entryId}:${target.index}`;

function findEntry(content: CvContent, entryId: string) {
  for (const section of content.sections) {
    const entry = (section.entries as AnyEntry[]).find((e) => e.id === entryId);
    if (entry) return entry;
  }
  return undefined;
}

/** The text at a target now, or undefined when it's gone. */
export function readTarget(
  content: CvContent,
  target: RewriteTarget,
): string | undefined {
  if (target.kind === "summary") return content.basics.summary;
  const entry = findEntry(content, target.entryId);
  if (!entry || !("highlights" in entry)) return undefined;
  return entry.highlights[target.index];
}

/** The content with the target's text replaced. */
export function writeTarget(
  content: CvContent,
  target: RewriteTarget,
  text: string,
): CvContent {
  if (target.kind === "summary")
    return { ...content, basics: { ...content.basics, summary: text } };
  return {
    ...content,
    sections: content.sections.map((section) => ({
      ...section,
      entries: (section.entries as AnyEntry[]).map((entry) =>
        entry.id === target.entryId && "highlights" in entry
          ? {
              ...entry,
              highlights: entry.highlights.map((h, i) =>
                i === target.index ? text : h,
              ),
            }
          : entry,
      ),
    })),
  } as CvContent;
}

/** A bullet's title and employer, to give the rewrite its context. */
export function entryContext(
  content: CvContent,
  target: RewriteTarget,
): { title?: string; employer?: string } {
  if (target.kind !== "bullet") return {};
  const entry = findEntry(content, target.entryId) as
    Record<string, unknown> | undefined;
  if (!entry) return {};
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = entry[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return undefined;
  };
  const title = pick("position", "title", "name");
  const employer = pick("name", "organization", "institution", "subtitle");
  return { title, employer: employer === title ? undefined : employer };
}

/**
 * The text a finding points at: the summary, or the first bullet the finding
 * is about. Null for findings about something missing.
 */
export function targetFor(
  finding: Finding,
  content: CvContent,
): RewriteTarget | null {
  if (!REWRITE_CODES.has(finding.code)) return null;
  if (finding.code === "longSummary") return { kind: "summary" };
  if (!finding.entryId) return null;
  const entry = findEntry(content, finding.entryId);
  if (!entry || !("highlights" in entry)) return null;
  const index = entry.highlights.findIndex((bullet) => {
    const text = bullet.trim();
    if (!text) return false;
    return finding.code === "longBullets"
      ? text.length > BULLET_MAX
      : !/\d/.test(text);
  });
  return index === -1
    ? null
    : { kind: "bullet", entryId: finding.entryId, index };
}

/** Field limit for the task; the review's limits for a "too long" finding. */
export function maxLengthFor(
  target: RewriteTarget,
  finding?: RewriteFinding,
): number {
  if (finding === "longSummary") return SUMMARY_MAX;
  if (finding === "longBullets") return BULLET_MAX;
  return target.kind === "summary" ? FIELD_MAX.summary : FIELD_MAX.bullet;
}

/* ── New details (0031 §4, 0049) ──────────────────────────────────────── */

/** Every string in the CV, as one lowercase text to search. */
export function cvText(content: CvContent): string {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object")
      Object.values(value).forEach(walk);
  };
  walk(content);
  return out.join("\n").toLowerCase();
}

/** 1,200 · 1 200 · 3.5 · 2019: thousands groups of three, then decimals. */
const NUMBER = /\d+(?:[.,\s\u202f\u00a0]\d{3})*(?:[.,]\d+)?/g;

const digitsOf = (value: string) => value.replace(/\D/g, "");

/** Each number in the CV, separators removed ("1,200" → "1200"). */
function numbersIn(text: string): Set<string> {
  const found = text.match(NUMBER) ?? [];
  return new Set(found.map(digitsOf));
}

const WORD = /[\p{L}\p{N}][\p{L}\p{N}+#.&/'’-]*[\p{L}\p{N}+#]|[\p{L}\p{N}]/gu;

/**
 * Numbers, names and tools in `proposal` that the CV doesn't contain. A
 * word counts when it's capitalised mid-sentence, or has a digit or a
 * symbol (C++, Node.js, A/B). Errs on flagging: Edit is always there.
 */
export function newDetails(proposal: string, content: CvContent): string[] {
  return newDetailsIn(proposal, cvText(content));
}

/** The same check against any source text (the eval uses it). */
export function newDetailsIn(proposal: string, text: string): string[] {
  const source = text.toLowerCase();
  const numbers = numbersIn(source);
  const flagged: string[] = [];
  const add = (detail: string) => {
    if (!flagged.includes(detail)) flagged.push(detail);
  };

  for (const match of proposal.matchAll(NUMBER)) {
    if (!numbers.has(digitsOf(match[0]))) add(match[0]);
  }

  for (const match of proposal.matchAll(WORD)) {
    const raw = match[0].replace(/['’]s$/u, "").replace(/[.,]$/, "");
    const at = match.index ?? 0;
    const before = proposal.slice(0, at).trimEnd();
    const sentenceStart = before === "" || /[.!?:;•\n(«"“-]$/.test(before);
    const hasDigit = /\d/.test(raw);
    if (hasDigit && /^\d[\d.,]*$/.test(raw)) continue; // plain numbers above
    const symbol = /[+#&/]|\.\p{L}/u.test(raw);
    const capital = /^\p{Lu}/u.test(raw) && !sentenceStart;
    const acronym = /^\p{Lu}{2,}$/u.test(raw);
    if (!hasDigit && !symbol && !capital && !acronym) continue;
    const word = raw.toLowerCase();
    // "KPI" against "KPIs", and the other way round.
    const forms = [word, `${word}s`, word.replace(/s$/, "")];
    if (!forms.some((form) => containsWord(source, form))) add(raw);
  }
  return flagged;
}

function containsWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,
    "u",
  ).test(text);
}
