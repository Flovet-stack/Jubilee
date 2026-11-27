import { z } from "zod";

/**
 * The CV content document (decision 0016): `basics`, then ordered sections
 * of entries. Field names follow JSON Resume where it has one, so an export
 * to JSON Resume (#36) is a rename-free mapping. Every write passes this
 * schema first; the database only caps the size.
 */

/** Bump with a migration in `migrateContent` (logic.ts) when the shape changes. */
export const CV_SCHEMA_VERSION = 1;

export const CV_LANGUAGES = ["en", "fr"] as const;
export const CV_MARKETS = ["FR", "US"] as const;
export const SECTION_KINDS = [
  "work",
  "education",
  "skills",
  "languages",
  "projects",
  "certificates",
  "awards",
  "volunteer",
  "custom",
] as const;

const id = z.uuid();
const text = (max: number) => z.string().trim().max(max);
const list = (max: number, item: z.ZodType<string>) => z.array(item).max(max);

/** `YYYY` or `YYYY-MM`. Shown per market by the renderer (#13). */
export const partialDate = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "Use YYYY or YYYY-MM");

/** "" or an absolute http(s) URL. */
const url = z.union([z.literal(""), z.url({ protocol: /^https?$/ }).max(2048)]);

const dates = {
  startDate: partialDate.optional(),
  /** Missing means "current". */
  endDate: partialDate.optional(),
};

const highlights = list(20, text(300));

/**
 * Partial ISO dates compared at the precision both share, so "1843" ends
 * no earlier than "1843-05" (same year), but "1842" does.
 */
function endsBeforeStart(start: string, end: string): boolean {
  const length = Math.min(start.length, end.length);
  return end.slice(0, length) < start.slice(0, length);
}

const link = z.object({ id, label: text(60), url });

const basics = z.object({
  name: text(120),
  headline: text(160),
  email: z.union([z.literal(""), z.email().max(254)]),
  phone: text(40),
  location: z.object({
    city: text(100),
    region: text(100),
    /** ISO 3166-1 alpha-2, or "". */
    countryCode: z.union([z.literal(""), z.string().regex(/^[A-Z]{2}$/)]),
  }),
  summary: text(2000),
  links: z.array(link).max(10),
});

/** Hidden entries stay in the editor but leave the CV, PDF and review (0039). Optional: older content has none. */
const hidden = z.boolean().optional();

const entries = {
  work: z.object({
    id,
    hidden,
    position: text(120),
    name: text(120),
    location: text(120),
    url,
    ...dates,
    summary: text(2000),
    highlights,
  }),
  education: z.object({
    id,
    hidden,
    institution: text(160),
    area: text(120),
    studyType: text(120),
    location: text(120),
    url,
    ...dates,
    score: text(40),
    courses: list(30, text(120)),
  }),
  skills: z.object({
    id,
    hidden,
    name: text(80),
    level: text(60),
    keywords: list(30, text(60)),
  }),
  languages: z.object({ id, hidden, language: text(60), fluency: text(60) }),
  projects: z.object({
    id,
    hidden,
    name: text(120),
    description: text(2000),
    url,
    ...dates,
    highlights,
  }),
  certificates: z.object({
    id,
    hidden,
    name: text(160),
    issuer: text(120),
    date: partialDate.optional(),
    url,
  }),
  awards: z.object({
    id,
    hidden,
    title: text(160),
    awarder: text(120),
    date: partialDate.optional(),
    summary: text(1000),
  }),
  volunteer: z.object({
    id,
    hidden,
    organization: text(120),
    position: text(120),
    url,
    ...dates,
    summary: text(2000),
    highlights,
  }),
  custom: z.object({
    id,
    hidden,
    title: text(160),
    subtitle: text(160),
    ...dates,
    summary: text(2000),
    highlights,
  }),
};

const section = <K extends (typeof SECTION_KINDS)[number]>(kind: K) =>
  z.object({
    id,
    kind: z.literal(kind),
    /** "" uses the default heading for the CV's language. */
    title: text(80),
    hidden: z.boolean(),
    entries: z.array(entries[kind]).max(50),
  });

const sectionSchema = z.discriminatedUnion("kind", [
  section("work"),
  section("education"),
  section("skills"),
  section("languages"),
  section("projects"),
  section("certificates"),
  section("awards"),
  section("volunteer"),
  section("custom"),
]);

export const cvContentSchema = z
  .object({ basics, sections: z.array(sectionSchema).max(20) })
  .superRefine((content, ctx) => {
    const seen = new Set<string>();
    const unique = (value: string, path: (string | number)[]) => {
      if (seen.has(value)) {
        ctx.addIssue({ code: "custom", message: "Duplicate id", path });
      }
      seen.add(value);
    };

    content.basics.links.forEach((l, i) =>
      unique(l.id, ["basics", "links", i, "id"]),
    );
    content.sections.forEach((s, i) => {
      unique(s.id, ["sections", i, "id"]);
      s.entries.forEach((entry, j) => {
        unique(entry.id, ["sections", i, "entries", j, "id"]);
        if (
          "startDate" in entry &&
          entry.startDate &&
          entry.endDate &&
          endsBeforeStart(entry.startDate, entry.endDate)
        ) {
          ctx.addIssue({
            code: "custom",
            message: "End date is before start date",
            path: ["sections", i, "entries", j, "endDate"],
          });
        }
      });
    });
  });

export type CvContent = z.infer<typeof cvContentSchema>;
export type CvSection = CvContent["sections"][number];
export type SectionKind = (typeof SECTION_KINDS)[number];
export type CvLanguage = (typeof CV_LANGUAGES)[number];
export type CvMarket = (typeof CV_MARKETS)[number];

/** Inputs to create a CV or a version. */
export const newCvSchema = z.object({
  title: text(120).min(1),
  language: z.enum(CV_LANGUAGES),
  market: z.enum(CV_MARKETS),
});

export const revisionNoteSchema = text(200);
