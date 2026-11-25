import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

import { cvName, emptyEntry, followsContent } from "./editor";
import { emptyCvContent } from "./logic";
import { BULLET_MAX, reviewCv, SUMMARY_MAX } from "./review";
import type { CvContent } from "./schemas";

let n = 0;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const codes = (content: CvContent) => reviewCv(content).map((f) => f.code);

/** A CV that passes every check. */
function complete(): CvContent {
  const content = emptyCvContent(id);
  content.basics.name = "Aminata Diallo";
  content.basics.headline = "Data analyst";
  content.basics.email = "a@example.com";
  content.basics.summary = "Analyst with 5 years in retail.";
  const work = content.sections.find((s) => s.kind === "work");
  if (work?.kind !== "work") throw new Error("kind");
  const job = emptyEntry("work", id);
  job.position = "Analyst";
  job.startDate = "2021-01";
  job.highlights = ["Cut reporting time from 3 days to 1."];
  work.entries.push(job);
  return content;
}

function firstJob(content: CvContent) {
  const work = content.sections.find((s) => s.kind === "work");
  if (work?.kind !== "work") throw new Error("kind");
  return { section: work, job: work.entries[0]! };
}

describe("reviewCv (0031 §3)", () => {
  it("finds nothing on a complete CV", () => {
    expect(reviewCv(complete())).toEqual([]);
  });

  it("flags contact without email or phone, and a missing headline", () => {
    const content = complete();
    content.basics.email = "";
    content.basics.headline = " ";
    expect(codes(content)).toEqual(["contactReach", "noHeadline"]);
    content.basics.phone = "+33612345678";
    expect(codes(content)).toEqual(["noHeadline"]);
  });

  it("flags a missing or long summary", () => {
    const content = complete();
    content.basics.summary = "";
    expect(codes(content)).toEqual(["noSummary"]);
    content.basics.summary = "a".repeat(SUMMARY_MAX + 1);
    expect(codes(content)).toEqual(["longSummary"]);
    content.basics.summary = "a".repeat(SUMMARY_MAX);
    expect(codes(content)).toEqual([]);
  });

  it("flags a job with no bullets or no dates, at the entry", () => {
    const content = complete();
    const { section, job } = firstJob(content);
    job.highlights = [""];
    job.startDate = undefined;
    const findings = reviewCv(content);
    expect(findings.map((f) => f.code)).toEqual(["noDates", "noBullets"]);
    expect(findings[0]).toMatchObject({
      entryId: job.id,
      step: { type: "section", id: section.id },
    });
  });

  it("counts bullets without numbers and long bullets", () => {
    const content = complete();
    const { job } = firstJob(content);
    job.highlights = [
      "Led the team.",
      "Grew sales 12%.",
      `Built ${"x".repeat(BULLET_MAX)}`,
    ];
    expect(reviewCv(content)).toMatchObject([
      { code: "bulletsWithoutNumbers", count: 2 },
      { code: "longBullets", count: 1 },
    ]);
  });

  it("skips hidden sections and empty entries", () => {
    const content = complete();
    const { section, job } = firstJob(content);
    job.highlights = [];
    section.hidden = true;
    expect(codes(content)).toEqual([]);
    section.hidden = false;
    section.entries = [emptyEntry("work", id)];
    expect(codes(content)).toEqual([]);
  });

  it("needs no bullets for education, but checks projects' bullets", () => {
    const content = complete();
    const education = content.sections.find((s) => s.kind === "education");
    if (education?.kind !== "education") throw new Error("kind");
    const school = emptyEntry("education", id);
    school.institution = "Sorbonne";
    education.entries.push(school);
    expect(codes(content)).toEqual([]);

    const project = emptyEntry("projects", id);
    project.name = "Churn model";
    content.sections.push({
      id: id(),
      kind: "projects",
      title: "",
      hidden: false,
      entries: [project],
    });
    expect(codes(content)).toEqual([]);
    project.highlights = ["Built a churn model."];
    expect(codes(content)).toEqual(["bulletsWithoutNumbers"]);
  });

  it("gives every finding a unique key", () => {
    const content = emptyCvContent(id);
    content.basics.name = "A";
    const keys = reviewCv(content).map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(codes(content)).toEqual(["contactReach", "noHeadline", "noSummary"]);
  });
});

describe("cvName and followsContent (0031 §1)", () => {
  const basics = { headline: "Data analyst", name: "Aminata Diallo" };

  it("joins headline and name with a middle dot", () => {
    expect(cvName(basics, "CV")).toBe("Data analyst · Aminata Diallo");
    expect(cvName({ headline: "", name: "Aminata" }, "CV")).toBe("Aminata");
    expect(cvName({ headline: " ", name: "" }, "CV")).toBe("CV");
  });

  it("follows the content until the user renames it", () => {
    expect(followsContent("Resume", basics, "Resume")).toBe(true);
    expect(
      followsContent("Data analyst · Aminata Diallo", basics, "Resume"),
    ).toBe(true);
    expect(followsContent("Aminata Diallo Resume", basics, "Resume")).toBe(
      true,
    );
    expect(followsContent("For Orange", basics, "Resume")).toBe(false);
  });
});

describe("finding messages (0031: every check in both languages)", () => {
  const all = [
    "contactReach",
    "noHeadline",
    "noSummary",
    "longSummary",
    "noBullets",
    "bulletsWithoutNumbers",
    "longBullets",
    "noDates",
  ] as const;

  for (const [locale, messages] of [
    ["en-US", en],
    ["fr-FR", fr],
  ] as const) {
    it(`formats every finding in ${locale}, singular and plural`, () => {
      const t = createTranslator({
        locale,
        messages,
        namespace: "cv.editor.review",
      });
      for (const code of all) {
        for (const count of [1, 2]) {
          const text = t(`findings.${code}`, { count });
          expect(text, code).not.toMatch(/[{}]/);
          expect(text.length, code).toBeGreaterThan(10);
        }
      }
      expect(t("summary", { count: 0 })).not.toMatch(/\d/);
      expect(t("summary", { count: 2 })).toMatch(/^2 /);
    });
  }
});
