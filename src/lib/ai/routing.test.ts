import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/env", () => ({
  env: { ANTHROPIC_API_KEY: undefined, GROQ_API_KEY: undefined },
}));

const { DEFAULT_MODEL, ROUTES } = await import("./routing");
const { TASK_IDS } = await import("./tasks");
const { PRICES, costUsd } = await import("./pricing");
const { assertRoutesKnown, languageModel } = await import("./registry");
const { stripContactDetails, REDACTED } = await import("./redact");
const { startOfUtcDay } = await import("./limits");

describe("routing table (0036 rules 2, 3)", () => {
  it("routes every task to the default model, Haiku as fallback (0039)", () => {
    expect(Object.keys(ROUTES).sort()).toEqual([...TASK_IDS].sort());
    for (const route of Object.values(ROUTES)) {
      expect(route.model).toBe(DEFAULT_MODEL);
      expect(route.fallbacks).toEqual(["anthropic:claude-haiku-5-5"]);
    }
  });

  it("names only known providers, each model priced", () => {
    expect(() => assertRoutesKnown()).not.toThrow();
    for (const route of Object.values(ROUTES)) {
      for (const ref of [route.model, ...route.fallbacks]) {
        expect(PRICES[ref]).toBeDefined();
      }
    }
  });

  it("fails on a route to an unknown provider", () => {
    const routes = {
      ...ROUTES,
      "cv.import": { ...ROUTES["cv.import"], model: "mistral:small" as const },
    };
    expect(() => assertRoutesKnown(routes)).toThrow(/unknown provider/);
  });

  it("registers no model without a key", () => {
    expect(languageModel("anthropic:claude-haiku-5-5")).toBeUndefined();
    expect(languageModel("groq:openai/gpt-oss-120b")).toBeUndefined();
  });
});

describe("cost", () => {
  it("prices Haiku 5.5 at $0.10 in and $0.50 out per million", () => {
    expect(costUsd("anthropic:claude-haiku-5-5", 1_000_000, 1_000_000)).toBe(
      0.6,
    );
  });
});

describe("stripContactDetails (0036 rule 9)", () => {
  it.each([
    ["mail: a.diallo+jobs@example.co.uk", "a.diallo"],
    ["Tél. 06.12.34.56.78", "06.12"],
    ["Phone (555) 123-4567", "123-4567"],
    ["Lives at 221B Baker Street, London", "Baker Street"],
    ["12 bis avenue Victor Hugo, Lyon", "Victor Hugo"],
  ])("removes %s", (text, gone) => {
    const out = stripContactDetails(text);
    expect(out).not.toContain(gone);
    expect(out).toContain(REDACTED);
  });

  it.each([
    "Analyst, 2019 - 2023",
    "Grew revenue by 35% across 12 markets",
    "Python, SQL, Power BI",
    "5 years leading the way on pricing, 3 years in first place",
    "Took 2 teams to court rulings and 4 drive tests",
    "Managed 12 stores across the region",
  ])("keeps %s", (text) => {
    expect(stripContactDetails(text)).toBe(text);
  });
});

describe("startOfUtcDay", () => {
  it("counts days in UTC", () => {
    expect(startOfUtcDay(new Date("2026-11-26T23:30:00-05:00"))).toEqual(
      new Date("2026-11-27T00:00:00Z"),
    );
  });
});
