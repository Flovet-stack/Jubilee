/**
 * `pnpm ai:eval [task]` (decision 0036 rule 7, spec 25): runs each task on the
 * made-up fixtures with the real model and prints pass or fail against its
 * output schema, with tokens and cost. Never part of `pnpm check`. Nothing
 * is written to the database.
 *
 * Without a flag it runs the routing table. `--provider groq` or
 * `--provider anthropic` runs every task on that provider (0038). Made-up
 * fixtures only.
 */
import { readFileSync } from "node:fs";

import type { Instructions, LanguageModel } from "ai";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { isProviderId, PROVIDERS } = await import("@/lib/ai/providers");
const { runTaskWith } = await import("@/lib/ai/run-task-core");
const { ROUTES } = await import("@/lib/ai/routing");
const { TASK_IDS } = await import("@/lib/ai/tasks");

type TaskId = (typeof TASK_IDS)[number];
type UsageRow = import("@/lib/ai/run-task-core").UsageRow;
type Route = import("@/lib/ai/routing").Route;
type ModelRef = import("@/lib/ai/routing").ModelRef;
type AiProvider = import("@/lib/ai/providers").AiProvider;

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

// `--provider <id>` runs every task on that provider's eval model instead
// of the routing table (decision 0038); without it, the real routes run.
const EVAL_MODELS: Record<string, string> = {
  anthropic: "claude-haiku-5-5",
  groq: "openai/gpt-oss-120b",
};
const override = process.env.AI_EVAL_PROVIDER || "";
if (override && !EVAL_MODELS[override]) {
  throw new Error(
    `Unknown provider "${override}". One of: ${Object.keys(EVAL_MODELS).join(", ")}`,
  );
}

const KEYS: Record<string, string | undefined> = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  groq: process.env.GROQ_API_KEY,
};
const built: Record<string, AiProvider> = {};
for (const [id, entry] of Object.entries(PROVIDERS)) {
  const key = KEYS[id];
  if (key) built[id] = entry.create(key);
}

const evalModel: ModelRef = `${override}:${EVAL_MODELS[override] ?? ""}`;
const routes: Record<TaskId, Route> = { ...ROUTES };
if (override) {
  for (const task of TASK_IDS) {
    routes[task] = { ...ROUTES[task], model: evalModel, fallbacks: [] };
  }
}

function model(ref: string): LanguageModel | undefined {
  const id = ref.slice(0, ref.indexOf(":"));
  return built[id]?.languageModel(ref.slice(id.length + 1));
}

function instructions(ref: string, text: string): Instructions {
  const id = ref.slice(0, ref.indexOf(":"));
  return isProviderId(id) ? (PROVIDERS[id].instructions?.(text) ?? text) : text;
}

const ready = Object.keys(built).length > 0;
const label = override || "routing table";

describe.runIf(ready)(`AI eval on ${label}`, () => {
  for (const task of tasks) {
    for (const { name, text } of CASES[task]) {
      it(`${task}: ${name}`, async () => {
        let usage: UsageRow | undefined;
        const result = await runTaskWith(
          {
            model,
            instructions,
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
    "Set GROQ_API_KEY or ANTHROPIC_API_KEY in .env.local to run the AI eval.",
  );
});
