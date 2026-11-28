import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { runTaskWith } = await import("./run-task-core");
const { ROUTES } = await import("./routing");
const { DAILY_LIMIT } = await import("./limits");
type Deps = import("./run-task-core").RunTaskDeps;
type UsageRow = import("./run-task-core").UsageRow;
type Route = import("./routing").Route;

/** Tests pin their own table, so they don't depend on today's routes. */
function table(model: Route["model"], fallbacks: Route["fallbacks"] = []) {
  return Object.fromEntries(
    Object.entries(ROUTES).map(([task, route]) => [
      task,
      { ...route, model, fallbacks },
    ]),
  ) as Record<keyof typeof ROUTES, Route>;
}

function answer(text: string, input = 1000, output = 200) {
  return {
    content: [{ type: "text" as const, text }],
    finishReason: { unified: "stop" as const, raw: "end_turn" },
    usage: {
      inputTokens: {
        total: input,
        noCache: input,
        cacheRead: 0,
        cacheWrite: 0,
      },
      outputTokens: { total: output, text: output, reasoning: 0 },
    },
    warnings: [],
  };
}

function deps(overrides: Partial<Deps> = {}) {
  const rows: UsageRow[] = [];
  const model = new MockLanguageModelV4({
    doGenerate: answer(JSON.stringify({ text: "done" })),
  });
  const base: Deps = {
    model: () => model,
    instructions: (_ref, text) => text,
    dailyLimit: async () => DAILY_LIMIT.free,
    countOkToday: async () => 0,
    log: async (row) => {
      rows.push(row);
    },
    routes: table("anthropic:claude-haiku-5-5"),
  };
  return { deps: { ...base, ...overrides }, rows, model };
}

const user = { userId: "user-1" };

describe("runTask (decision 0036, spec 26)", () => {
  it("routes to the task's model and returns its validated output", async () => {
    const seen: string[] = [];
    const { deps: d, model } = deps();
    const result = await runTaskWith(
      {
        ...d,
        model: (ref) => {
          seen.push(ref);
          return model;
        },
      },
      "letter.write",
      { text: "Data analyst at Acme, 2021 to 2024." },
      user,
    );
    expect(result).toEqual({ ok: true, data: { text: "done" } });
    expect(seen).toEqual(["anthropic:claude-haiku-5-5"]);
    expect(model.doGenerateCalls[0]?.temperature).toBe(0.5);
  });

  it("writes one usage row with tokens and cost", async () => {
    const { deps: d, rows } = deps();
    await runTaskWith(d, "letter.write", { text: "Some CV" }, user);
    expect(rows).toEqual([
      {
        task: "letter.write",
        provider: "anthropic",
        model: "claude-haiku-5-5",
        inputTokens: 1000,
        outputTokens: 200,
        // 1000 × $0.10/M + 200 × $0.50/M
        costUsd: 0.0002,
        ok: true,
        errorReason: null,
      },
    ]);
  });

  it("strips contact details before the model sees the input", async () => {
    const { deps: d, model } = deps();
    await runTaskWith(
      d,
      "letter.write",
      {
        text: "Aminata Diallo, aminata@example.fr, +33 6 12 34 56 78, 12 rue de la Paix, Paris. Analyst 2019 - 2023.",
      },
      user,
    );
    const sent = JSON.stringify(model.doGenerateCalls[0]?.prompt);
    expect(sent).not.toContain("aminata@example.fr");
    expect(sent).not.toContain("12 34 56 78");
    expect(sent).not.toContain("rue de la Paix");
    expect(sent).toContain("2019 - 2023");
  });

  it("falls back to the next model when a provider errors", async () => {
    const failing = new MockLanguageModelV4({
      doGenerate: async () => {
        throw new Error("overloaded");
      },
    });
    const backup = new MockLanguageModelV4({
      doGenerate: answer(JSON.stringify({ text: "from backup" })),
    });
    const { deps: d, rows } = deps({
      model: (ref) => (ref === "groq:openai/gpt-oss-120b" ? failing : backup),
      routes: table("groq:openai/gpt-oss-120b", ["anthropic:claude-haiku-5-5"]),
    });
    const result = await runTaskWith(d, "job.extract", { text: "Ad" }, user);
    expect(result).toEqual({ ok: true, data: { text: "from backup" } });
    expect(rows).toMatchObject([
      { provider: "groq", ok: false, errorReason: "overloaded" },
      { provider: "anthropic", model: "claude-haiku-5-5", ok: true },
    ]);
  });

  it("returns failed when the output doesn't match its schema", async () => {
    const { deps: d, rows } = deps({
      model: () =>
        new MockLanguageModelV4({
          doGenerate: answer(JSON.stringify({ wrong: 1 })),
        }),
    });
    const result = await runTaskWith(d, "cv.tailor", { text: "CV" }, user);
    expect(result).toEqual({ ok: false, reason: "failed" });
    expect(rows).toMatchObject([{ ok: false, errorReason: "schema" }]);
  });

  it("returns failed, after logging, when every model errors", async () => {
    const { deps: d, rows } = deps({
      model: () =>
        new MockLanguageModelV4({
          doGenerate: async () => {
            throw new Error("timeout");
          },
        }),
    });
    const result = await runTaskWith(d, "cv.tailor", { text: "CV" }, user);
    expect(result).toEqual({ ok: false, reason: "failed" });
    expect(rows).toMatchObject([{ ok: false, errorReason: "timeout" }]);
  });

  it("refuses the 11th call of the day for a free user", async () => {
    const {
      deps: d,
      model,
      rows,
    } = deps({
      countOkToday: async () => DAILY_LIMIT.free,
    });
    const result = await runTaskWith(d, "letter.write", { text: "CV" }, user);
    expect(result).toEqual({ ok: false, reason: "limit" });
    expect(model.doGenerateCalls).toHaveLength(0);
    expect(rows).toHaveLength(0);
  });

  it("allows the 10th call of the day", async () => {
    const { deps: d } = deps({
      countOkToday: async () => DAILY_LIMIT.free - 1,
    });
    const result = await runTaskWith(d, "letter.write", { text: "CV" }, user);
    expect(result.ok).toBe(true);
  });

  it("returns unavailable when no provider has a key", async () => {
    const { deps: d, rows } = deps({ model: () => undefined });
    const result = await runTaskWith(d, "letter.write", { text: "CV" }, user);
    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(rows).toHaveLength(0);
  });

  it("returns failed for an invalid input without calling a model", async () => {
    const { deps: d, model } = deps();
    const result = await runTaskWith(d, "letter.write", { text: "  " }, user);
    expect(result).toEqual({ ok: false, reason: "failed" });
    expect(model.doGenerateCalls).toHaveLength(0);
  });

  it("still returns the result when the usage log fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps: d } = deps({
      log: async () => {
        throw new Error("db down");
      },
    });
    const result = await runTaskWith(d, "letter.write", { text: "CV" }, user);
    expect(result.ok).toBe(true);
  });
});
