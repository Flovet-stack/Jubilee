import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

// Decision 0002: the lint rule, checked against real file paths.
const eslint = new ESLint();
const source = `import { createClient } from "@/lib/supabase/server";\nexport const client = createClient;\n`;

async function ruleIds(filePath: string) {
  const [result] = await eslint.lintText(source, { filePath });
  return (result?.messages ?? []).map((m) => m.ruleId);
}

describe("Supabase import boundary", () => {
  // Loading the ESLint config cold takes over a minute on slow machines.
  beforeAll(() => ruleIds("src/lib/warm-up.ts"), 300_000);

  it("fails a component that imports a Supabase client", async () => {
    expect(await ruleIds("src/components/example.tsx")).toContain(
      "no-restricted-imports",
    );
  });

  it("fails a feature component", async () => {
    expect(await ruleIds("src/features/cv/components/editor.tsx")).toContain(
      "no-restricted-imports",
    );
  });

  it("allows a feature's queries.ts and actions.ts", async () => {
    expect(await ruleIds("src/features/cv/queries.ts")).not.toContain(
      "no-restricted-imports",
    );
    expect(await ruleIds("src/features/cv/actions.ts")).not.toContain(
      "no-restricted-imports",
    );
  });
}, 60_000);

// Decision 0036: only src/lib/ai may use the AI SDK; features call runTask.
const aiSource = `import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
export const x = [generateText, anthropic];
`;

async function aiRuleIds(filePath: string) {
  const [result] = await eslint.lintText(aiSource, { filePath });
  return (result?.messages ?? []).map((m) => m.ruleId);
}

describe("AI SDK import boundary", () => {
  it("fails a feature action that imports the AI SDK", async () => {
    expect(await aiRuleIds("src/features/cv/actions.ts")).toContain(
      "no-restricted-imports",
    );
  });

  it("fails a component that imports the AI SDK", async () => {
    expect(await aiRuleIds("src/components/example.tsx")).toContain(
      "no-restricted-imports",
    );
  });

  it("allows src/lib/ai", async () => {
    expect(await aiRuleIds("src/lib/ai/run-task-core.ts")).not.toContain(
      "no-restricted-imports",
    );
  });
}, 300_000);
