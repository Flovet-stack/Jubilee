import { parsePhoneNumberFromString } from "libphonenumber-js";

import type { CvContent, CvLanguage, CvMarket, SectionKind } from "./schemas";

/**
 * The printable CV (decision 0024 §3): one pure function turns the content
 * into what a template prints, in order, with headings in the CV's language,
 * dates formatted and entries laid out in four corners (0026). The HTML
 * preview (#14) and the react-pdf template (#15) read only this tree, so
 * they can't drift apart.
 */

/** Words printed on the CV, in the CV's language (from the message files). */
export type CvLabels = {
  headings: Record<SectionKind, string>;
  /** End of a current date range: "Present", "aujourd'hui". */
  present: string;
};

/** One entry in four corners (0026). Empty corners are "". */
export type TreeEntry = {
  id: string;
  line1Left: string;
  line1Right: string;
  line2Left: string;
  line2Right: string;
  /** Paragraphs under the corners: summary, description, details. */
  text: string[];
  bullets: string[];
};

export type TreeSection =
  | {
      id: string;
      kind: SectionKind;
      heading: string;
      layout: "entries";
      entries: TreeEntry[];
    }
  | {
      id: string;
      kind: SectionKind;
      heading: string;
      layout: "lines";
      lines: string[];
    };

export type CvTree = {
  language: CvLanguage;
  market: CvMarket;
  /** Letter for the US, A4 for France (0025). */
  paper: "letter" | "a4";
  name: string;
  headline: string;
  /** Location, email, phone and links, printed on one line with " · ". */
  contact: string[];
  summary: string;
  sections: TreeSection[];
};

const languageTags: Record<CvLanguage, string> = { en: "en-US", fr: "fr-FR" };

/** "2021" → "2021"; "2021-01" → "Jan 2021" / "janv. 2021". */
export function formatPartialDate(value: string, language: CvLanguage): string {
  const [year, month] = value.split("-");
  if (!month) return year ?? "";
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(languageTags[language], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "Jan 2021 – Present". A start with no end is current (0016). */
export function formatRange(
  start: string | undefined,
  end: string | undefined,
  language: CvLanguage,
  present: string,
): string {
  if (!start && !end) return "";
  if (!start) return formatPartialDate(end ?? "", language);
  const from = formatPartialDate(start, language);
  return `${from} – ${end ? formatPartialDate(end, language) : present}`;
}

const join = (parts: (string | undefined)[], separator = ", ") =>
  parts
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(separator);

/** "https://www.example.com/" → "www.example.com". */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function displayPhone(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone);
  return parsed?.isValid() ? parsed.formatInternational() : phone;
}

function countryName(code: string, language: CvLanguage): string {
  if (!code) return "";
  try {
    const names = new Intl.DisplayNames([languageTags[language]], {
      type: "region",
    });
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

function corners(
  id: string,
  what: string,
  when: string,
  where: string,
  place: string,
  text: string[] = [],
  bullets: string[] = [],
): TreeEntry {
  // A missing title moves the organisation up, so line 1 is never blank.
  const [line1Left, line2Left] = what ? [what, where] : [where, ""];
  return {
    id,
    line1Left,
    line1Right: when,
    line2Left,
    line2Right: place,
    text: text.map((t) => t.trim()).filter(Boolean),
    bullets: bullets.map((b) => b.trim()).filter(Boolean),
  };
}

const isBlank = (entry: TreeEntry) =>
  !entry.line1Left &&
  !entry.line1Right &&
  !entry.line2Left &&
  !entry.line2Right &&
  entry.text.length === 0 &&
  entry.bullets.length === 0;

type Section = CvContent["sections"][number];

function sectionBody(
  section: Section,
  language: CvLanguage,
  present: string,
):
  | { layout: "entries"; entries: TreeEntry[] }
  | { layout: "lines"; lines: string[] } {
  const range = (start?: string, end?: string) =>
    formatRange(start, end, language, present);
  const date = (value?: string) =>
    value ? formatPartialDate(value, language) : "";

  switch (section.kind) {
    case "work":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(
            e.id,
            e.position,
            range(e.startDate, e.endDate),
            e.name,
            e.location,
            [e.summary],
            e.highlights,
          ),
        ),
      };
    case "volunteer":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(
            e.id,
            e.position,
            range(e.startDate, e.endDate),
            e.organization,
            "",
            [e.summary],
            e.highlights,
          ),
        ),
      };
    case "education":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(
            e.id,
            join([e.studyType, e.area]),
            range(e.startDate, e.endDate),
            e.institution,
            e.location,
            [e.score, join(e.courses)],
          ),
        ),
      };
    case "projects":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(
            e.id,
            e.name,
            range(e.startDate, e.endDate),
            e.url ? displayUrl(e.url) : "",
            "",
            [e.description],
            e.highlights,
          ),
        ),
      };
    case "certificates":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(
            e.id,
            join([e.name, e.issuer]),
            date(e.date),
            e.url ? displayUrl(e.url) : "",
            "",
          ),
        ),
      };
    case "awards":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(e.id, join([e.title, e.awarder]), date(e.date), "", "", [
            e.summary,
          ]),
        ),
      };
    case "custom":
      return {
        layout: "entries",
        entries: section.entries.map((e) =>
          corners(
            e.id,
            e.title,
            range(e.startDate, e.endDate),
            e.subtitle,
            "",
            [e.summary],
            e.highlights,
          ),
        ),
      };
    case "skills":
      // One line per group, "Group: a, b"; ungrouped skills on one line (0025).
      return {
        layout: "lines",
        lines: section.entries
          .map((e) => {
            const skills = join(e.keywords);
            const name = e.name.trim();
            if (name && skills) return `${name}: ${skills}`;
            return name || skills;
          })
          .filter(Boolean),
      };
    case "languages": {
      const line = join(
        section.entries.map((e) => join([e.language, e.fluency], ": ")),
      );
      return { layout: "lines", lines: line ? [line] : [] };
    }
  }
}

/** The printable tree for a CV. Hidden and empty sections are left out. */
export function buildCvTree(
  content: CvContent,
  options: { language: CvLanguage; market: CvMarket; labels: CvLabels },
): CvTree {
  const { language, market, labels } = options;
  const { basics } = content;

  const location = join([
    basics.location.city,
    basics.location.region,
    countryName(basics.location.countryCode, language),
  ]);

  const sections: TreeSection[] = [];
  for (const section of content.sections) {
    if (section.hidden) continue;
    const heading = section.title.trim() || labels.headings[section.kind];
    const body = sectionBody(section, language, labels.present);
    if (body.layout === "entries") {
      const entries = body.entries.filter((entry) => !isBlank(entry));
      if (entries.length > 0) {
        sections.push({
          id: section.id,
          kind: section.kind,
          heading,
          layout: "entries",
          entries,
        });
      }
    } else if (body.lines.length > 0) {
      sections.push({
        id: section.id,
        kind: section.kind,
        heading,
        layout: "lines",
        lines: body.lines,
      });
    }
  }

  return {
    language,
    market,
    paper: market === "US" ? "letter" : "a4",
    name: basics.name.trim(),
    headline: basics.headline.trim(),
    contact: [
      location,
      basics.email,
      basics.phone ? displayPhone(basics.phone) : "",
      ...basics.links.map((link) =>
        link.url ? displayUrl(link.url) : link.label,
      ),
    ]
      .map((part) => part.trim())
      .filter(Boolean),
    summary: basics.summary.trim(),
    sections,
  };
}

/** The tree's text in reading order, for tests and the PDF extraction check (#15). */
export function treeText(tree: CvTree): string[] {
  const out = [
    tree.name,
    tree.headline,
    tree.contact.join(" · "),
    tree.summary,
  ];
  for (const section of tree.sections) {
    out.push(section.heading);
    if (section.layout === "lines") out.push(...section.lines);
    else
      for (const entry of section.entries) {
        out.push(
          entry.line1Left,
          entry.line1Right,
          entry.line2Left,
          entry.line2Right,
          ...entry.text,
          ...entry.bullets,
        );
      }
  }
  return out.filter(Boolean);
}
