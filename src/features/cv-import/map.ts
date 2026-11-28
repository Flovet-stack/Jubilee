import type { TaskOutput } from "@/lib/ai";

import { partialDate, type CvContent, type CvLanguage } from "../cv/schemas";

/**
 * Turns the `cv.import` result into CV content (spec 31): adds ids, keeps
 * only well-formed dates, drops empty entries, and marks every filled
 * section "Imported: check it" (0050). Contact details never went to the
 * model; they're read here from the original text (0052).
 */

export type ImportResult = TaskOutput<"cv.import">;

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/u;
const PHONE =
  /(?<![\p{L}\p{N}])(?:\+|00)?\(?\d[\d\s().-]{6,}\d(?![\p{L}\p{N}])/gu;
const LINKEDIN =
  /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[\p{L}\p{N}_%-]+\/?/iu;

export type Contact = { email: string; phone: string; linkedin: string };

export function findContact(text: string): Contact {
  const email = text.match(EMAIL)?.[0] ?? "";
  const phone =
    [...text.matchAll(PHONE)]
      .map((m) => m[0].trim())
      .find((m) => m.replace(/\D/g, "").length >= 9 && m.length <= 40) ?? "";
  const found = text.match(LINKEDIN)?.[0] ?? "";
  const linkedin = found
    ? `https://${found.replace(/^https?:\/\//i, "").replace(/\/$/, "")}`
    : "";
  return { email: email.length <= 254 ? email : "", phone, linkedin };
}

const str = (value: string | null | undefined) => (value ?? "").trim();

/** `YYYY` or `YYYY-MM`, or nothing: a date the model got wrong is dropped. */
function date(value: string | null): string | undefined {
  const v = str(value);
  return partialDate.safeParse(v).success ? v : undefined;
}

/** Drops an end before its start (the schema would refuse the whole CV). */
function dates(start: string | null, end: string | null) {
  const startDate = date(start);
  let endDate = date(end);
  if (startDate && endDate) {
    const n = Math.min(startDate.length, endDate.length);
    if (endDate.slice(0, n) < startDate.slice(0, n)) endDate = undefined;
  }
  return { startDate, endDate };
}

const lines = (items: string[]) =>
  items
    .map((i) => i.trim())
    .filter(Boolean)
    .slice(0, 20);

const COUNTRY = /^[A-Z]{2}$/;

export function toCvContent(
  result: ImportResult,
  contact: Contact,
  newId: () => string = () => crypto.randomUUID(),
): { content: CvContent; language: CvLanguage | null } {
  const b = result.basics;
  const country = str(b.countryCode).toUpperCase();

  const work = result.work
    .map((w) => ({
      id: newId(),
      position: str(w.position),
      name: str(w.company),
      location: str(w.location),
      url: "",
      ...dates(w.startDate, w.endDate),
      summary: str(w.summary),
      highlights: lines(w.highlights),
    }))
    .filter((w) => w.position || w.name);

  const education = result.education
    .map((e) => ({
      id: newId(),
      institution: str(e.institution),
      area: str(e.area),
      studyType: str(e.degree),
      location: str(e.location),
      url: "",
      ...dates(e.startDate, e.endDate),
      score: "",
      courses: [],
    }))
    .filter((e) => e.institution || e.studyType);

  const keywords = [...new Set(lines(result.skills.slice(0, 30)))];
  const skills = keywords.length
    ? [{ id: newId(), name: "", level: "", keywords }]
    : [];

  const languages = result.languages
    .map((l) => ({
      id: newId(),
      language: str(l.language),
      fluency: str(l.fluency),
    }))
    .filter((l) => l.language);

  const certificates = result.certificates
    .map((c) => ({
      id: newId(),
      name: str(c.name),
      issuer: str(c.issuer),
      date: date(c.date),
      url: "",
    }))
    .filter((c) => c.name);

  const projects = result.projects
    .map((p) => ({
      id: newId(),
      name: str(p.name),
      description: str(p.description),
      url: "",
      ...dates(p.startDate, p.endDate),
      highlights: lines(p.highlights),
    }))
    .filter((p) => p.name);

  const volunteer = result.volunteer
    .map((v) => ({
      id: newId(),
      organization: str(v.organization),
      position: str(v.position),
      url: "",
      ...dates(v.startDate, v.endDate),
      summary: str(v.summary),
      highlights: [],
    }))
    .filter((v) => v.organization || v.position);

  const section = <K extends CvContent["sections"][number]["kind"]>(
    kind: K,
    entries: unknown[],
  ) =>
    ({
      id: newId(),
      kind,
      title: "",
      hidden: false,
      entries,
    }) as CvContent["sections"][number];

  // Work, education and skills always exist (as a blank CV); the others
  // only when the import found something.
  const sections = [
    section("work", work),
    section("education", education),
    section("skills", skills),
    ...(languages.length ? [section("languages", languages)] : []),
    ...(certificates.length ? [section("certificates", certificates)] : []),
    ...(projects.length ? [section("projects", projects)] : []),
    ...(volunteer.length ? [section("volunteer", volunteer)] : []),
  ];

  const hasBasics = Boolean(str(b.name) || str(b.headline) || str(b.summary));
  const imported = [
    ...(hasBasics ? ["basics"] : []),
    ...sections.filter((s) => s.entries.length > 0).map((s) => s.id),
  ];

  const unread = result.unread.map((u) => u.trim()).filter(Boolean);

  return {
    language: result.language,
    content: {
      basics: {
        name: str(b.name),
        headline: str(b.headline),
        email: contact.email,
        phone: contact.phone,
        location: {
          city: str(b.city),
          region: str(b.region),
          countryCode: COUNTRY.test(country) ? country : "",
        },
        summary: str(b.summary),
        links: contact.linkedin
          ? [{ id: newId(), label: "LinkedIn", url: contact.linkedin }]
          : [],
      },
      sections,
      imported,
      ...(unread.length ? { importUnread: unread } : {}),
    },
  };
}

/** Nothing usable: no name, no entries. The import failed, not a blank CV. */
export function isEmptyImport(content: CvContent): boolean {
  return (
    !content.basics.name &&
    content.sections.every((s) => s.entries.length === 0)
  );
}
