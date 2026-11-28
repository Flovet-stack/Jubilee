import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { cvContentSchema } from "../cv/schemas";
import {
  findContact,
  isEmptyImport,
  toCvContent,
  type ImportResult,
} from "./map";

let n = 0;
const newId = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const result = (over: Partial<ImportResult> = {}): ImportResult => ({
  language: "fr",
  basics: {
    name: "Aminata Diallo",
    headline: "Analyste de données",
    city: "Paris",
    region: null,
    countryCode: "fr",
    summary: null,
  },
  work: [
    {
      position: "Analyste",
      company: "Maison Lumière",
      location: null,
      startDate: "2021-03",
      endDate: null,
      summary: null,
      highlights: ["Tableaux de bord hebdomadaires", " "],
    },
    {
      position: "Stagiaire",
      company: "Acme",
      location: null,
      startDate: "2020",
      endDate: "2019",
      summary: null,
      highlights: [],
    },
    {
      position: null,
      company: null,
      location: null,
      startDate: "mars 2020",
      endDate: null,
      summary: null,
      highlights: [],
    },
  ],
  education: [],
  skills: ["SQL", "Python", "SQL"],
  languages: [{ language: "Anglais", fluency: "Courant" }],
  certificates: [],
  projects: [],
  volunteer: [],
  unread: ["Distinctions : 2 éléments"],
  ...over,
});

const contact = { email: "", phone: "", linkedin: "" };

describe("findContact", () => {
  it("reads email, phone and LinkedIn URL from the original text", () => {
    const text =
      "Contact\naminata@example.fr\n+33 6 12 34 56 78\nwww.linkedin.com/in/aminata-diallo\nExpérience 2019 - 2023";
    expect(findContact(text)).toEqual({
      email: "aminata@example.fr",
      phone: "+33 6 12 34 56 78",
      linkedin: "https://www.linkedin.com/in/aminata-diallo",
    });
  });

  it("doesn't take a year range for a phone", () => {
    expect(findContact("2019 - 2023").phone).toBe("");
  });
});

describe("toCvContent (spec 31)", () => {
  it("makes valid content and marks the filled sections", () => {
    const { content, language } = toCvContent(result(), contact, newId);
    expect(cvContentSchema.safeParse(content).success).toBe(true);
    expect(language).toBe("fr");
    const kinds = content.sections.map((s) => s.kind);
    expect(kinds).toEqual(["work", "education", "skills", "languages"]);
    const filled = content.sections
      .filter((s) => s.entries.length)
      .map((s) => s.id);
    expect(content.imported).toEqual(["basics", ...filled]);
    expect(content.importUnread).toEqual(["Distinctions : 2 éléments"]);
    expect(content.basics.location.countryCode).toBe("FR");
  });

  it("drops bad dates and empty entries instead of failing", () => {
    const { content } = toCvContent(result(), contact, newId);
    const work = content.sections[0]!.entries as {
      startDate?: string;
      endDate?: string;
      highlights?: string[];
    }[];
    expect(work).toHaveLength(2);
    expect(work[0]!.highlights).toEqual(["Tableaux de bord hebdomadaires"]);
    expect(work[1]!.endDate).toBeUndefined();
  });

  it("dedupes skills into one group", () => {
    const { content } = toCvContent(result(), contact, newId);
    const skills = content.sections[2]!.entries as { keywords: string[] }[];
    expect(skills[0]!.keywords).toEqual(["SQL", "Python"]);
  });

  it("puts contact details from the text on the CV", () => {
    const { content } = toCvContent(
      result(),
      {
        email: "a@b.fr",
        phone: "+33 6 12 34 56 78",
        linkedin: "https://linkedin.com/in/a",
      },
      newId,
    );
    expect(content.basics.email).toBe("a@b.fr");
    expect(content.basics.links[0]?.url).toBe("https://linkedin.com/in/a");
  });

  it("treats a result with no name and no entries as empty", () => {
    const empty = result({
      basics: {
        name: null,
        headline: null,
        city: null,
        region: null,
        countryCode: null,
        summary: null,
      },
      work: [],
      skills: [],
      languages: [],
      unread: [],
    });
    const { content } = toCvContent(empty, contact, newId);
    expect(isEmptyImport(content)).toBe(true);
    expect(content.imported).toEqual([]);
  });
});
