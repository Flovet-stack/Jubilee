import { describe, expect, it } from "vitest";

import { emptyEntry, emptySection } from "./editor";
import { emptyCvContent } from "./logic";
import type { CvContent, SectionKind } from "./schemas";
import {
  buildCvTree,
  displayUrl,
  formatPartialDate,
  formatRange,
  treeText,
  type CvLabels,
} from "./tree";

let n = 0;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const headings: Record<SectionKind, string> = {
  work: "Work Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  projects: "Projects",
  certificates: "Certifications",
  awards: "Awards",
  volunteer: "Volunteering",
  custom: "",
};
const en: CvLabels = { headings, present: "Present" };
const fr: CvLabels = {
  headings: {
    ...headings,
    work: "Expérience professionnelle",
    education: "Formation",
  },
  present: "aujourd’hui",
};

function cv(): CvContent {
  const content = emptyCvContent(id);
  content.basics = {
    ...content.basics,
    name: "Ada Lovelace",
    headline: "Analyst",
    email: "ada@example.com",
    phone: "+33612345678",
    location: { city: "Paris", region: "", countryCode: "FR" },
    summary: "Writes the first programs.",
    links: [{ id: id(), label: "Site", url: "https://www.example.com/" }],
  };
  const [work, education, skills] = content.sections;
  if (
    work?.kind !== "work" ||
    education?.kind !== "education" ||
    skills?.kind !== "skills"
  ) {
    throw new Error("fixture");
  }
  work.entries = [
    {
      ...emptyEntry("work", id),
      position: "Analyst",
      name: "Engine Co.",
      location: "London",
      startDate: "2021-01",
      highlights: ["Published the notes", " "],
    },
    {
      ...emptyEntry("work", id),
      name: "Self",
      startDate: "2019",
      endDate: "2020",
    },
  ];
  education.entries = [
    {
      ...emptyEntry("education", id),
      studyType: "BSc",
      area: "Mathematics",
      institution: "Home",
      startDate: "2015-09",
      endDate: "2018-06",
      courses: ["Calculus", "Logic"],
    },
  ];
  skills.entries = [
    { ...emptyEntry("skills", id), keywords: ["Java", "SQL"] },
    { ...emptyEntry("skills", id), name: "Tools", keywords: ["Excel"] },
  ];
  return content;
}

describe("dates", () => {
  it("formats a year, a month and year, in both languages", () => {
    expect(formatPartialDate("2021", "en")).toBe("2021");
    expect(formatPartialDate("2021-01", "en")).toBe("Jan 2021");
    expect(formatPartialDate("2021-01", "fr")).toBe("janv. 2021");
  });

  it("formats ranges, current and partial", () => {
    expect(formatRange("2021-01", undefined, "en", "Present")).toBe(
      "Jan 2021 – Present",
    );
    expect(formatRange("2019", "2020", "en", "Present")).toBe("2019 – 2020");
    expect(formatRange(undefined, "2020", "en", "Present")).toBe("2020");
    expect(formatRange(undefined, undefined, "en", "Present")).toBe("");
  });
});

describe("buildCvTree (decision 0024 §3, 0025, 0026)", () => {
  it("lays out the header and the contact line", () => {
    const tree = buildCvTree(cv(), {
      language: "en",
      market: "US",
      labels: en,
    });
    expect(tree.paper).toBe("letter");
    expect(tree.name).toBe("Ada Lovelace");
    expect(tree.contact).toEqual([
      "Paris, France",
      "ada@example.com",
      "+33 6 12 34 56 78",
      "www.example.com",
    ]);
  });

  it("uses A4 and French headings, dates and country names for a French CV", () => {
    const tree = buildCvTree(cv(), {
      language: "fr",
      market: "FR",
      labels: fr,
    });
    expect(tree.paper).toBe("a4");
    expect(tree.contact[0]).toBe("Paris, France");
    expect(tree.sections.map((s) => s.heading)).toEqual([
      "Expérience professionnelle",
      "Formation",
      "Skills",
    ]);
    const work = tree.sections[0];
    expect(work?.layout === "entries" && work.entries[0]?.line1Right).toBe(
      "janv. 2021 – aujourd’hui",
    );
  });

  it("puts entries in four corners and moves the organisation up when there is no title", () => {
    const tree = buildCvTree(cv(), {
      language: "en",
      market: "US",
      labels: en,
    });
    const work = tree.sections[0];
    if (work?.layout !== "entries") throw new Error("layout");
    expect(work.entries[0]).toMatchObject({
      line1Left: "Analyst",
      line1Right: "Jan 2021 – Present",
      line2Left: "Engine Co.",
      line2Right: "London",
      bullets: ["Published the notes"],
    });
    expect(work.entries[1]).toMatchObject({
      line1Left: "Self",
      line1Right: "2019 – 2020",
      line2Left: "",
    });
    const education = tree.sections[1];
    if (education?.layout !== "entries") throw new Error("layout");
    expect(education.entries[0]).toMatchObject({
      line1Left: "BSc, Mathematics",
      line2Left: "Home",
      text: ["Calculus, Logic"],
    });
  });

  it("prints skills one line per group, ungrouped on one line", () => {
    const tree = buildCvTree(cv(), {
      language: "en",
      market: "US",
      labels: en,
    });
    const skills = tree.sections[2];
    expect(skills?.layout === "lines" && skills.lines).toEqual([
      "Java, SQL",
      "Tools: Excel",
    ]);
  });

  it("leaves out hidden and empty sections and blank entries, and uses custom titles", () => {
    const content = cv();
    content.sections[1]!.hidden = true;
    content.sections[2]!.title = "Technical skills";
    const languages = emptySection("languages", id);
    if (languages.kind !== "languages") throw new Error("kind");
    languages.entries = [
      { ...emptyEntry("languages", id), language: "French", fluency: "Native" },
      emptyEntry("languages", id),
    ];
    content.sections.push(languages, emptySection("awards", id));
    const tree = buildCvTree(content, {
      language: "en",
      market: "US",
      labels: en,
    });
    expect(tree.sections.map((s) => s.heading)).toEqual([
      "Work Experience",
      "Technical skills",
      "Languages",
    ]);
    const last = tree.sections[2];
    expect(last?.layout === "lines" && last.lines).toEqual(["French: Native"]);
  });

  it("gives an empty CV no sections", () => {
    const tree = buildCvTree(emptyCvContent(id), {
      language: "en",
      market: "US",
      labels: en,
    });
    expect(tree.sections).toEqual([]);
    expect(tree.contact).toEqual([]);
  });

  it("reads in content order", () => {
    const text = treeText(
      buildCvTree(cv(), { language: "en", market: "US", labels: en }),
    );
    expect(text.indexOf("Analyst")).toBeLessThan(
      text.indexOf("Jan 2021 – Present"),
    );
    expect(text.indexOf("Jan 2021 – Present")).toBeLessThan(
      text.indexOf("Engine Co."),
    );
    expect(text.indexOf("Engine Co.")).toBeLessThan(text.indexOf("London"));
  });

  it("shows links without the protocol", () => {
    expect(displayUrl("https://linkedin.com/in/ada/")).toBe(
      "linkedin.com/in/ada",
    );
  });
});

describe("hidden entries (0039)", () => {
  it("leaves a hidden entry out of the tree and keeps the rest", () => {
    const content = cv();
    const skills = content.sections.find((s) => s.kind === "skills");
    if (skills?.kind !== "skills") throw new Error("fixture");
    const shown = emptyEntry("skills", id);
    shown.keywords = ["SQL"];
    const hidden = emptyEntry("skills", id);
    hidden.keywords = ["Cobol"];
    hidden.hidden = true;
    skills.entries = [shown, hidden];
    const text = treeText(
      buildCvTree(content, { language: "en", market: "US", labels: en }),
    ).join("\n");
    expect(text).toContain("SQL");
    expect(text).not.toContain("Cobol");
  });

  it("drops a section whose entries are all hidden", () => {
    const content = cv();
    const work = content.sections.find((s) => s.kind === "work");
    if (work?.kind !== "work") throw new Error("fixture");
    work.entries = work.entries.map((e) => ({ ...e, hidden: true }));
    const tree = buildCvTree(content, {
      language: "en",
      market: "US",
      labels: en,
    });
    expect(tree.sections.map((s) => s.kind)).not.toContain("work");
  });
});
