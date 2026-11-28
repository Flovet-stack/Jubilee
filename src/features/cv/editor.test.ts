import { describe, expect, it } from "vitest";

import {
  defaultTitle,
  emptyEntry,
  firstPassSteps,
  insertByDate,
  move,
  nextFirstPassStep,
  savableContent,
  splitSkills,
  stepStatus,
} from "./editor";
import { contentIssuePaths, emptyCvContent } from "./logic";

let n = 0;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

describe("stepStatus (0024 §1)", () => {
  it("needs a name and an email or phone for Contact", () => {
    const content = emptyCvContent(id);
    expect(stepStatus(content, { type: "contact" })).toBe("todo");
    content.basics.name = "Ada";
    expect(stepStatus(content, { type: "contact" })).toBe("todo");
    content.basics.phone = "+33612345678";
    expect(stepStatus(content, { type: "contact" })).toBe("done");
  });

  it("needs one entry with content in a section, and text in the summary", () => {
    const content = emptyCvContent(id);
    const work = content.sections[0]!;
    expect(stepStatus(content, { type: "section", id: work.id })).toBe("todo");
    if (work.kind !== "work") throw new Error("kind");
    work.entries.push(emptyEntry("work", id));
    expect(stepStatus(content, { type: "section", id: work.id })).toBe("todo");
    work.entries[0]!.position = "Analyst";
    expect(stepStatus(content, { type: "section", id: work.id })).toBe("done");
    expect(stepStatus(content, { type: "summary" })).toBe("todo");
    content.basics.summary = "Hello";
    expect(stepStatus(content, { type: "summary" })).toBe("done");
  });
});

describe("first pass", () => {
  it("goes contact, experience, education, skills, summary, then ends", () => {
    const content = emptyCvContent(id);
    const steps = firstPassSteps(content);
    expect(
      steps.map((s) =>
        s.type === "section"
          ? content.sections.find((x) => x.id === s.id)?.kind
          : s.type,
      ),
    ).toEqual(["contact", "work", "education", "skills", "summary"]);
    expect(nextFirstPassStep(content, { type: "summary" })).toBeNull();
    expect(nextFirstPassStep(content, { type: "contact" })).toEqual(steps[1]);
  });
});

describe("splitSkills", () => {
  it("splits on commas, semicolons and lines, trims and drops duplicates", () => {
    expect(
      splitSkills(" Java,SQL ;  Excel\nsql, ,Project  management"),
    ).toEqual(["Java", "SQL", "Excel", "Project management"]);
  });
});

describe("insertByDate (most recent first)", () => {
  const job = (start?: string, end?: string) => ({
    ...emptyEntry("work", id),
    startDate: start,
    endDate: end,
  });

  it("puts a current job first and an older one after newer ones", () => {
    const list = [job("2019", "2020"), job("2015", "2018")];
    const current = job("2021-01");
    expect(insertByDate(list, current)[0]).toBe(current);
    const middle = job("2018-06", "2019-01");
    expect(insertByDate(list, middle).indexOf(middle)).toBe(1);
  });

  it("adds an entry with no dates at the end", () => {
    const list = [job("2019", "2020")];
    const blank = job();
    expect(insertByDate(list, blank).at(-1)).toBe(blank);
  });
});

describe("move", () => {
  it("moves up and down and ignores moves past the ends", () => {
    expect(move(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(move(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
    expect(move(["a", "b"], 0, -1)).toEqual(["a", "b"]);
  });
});

describe("savableContent (0024 §4: only valid content is saved)", () => {
  it("saves valid content as it is", () => {
    const content = emptyCvContent(id);
    expect(savableContent(content, content, contentIssuePaths)).toEqual({
      content,
      heldBack: 0,
    });
  });

  it("keeps the last saved value of a field with an error", () => {
    const saved = emptyCvContent(id);
    saved.basics.email = "ada@example.com";
    const draft = structuredClone(saved);
    draft.basics.email = "ada@";
    draft.basics.name = "Ada";
    const result = savableContent(draft, saved, contentIssuePaths);
    expect(result?.heldBack).toBe(1);
    expect(result?.content.basics.email).toBe("ada@example.com");
    expect(result?.content.basics.name).toBe("Ada");
  });

  it("drops a new end date before the start, finding the entry by id after a move", () => {
    const saved = emptyCvContent(id);
    const work = saved.sections[0]!;
    if (work.kind !== "work") throw new Error("kind");
    work.entries.push({
      ...emptyEntry("work", id),
      position: "A",
      startDate: "2020",
    });
    const draft = structuredClone(saved);
    draft.sections.reverse();
    const moved = draft.sections.at(-1)!;
    if (moved.kind !== "work") throw new Error("kind");
    moved.entries[0]!.endDate = "2019";
    const result = savableContent(draft, saved, contentIssuePaths);
    expect(result?.heldBack).toBe(1);
    const out = result?.content.sections.at(-1);
    expect(out?.kind === "work" && out.entries[0]?.endDate).toBeUndefined();
  });
});

describe("defaultTitle", () => {
  it("names the CV after the person", () => {
    expect(defaultTitle(" Ada Lovelace ", "CV")).toBe("Ada Lovelace CV");
    expect(defaultTitle("", "Resume")).toBe("Resume");
  });
});

describe("import marks (spec 31)", () => {
  it("opening a section clears only its mark", async () => {
    const { clearImportMark, importKey } = await import("./editor");
    const content = { imported: ["basics", "s1", "s2"] };
    expect(
      clearImportMark(content, importKey({ type: "section", id: "s1" })),
    ).toEqual({
      imported: ["basics", "s2"],
    });
    expect(clearImportMark(content, importKey({ type: "summary" }))).toEqual({
      imported: ["s1", "s2"],
    });
  });

  it("leaves content without marks untouched", async () => {
    const { clearImportMark } = await import("./editor");
    const content = { imported: undefined };
    expect(clearImportMark(content, "s1")).toBe(content);
  });
});
