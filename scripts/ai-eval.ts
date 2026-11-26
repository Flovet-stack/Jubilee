/**
 * `pnpm ai:eval [task]` (decision 0036 rule 7, spec 25): runs each task on the
 * made-up fixtures with the real model and prints pass or fail against its
 * output schema, with tokens and cost. Never part of `pnpm check`. Nothing
 * is written to the database.
 *
 * `--provider anthropic` (default) needs ANTHROPIC_API_KEY and costs money.
 * `--provider groq` needs GROQ_API_KEY and runs every task on Groq's free
 * tier (decision 0038): made-up fixtures only, never real user data.
 */
import { readFileSync } from "node:fs";

import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { anthropicInstructions, anthropicProvider } =
  await import("@/lib/ai/providers/anthropic");
const { runTaskWith } = await import("@/lib/ai/run-task-core");
const { ROUTES } = await import("@/lib/ai/routing");
const { TASK_IDS } = await import("@/lib/ai/tasks");

type TaskId = (typeof TASK_IDS)[number];
type UsageRow = import("@/lib/ai/run-task-core").UsageRow;
type Route = import("@/lib/ai/routing").Route;

const fixture = (name: string) =>
  readFileSync(
    new URL(`../src/lib/ai/fixtures/${name}`, import.meta.url),
    "utf8",
  );

const cvEn = fixture("cv-en.txt");
const cvFr = fixture("cv-fr.txt");
const jobFr = fixture("job-fr.txt");

/** Fixture inputs per task. Feature specs replace these with real shapes. */
const CASES: Record<TaskId, { name: string; text: string }[]> = {
  "cv.import": [
    { name: "English CV", text: cvEn },
    { name: "French CV", text: cvFr },
  ],
  "job.extract": [{ name: "French job ad", text: jobFr }],
  "cv.tailor": [{ name: "French CV + job", text: `${cvFr}\n\n${jobFr}` }],
  "letter.write": [{ name: "French CV + job", text: `${cvFr}\n\n${jobFr}` }],
  "cv.translate": [{ name: "French CV to English", text: cvFr }],
  "cv.rewrite": [{ name: "English CV", text: cvEn }],
  "email.followup": [{ name: "French job", text: jobFr }],
};

const only = process.env.AI_EVAL_TASK;
if (only && !TASK_IDS.includes(only as TaskId)) {
  throw new Error(`Unknown task "${only}". One of: ${TASK_IDS.join(", ")}`);
}
const tasks = only ? [only as TaskId] : [...TASK_IDS];

const GROQ_MODEL = "openai/gpt-oss-120b";
const provider = process.env.AI_EVAL_PROVIDER || "anthropic";
if (provider !== "anthropic" && provider !== "groq") {
  throw new Error(`Unknown provider "${provider}". One of: anthropic, groq`);
}

const anthropic = anthropicProvider(process.env.ANTHROPIC_API_KEY);
const groqKey = process.env.GROQ_API_KEY;
const groq = groqKey ? createGroq({ apiKey: groqKey }) : undefined;

/** Groq: every task on one free model, same limits otherwise (0038). */
const onGroq = (route: Route): Route => ({
  ...route,
  model: `groq:${GROQ_MODEL}`,
  fallbacks: [],
});
const routes: Record<TaskId, Route> =
  provider === "groq"
    ? {
        "cv.import": onGroq(ROUTES["cv.import"]),
        "job.extract": onGroq(ROUTES["job.extract"]),
        "cv.tailor": onGroq(ROUTES["cv.tailor"]),
        "letter.write": onGroq(ROUTES["letter.write"]),
        "cv.translate": onGroq(ROUTES["cv.translate"]),
        "cv.rewrite": onGroq(ROUTES["cv.rewrite"]),
        "email.followup": onGroq(ROUTES["email.followup"]),
      }
    : ROUTES;

function model(ref: string): LanguageModel | undefined {
  const id = ref.slice(ref.indexOf(":") + 1);
  if (ref.startsWith("groq:")) return groq?.languageModel(id);
  if (ref.startsWith("anthropic:")) return anthropic?.languageModel(id);
  return undefined;
}

const ready = provider === "groq" ? groq : anthropic;

describe.runIf(ready)(`AI eval on ${provider}`, () => {
  for (const task of tasks) {
    for (const { name, text } of CASES[task]) {
      it(`${task}: ${name}`, async () => {
        let usage: UsageRow | undefined;
        const result = await runTaskWith(
          {
            model,
            instructions: (ref, value) =>
              ref.startsWith("anthropic:")
                ? anthropicInstructions(value)
                : value,
            routes,
            dailyLimit: async () => Infinity,
            countOkToday: async () => 0,
            log: async (row) => {
              usage = row;
            },
          },
          task,
          { text },
          { userId: "eval" },
        );
        console.log(
          `${result.ok ? "PASS" : "FAIL"}  ${task}  ${name}  ` +
            `${usage?.model}  in ${usage?.inputTokens}  out ${usage?.outputTokens}  ` +
            `$${usage?.costUsd.toFixed(6)}` +
            (usage?.errorReason ? `  (${usage.errorReason})` : ""),
        );
        expect(result.ok).toBe(true);
      });
    }
  }
});

it.skipIf(ready)("needs an API key", () => {
  console.log(
    `Set ${provider === "groq" ? "GROQ_API_KEY" : "ANTHROPIC_API_KEY"} in .env.local to run the AI eval.`,
  );
});
