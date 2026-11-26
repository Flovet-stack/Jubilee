/**
 * `pnpm ai:eval [task]` (decision 0036 rule 7, spec 25): runs each task on the
 * made-up fixtures with the real model and prints pass or fail against its
 * output schema, with tokens and cost. Needs ANTHROPIC_API_KEY. Costs money,
 * so it is never part of `pnpm check`. Nothing is written to the database.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { anthropicInstructions, anthropicProvider } =
  await import("@/lib/ai/providers/anthropic");
const { runTaskWith } = await import("@/lib/ai/run-task-core");
const { providerOf } = await import("@/lib/ai/routing");
const { TASK_IDS } = await import("@/lib/ai/tasks");

type TaskId = (typeof TASK_IDS)[number];
type UsageRow = import("@/lib/ai/run-task-core").UsageRow;

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

const anthropic = anthropicProvider(process.env.ANTHROPIC_API_KEY);

describe.runIf(anthropic)("AI eval", () => {
  for (const task of tasks) {
    for (const { name, text } of CASES[task]) {
      it(`${task}: ${name}`, async () => {
        let usage: UsageRow | undefined;
        const result = await runTaskWith(
          {
            model: (ref) =>
              providerOf(ref) === "anthropic"
                ? anthropic?.languageModel(ref.slice(ref.indexOf(":") + 1))
                : undefined,
            instructions: (_ref, value) => anthropicInstructions(value),
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

it.skipIf(anthropic)("needs ANTHROPIC_API_KEY", () => {
  console.log("Set ANTHROPIC_API_KEY in .env.local to run the AI eval.");
});
