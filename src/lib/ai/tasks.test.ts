import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { TASKS } = await import("./tasks");

const keep = <V>(value: V) => value;

describe("cv.rewrite (spec 29)", () => {
  const task = TASKS["cv.rewrite"];
  const bullet = {
    kind: "bullet",
    text: "Made the weekly sales dashboards",
    language: "fr",
    title: "Analyste",
    employer: "Maison Lumière",
    finding: "bulletsWithoutNumbers",
    maxLength: 300,
  };

  it("builds a prompt that forbids new facts and names the language", () => {
    const prompt = task.prepare(bullet, keep);
    expect(prompt).not.toBeNull();
    expect(prompt?.instructions).toContain("Never add a number");
    expect(prompt?.instructions).toContain("in French");
    expect(prompt?.instructions).toContain("Never add one");
    expect(prompt?.instructions).toContain('"vous"');
    expect(prompt?.prompt).toContain("Analyste, Maison Lumière");
    expect(prompt?.prompt).toContain("Made the weekly sales dashboards");
  });

  it("aims a summary under its limit, with no entry context", () => {
    const prompt = task.prepare(
      { kind: "summary", text: "Analyst.", language: "en", maxLength: 600 },
      keep,
    );
    expect(prompt?.instructions).toContain("under 600 characters");
    expect(prompt?.instructions).toContain("in English");
    expect(prompt?.prompt).toBe("Text:\nAnalyst.");
  });

  it("refuses empty text, an unknown finding or language", () => {
    expect(task.prepare({ ...bullet, text: "  " }, keep)).toBeNull();
    expect(task.prepare({ ...bullet, finding: "noSummary" }, keep)).toBeNull();
    expect(task.prepare({ ...bullet, language: "de" }, keep)).toBeNull();
  });

  it("expects a text and a short reason back", () => {
    expect(task.output.safeParse({ text: "New", reason: "Why" }).success).toBe(
      true,
    );
    expect(task.output.safeParse({ text: "", reason: "Why" }).success).toBe(
      false,
    );
    expect(
      task.output.safeParse({ text: "New", reason: "x".repeat(241) }).success,
    ).toBe(false);
  });
});
