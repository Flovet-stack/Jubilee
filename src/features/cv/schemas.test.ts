import { describe, expect, it } from "vitest";

import {
  emptyCvContent,
  errorFromDatabase,
  migrateContent,
  validateContent,
} from "./logic";
import { CV_SCHEMA_VERSION, cvContentSchema, type CvContent } from "./schemas";

let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

function fullCv(): CvContent {
  return {
    basics: {
      name: "Ada Lovelace",
      headline: "Analyst",
      email: "ada@example.com",
      phone: "+44 20 7946 0000",
      location: { city: "London", region: "", countryCode: "GB" },
      summary: "Writes the first programs.",
      links: [{ id: uuid(), label: "Site", url: "https://example.com" }],
    },
    sections: [
      {
        id: uuid(),
        kind: "work",
        title: "",
        hidden: false,
        entries: [
          {
            id: uuid(),
            position: "Analyst",
            name: "Analytical Engine Co.",
            location: "London",
            url: "",
            startDate: "1842-01",
            endDate: "1843",
            summary: "",
            highlights: ["Published the notes"],
          },
          {
            id: uuid(),
            position: "Consultant",
            name: "Self",
            location: "",
            url: "",
            startDate: "1844",
            summary: "",
            highlights: [],
          },
        ],
      },
      {
        id: uuid(),
        kind: "education",
        title: "",
        hidden: false,
        entries: [
          {
            id: uuid(),
            institution: "Home tutoring",
            area: "Mathematics",
            studyType: "",
            location: "",
            url: "",
            score: "",
            courses: ["Calculus"],
          },
        ],
      },
      {
        id: uuid(),
        kind: "skills",
        title: "Skills",
        hidden: false,
        entries: [
          {
            id: uuid(),
            name: "Mathematics",
            level: "",
            keywords: ["Bernoulli"],
          },
        ],
      },
      {
        id: uuid(),
        kind: "languages",
        title: "",
        hidden: true,
        entries: [{ id: uuid(), language: "French", fluency: "Fluent" }],
      },
      {
        id: uuid(),
        kind: "certificates",
        title: "",
        hidden: false,
        entries: [
          {
            id: uuid(),
            name: "Cert",
            issuer: "Society",
            date: "1840-05",
            url: "",
          },
        ],
      },
      {
        id: uuid(),
        kind: "custom",
        title: "Publications",
        hidden: false,
        entries: [
          {
            id: uuid(),
            title: "Notes",
            subtitle: "Taylor's Scientific Memoirs",
            startDate: "1843-09",
            summary: "",
            highlights: [],
          },
        ],
      },
    ],
  };
}

const errorsOf = (content: unknown) => {
  const result = validateContent(content);
  return result.ok
    ? []
    : result.error.code === "invalid_content"
      ? result.error.issues
      : [];
};

describe("cvContentSchema (decision 0016)", () => {
  it("accepts a full CV", () => {
    expect(errorsOf(fullCv())).toEqual([]);
  });

  it("accepts the empty CV that create uses", () => {
    expect(cvContentSchema.safeParse(emptyCvContent()).success).toBe(true);
  });

  it.each(["1842-13", "1842-1", "42", "1842/01", "1842-01-15", "Jan 1842"])(
    "rejects the date %s",
    (date) => {
      const cv = fullCv();
      const work = cv.sections[0];
      if (work?.kind !== "work" || !work.entries[0]) throw new Error("fixture");
      work.entries[0].startDate = date;
      expect(errorsOf(cv).join()).toContain("startDate");
    },
  );

  it("rejects an end date before the start date", () => {
    const cv = fullCv();
    const work = cv.sections[0];
    if (work?.kind !== "work" || !work.entries[0]) throw new Error("fixture");
    work.entries[0].endDate = "1841-12";
    expect(errorsOf(cv).join()).toContain("End date is before start date");
  });

  it("compares dates at the precision both share", () => {
    const cv = fullCv();
    const work = cv.sections[0];
    if (work?.kind !== "work" || !work.entries[0]) throw new Error("fixture");
    work.entries[0].startDate = "1843-05";
    work.entries[0].endDate = "1843";
    expect(errorsOf(cv)).toEqual([]);
    work.entries[0].endDate = "1842";
    expect(errorsOf(cv).join()).toContain("End date is before start date");
  });

  it("rejects an unknown section kind", () => {
    const cv = fullCv() as unknown as { sections: { kind: string }[] };
    cv.sections[0]!.kind = "hobbies";
    expect(errorsOf(cv)).not.toEqual([]);
  });

  it("rejects duplicate ids across sections and entries", () => {
    const cv = fullCv();
    const first = cv.sections[0]!;
    cv.sections[1]!.id = first.id;
    expect(errorsOf(cv).join()).toContain("Duplicate id");
  });

  it("rejects over-long fields", () => {
    const cv = fullCv();
    cv.basics.name = "a".repeat(121);
    expect(errorsOf(cv).join()).toContain("basics.name");
  });

  it("rejects too many sections", () => {
    const cv = emptyCvContent();
    cv.sections = Array.from({ length: 21 }, () => ({
      id: crypto.randomUUID(),
      kind: "skills" as const,
      title: "",
      hidden: false,
      entries: [],
    }));
    expect(errorsOf(cv)).not.toEqual([]);
  });

  it("rejects non-http links and a bad email", () => {
    const cv = fullCv();
    cv.basics.links[0]!.url = "javascript:alert(1)";
    cv.basics.email = "not-an-email";
    const issues = errorsOf(cv).join();
    expect(issues).toContain("basics.links.0.url");
    expect(issues).toContain("basics.email");
  });

  it("rejects ids that aren't UUIDs", () => {
    const cv = fullCv();
    cv.sections[0]!.id = "1";
    expect(errorsOf(cv).join()).toContain("sections.0.id");
  });

  it("trims text", () => {
    const cv = fullCv();
    cv.basics.name = "  Ada  ";
    const result = validateContent(cv);
    expect(result.ok && result.value.basics.name).toBe("Ada");
  });
});

describe("migrateContent", () => {
  it("passes current content through validation", () => {
    expect(migrateContent(fullCv(), CV_SCHEMA_VERSION).ok).toBe(true);
  });

  it("refuses a version it doesn't know", () => {
    for (const version of [0, CV_SCHEMA_VERSION + 1, 1.5]) {
      const result = migrateContent(fullCv(), version);
      expect(result.ok).toBe(false);
    }
  });
});

describe("errorFromDatabase", () => {
  it("maps the size check, missing rows and other errors", () => {
    expect(
      errorFromDatabase({
        code: "23514",
        message: 'violates check constraint "cvs_content_size"',
      }),
    ).toEqual({ code: "too_large" });
    expect(errorFromDatabase({ code: "PGRST116" })).toEqual({
      code: "not_found",
    });
    expect(errorFromDatabase({ code: "23503" })).toEqual({ code: "not_found" });
    expect(errorFromDatabase({ code: "42501" })).toEqual({ code: "database" });
  });
});
