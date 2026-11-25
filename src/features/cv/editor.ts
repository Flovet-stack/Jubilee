import type { CvContent, CvSection, SectionKind } from "./schemas";

/**
 * Pure rules of the CV editor (decision 0024). Unit-tested; the components
 * only call these.
 */

type Entry<K extends SectionKind> = Extract<
  CvSection,
  { kind: K }
>["entries"][number];
export type AnyEntry = CvSection["entries"][number];

/** What the section list shows: Contact and Summary, then the sections. */
export type EditorStep =
  { type: "contact" } | { type: "summary" } | { type: "section"; id: string };

export type StepStatus = "done" | "todo";

/** The first pass on a new CV (0024 §1): contact, experience, education, skills, summary. */
export const FIRST_PASS: readonly (
  "contact" | "work" | "education" | "skills" | "summary"
)[] = ["contact", "work", "education", "skills", "summary"];

const filled = (value: string | undefined) => (value ?? "").trim().length > 0;

/** True when an entry has any text or date in it. */
export function entryHasContent(entry: AnyEntry): boolean {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") return false;
    if (typeof value === "string") return filled(value);
    if (Array.isArray(value))
      return value.some((item) => typeof item === "string" && filled(item));
    return false;
  });
}

/** 0024's "Done" rules. Nothing is ever an error here; errors live at the field. */
export function stepStatus(content: CvContent, step: EditorStep): StepStatus {
  if (step.type === "contact") {
    const { name, email, phone } = content.basics;
    return filled(name) && (filled(email) || filled(phone)) ? "done" : "todo";
  }
  if (step.type === "summary")
    return filled(content.basics.summary) ? "done" : "todo";
  const section = content.sections.find((s) => s.id === step.id);
  if (!section) return "todo";
  return section.entries.some((entry) => entryHasContent(entry))
    ? "done"
    : "todo";
}

/** The steps of the first pass that exist in this CV, in order. */
export function firstPassSteps(content: CvContent): EditorStep[] {
  const steps: EditorStep[] = [];
  for (const name of FIRST_PASS) {
    if (name === "contact") steps.push({ type: "contact" });
    else if (name === "summary") steps.push({ type: "summary" });
    else {
      const section = content.sections.find((s) => s.kind === name);
      if (section) steps.push({ type: "section", id: section.id });
    }
  }
  return steps;
}

/** The step after `step` in the first pass, or null at the end. */
export function nextFirstPassStep(
  content: CvContent,
  step: EditorStep,
): EditorStep | null {
  const steps = firstPassSteps(content);
  const index = steps.findIndex((s) => sameStep(s, step));
  return index >= 0 ? (steps[index + 1] ?? null) : null;
}

export function sameStep(a: EditorStep, b: EditorStep): boolean {
  if (a.type !== b.type) return false;
  return a.type !== "section" || (b.type === "section" && a.id === b.id);
}

/** "Java, SQL; Excel" pasted into the skills field → one skill per item (Teal). */
export function splitSkills(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of text.split(/[,;\n]/)) {
    const skill = part.trim().replace(/\s+/g, " ");
    const key = skill.toLocaleLowerCase();
    if (skill && !seen.has(key)) {
      seen.add(key);
      out.push(skill);
    }
  }
  return out;
}

/** Sort key for "most recent first": current entries first, then by end, then start. */
function recency(entry: AnyEntry): string {
  if ("startDate" in entry) {
    if (!entry.startDate && !entry.endDate) return "";
    if (entry.startDate && !entry.endDate) return `9999-99|${entry.startDate}`;
    return `${entry.endDate ?? entry.startDate ?? ""}|${entry.startDate ?? ""}`;
  }
  if ("date" in entry) return entry.date ?? "";
  return "";
}

/**
 * Where an entry goes so the list stays most recent first (0024 §2). Entries
 * with no dates go to the end, and the user's manual order is otherwise kept:
 * the new entry goes before the first entry that is older than it.
 */
export function insertByDate<T extends AnyEntry>(
  entries: readonly T[],
  entry: T,
): T[] {
  const key = recency(entry);
  if (!key) return [...entries, entry];
  const index = entries.findIndex((other) => {
    const otherKey = recency(other);
    return !otherKey || otherKey < key;
  });
  if (index < 0) return [...entries, entry];
  return [...entries.slice(0, index), entry, ...entries.slice(index)];
}

/** Moves an item one place up (-1) or down (+1). Out of range: unchanged. */
export function move<T>(items: readonly T[], index: number, by: -1 | 1): T[] {
  const target = index + by;
  if (
    index < 0 ||
    index >= items.length ||
    target < 0 ||
    target >= items.length
  )
    return [...items];
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item as T);
  return next;
}

/** An empty entry of a kind, with a fresh id. */
export function emptyEntry<K extends SectionKind>(
  kind: K,
  newId: () => string = () => crypto.randomUUID(),
): Entry<K> {
  const id = newId();
  const empty = {
    work: {
      id,
      position: "",
      name: "",
      location: "",
      url: "",
      summary: "",
      highlights: [],
    },
    education: {
      id,
      institution: "",
      area: "",
      studyType: "",
      location: "",
      url: "",
      score: "",
      courses: [],
    },
    skills: { id, name: "", level: "", keywords: [] },
    languages: { id, language: "", fluency: "" },
    projects: { id, name: "", description: "", url: "", highlights: [] },
    certificates: { id, name: "", issuer: "", url: "" },
    awards: { id, title: "", awarder: "", summary: "" },
    volunteer: {
      id,
      organization: "",
      position: "",
      url: "",
      summary: "",
      highlights: [],
    },
    custom: { id, title: "", subtitle: "", summary: "", highlights: [] },
  } satisfies { [P in SectionKind]: Entry<P> };
  return empty[kind] as Entry<K>;
}

/** An empty section of a kind (title "" uses the default heading). */
export function emptySection(
  kind: SectionKind,
  newId: () => string = () => crypto.randomUUID(),
): CvSection {
  return {
    id: newId(),
    kind,
    title: "",
    hidden: false,
    entries: [],
  } as CvSection;
}

/** The default CV title once a name is known: "Ada Lovelace CV". */
export function defaultTitle(name: string, word: string): string {
  const trimmed = name.trim();
  return trimmed ? `${trimmed} ${word}` : word;
}

/** The automatic CV name (0031 §1): "{headline} · {name}", else the name, else the word. */
export function cvName(
  basics: { headline: string; name: string },
  word: string,
): string {
  return (
    [basics.headline.trim(), basics.name.trim()].filter(Boolean).join(" · ") ||
    word
  );
}

/**
 * True while the title is still an automatic one for these basics, so it
 * should follow the content. Spec 14's "{name} Resume" counts as automatic.
 */
export function followsContent(
  title: string,
  basics: { headline: string; name: string },
  word: string,
): boolean {
  return (
    title === word ||
    title === cvName(basics, word) ||
    title === defaultTitle(basics.name, word)
  );
}

type Path = (string | number)[];

function valueAt(root: unknown, path: Path): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

function setAt(root: unknown, path: Path, value: unknown): void {
  const parent = valueAt(root, path.slice(0, -1));
  const key = path[path.length - 1];
  if (parent === null || typeof parent !== "object" || key === undefined)
    return;
  const record = parent as Record<string | number, unknown>;
  if (value === undefined) delete record[key];
  else record[key] = value;
}

/**
 * The same place in another copy of the document, found by section and entry
 * ids rather than positions, since sections and entries can move.
 */
function samePlace(
  draft: CvContent,
  other: CvContent,
  path: Path,
): Path | null {
  if (path[0] !== "sections" || typeof path[1] !== "number") return path;
  const section = draft.sections[path[1]];
  const otherIndex = other.sections.findIndex((s) => s.id === section?.id);
  if (otherIndex < 0) return null;
  if (path[2] !== "entries" || typeof path[3] !== "number")
    return ["sections", otherIndex, ...path.slice(2)];
  const entry = section?.entries[path[3]];
  const otherSection = other.sections[otherIndex];
  const entryIndex =
    otherSection?.entries.findIndex((e) => e.id === entry?.id) ?? -1;
  if (entryIndex < 0) return null;
  return ["sections", otherIndex, "entries", entryIndex, ...path.slice(4)];
}

/** Optional dates are removed rather than emptied ("" isn't a date). */
const isDateKey = (path: Path) =>
  /^(startDate|endDate|date)$/.test(String(path.at(-1)));

type Validate = (
  raw: unknown,
) => { ok: true; value: CvContent } | { ok: false; paths: Path[] };

/**
 * 0024 §4: only valid content is saved. Each field with an error keeps its
 * last saved value (or is emptied if it has none yet), so the database row
 * always passes the schema. Returns what to save and how many fields were
 * held back; null if it still can't be made valid.
 */
export function savableContent(
  draft: CvContent,
  lastSaved: CvContent,
  validate: Validate,
): { content: CvContent; heldBack: number } | null {
  const first = validate(draft);
  if (first.ok) return { content: first.value, heldBack: 0 };

  const repaired = structuredClone(draft);
  const held = new Set<string>();
  let result: ReturnType<Validate> = first;
  for (let round = 0; round < 3 && !result.ok; round++) {
    for (const path of result.paths) {
      const place = samePlace(repaired, lastSaved, path);
      const previous = place ? valueAt(lastSaved, place) : undefined;
      const current = valueAt(repaired, path);
      held.add(JSON.stringify(path));
      if (previous !== undefined)
        setAt(repaired, path, structuredClone(previous));
      else if (typeof current === "string" && !isDateKey(path))
        setAt(repaired, path, "");
      else setAt(repaired, path, undefined);
    }
    result = validate(repaired);
  }
  return result.ok ? { content: result.value, heldBack: held.size } : null;
}
