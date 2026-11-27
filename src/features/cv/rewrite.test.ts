import { describe, expect, it } from "vitest";

import { emptyEntry } from "./editor";
import { emptyCvContent } from "./logic";
import type { Finding } from "./review";
import {
  entryContext,
  maxLengthFor,
  newDetails,
  readTarget,
  targetFor,
  writeTarget,
} from "./rewrite";
import type { CvContent } from "./schemas";

let n = 0;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

function cv(): { content: CvContent; entryId: string } {
  const content = emptyCvContent(id);
  content.basics.summary =
    "Data analyst with 5 years in retail, working in SQL and Tableau.";
  const work = content.sections.find((s) => s.kind === "work");
  if (work?.kind !== "work") throw new Error("fixture");
  const entry = emptyEntry("work", id);
  entry.position = "Analyst";
  entry.name = "Doctolib";
  entry.highlights = [
    "Built weekly dashboards for the sales team",
    "Cut report time by 30% with Python and Power BI",
  ];
  work.entries = [entry];
  return { content, entryId: entry.id };
}

describe("rewrite targets (spec 29)", () => {
  it("reads and writes the summary and a bullet", () => {
    const { content, entryId } = cv();
    const bullet = { kind: "bullet", entryId, index: 1 } as const;
    expect(readTarget(content, bullet)).toContain("30%");
    const next = writeTarget(content, bullet, "New text");
    expect(readTarget(next, bullet)).toBe("New text");
    expect(readTarget(next, { kind: "bullet", entryId, index: 0 })).toBe(
      "Built weekly dashboards for the sales team",
    );
    expect(readTarget(content, bullet)).toContain("30%");
    expect(
      readTarget(writeTarget(content, { kind: "summary" }, "S"), {
        kind: "summary",
      }),
    ).toBe("S");
  });

  it("is undefined for a missing entry or bullet", () => {
    const { content, entryId } = cv();
    expect(
      readTarget(content, { kind: "bullet", entryId: id(), index: 0 }),
    ).toBeUndefined();
    expect(
      readTarget(content, { kind: "bullet", entryId, index: 9 }),
    ).toBeUndefined();
  });

  it("gives a bullet its title and employer", () => {
    const { content, entryId } = cv();
    expect(
      entryContext(content, { kind: "bullet", entryId, index: 0 }),
    ).toEqual({ title: "Analyst", employer: "Doctolib" });
    expect(entryContext(content, { kind: "summary" })).toEqual({});
  });

  it("points a finding at its text, and never at something missing", () => {
    const { content, entryId } = cv();
    const at = (code: Finding["code"], entry?: string): Finding => ({
      key: code,
      code,
      step: { type: "summary" },
      ...(entry ? { entryId: entry } : {}),
    });
    expect(targetFor(at("longSummary"), content)).toEqual({ kind: "summary" });
    expect(targetFor(at("bulletsWithoutNumbers", entryId), content)).toEqual({
      kind: "bullet",
      entryId,
      index: 0,
    });
    expect(targetFor(at("longBullets", entryId), content)).toBeNull();
    expect(targetFor(at("noSummary"), content)).toBeNull();
    expect(targetFor(at("noBullets", entryId), content)).toBeNull();
  });

  it("aims under the review's limits for a too-long finding", () => {
    expect(maxLengthFor({ kind: "summary" }, "longSummary")).toBe(600);
    expect(maxLengthFor({ kind: "summary" })).toBe(2000);
    const bullet = { kind: "bullet", entryId: "x", index: 0 } as const;
    expect(maxLengthFor(bullet, "longBullets")).toBe(200);
    expect(maxLengthFor(bullet)).toBe(300);
  });
});

describe("new details (0049)", () => {
  const { content } = cv();

  it("passes a rewording that keeps her facts", () => {
    expect(
      newDetails(
        "Reduced report time by 30% using Python and Power BI",
        content,
      ),
    ).toEqual([]);
    expect(
      newDetails("Designed weekly dashboards for sales leaders", content),
    ).toEqual([]);
  });

  it("flags numbers that aren't in the CV", () => {
    expect(newDetails("Cut report time by 45%", content)).toEqual(["45"]);
    expect(
      newDetails("Built dashboards used by 1,200 people", content),
    ).toEqual(["1,200"]);
  });

  it("reads a year and a count as two numbers", () => {
    expect(newDetails("Since 2019, 5 dashboards a week", content)).toEqual([
      "2019",
    ]);
  });

  it("flags tools and names that aren't in the CV", () => {
    expect(
      newDetails("Built dashboards in Looker for the sales team", content),
    ).toEqual(["Looker"]);
    expect(newDetails("Automated reports with C++ and dbt", content)).toEqual([
      "C++",
    ]);
    expect(newDetails("Ran A/B tests on pricing", content)).toEqual(["A/B"]);
  });

  it("doesn't flag the capital at the start of a sentence", () => {
    expect(
      newDetails("Streamlined reporting. Delivered dashboards weekly", content),
    ).toEqual([]);
  });

  it("matches plurals both ways", () => {
    const withKpis = writeTarget(
      content,
      { kind: "summary" },
      "Tracked KPIs for retail stores",
    );
    expect(
      newDetails("Defined each KPI with the sales team", withKpis),
    ).toEqual([]);
  });

  it("works in French", () => {
    const fr = writeTarget(
      content,
      { kind: "summary" },
      "Analyste de données, 5 ans dans la distribution, avec SQL et Tableau.",
    );
    expect(
      newDetails("Analyste confirmée : 5 ans de SQL et de Tableau", fr),
    ).toEqual([]);
    expect(
      newDetails("Analyste confirmée : 8 ans chez Carrefour avec SQL", fr),
    ).toEqual(["8", "Carrefour"]);
  });
});
