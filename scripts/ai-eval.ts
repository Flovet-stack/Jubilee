/**
 * `pnpm ai:eval [task]` (decision 0036 rule 7, spec 26): runs each task on the
 * made-up fixtures with the real model and prints pass or fail against its
 * output schema, with tokens and cost. Never part of `pnpm check`. Nothing
 * is written to the database.
 *
 * Without a flag it runs the routing table. `--provider groq` or
 * `--provider anthropic` runs every task on that provider (0040). Made-up
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
const { FIELD_MAX, newDetailsIn } = await import("@/features/cv/rewrite");

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
const linkedinEn = fixture("linkedin-en.txt");
const linkedinFr = fixture("linkedin-fr.txt");

type Case = {
  name: string;
  input: unknown;
  /** Extra checks on a successful output: what failed, or null. */
  check?: (output: unknown) => string | null;
};

const text = (name: string, value: string): Case => ({
  name,
  input: { text: value },
});

/** Common short words, to tell English from French in a check. */
const WORDS = {
  en: /(?<!\p{L})(the|and|with|for|of|in|to|on|your|you|from)(?!\p{L})/giu,
  fr: /(?<!\p{L})(le|la|les|des|et|pour|avec|une|dans|du|sur|vous|de)(?!\p{L})/giu,
};
/** "en", "fr", or null when a short text has too few words to tell. */
const languageOf = (value: string) => {
  const fr = value.match(WORDS.fr)?.length ?? 0;
  const en = value.match(WORDS.en)?.length ?? 0;
  if (fr === en) return null;
  return fr > en ? "fr" : "en";
};

type RewriteInput = {
  language: "en" | "fr";
  kind: "summary" | "bullet";
  text: string;
  title?: string;
  employer?: string;
  /** The aim for a "too long" finding, or the field's limit. */
  maxLength: number;
};

/**
 * Spec 29: no new detail (the editor's own check), the CV's language kept,
 * and within the field's
 * limit (a longer text can't be saved). Missing the shorter aim of a "too
 * long" finding is printed, not failed: it's still a suggestion.
 */
const rewriteCases = (
  JSON.parse(fixture("rewrite.json")) as { name: string; input: RewriteInput }[]
).map(({ name, input }): Case => ({
  name,
  input,
  check: (output) => {
    const out = output as { text: string; reason: string };
    const source = [input.text, input.title, input.employer].join("\n");
    const added = newDetailsIn(out.text, source);
    if (added.length > 0) return `new details: ${added.join(", ")}`;
    for (const [part, value] of [
      ["text", out.text],
      ["reason", out.reason],
    ] as const)
      if ((languageOf(value) ?? input.language) !== input.language)
        return `${part} not in ${input.language}`;
    if (out.text.length > FIELD_MAX[input.kind])
      return `too long for the field: ${out.text.length}`;
    if (out.text.length > input.maxLength)
      console.log(`note: ${out.text.length} > aim of ${input.maxLength}`);
    return null;
  },
}));

/**
 * Spec 31: every employer and year in the output is in the source (no
 * invented facts), at least one role and the name were found, and the
 * profile's language is kept.
 */
const importCase = (
  name: string,
  value: string,
  source: "linkedin" | "upload",
  language: "en" | "fr",
): Case => ({
  name,
  input: { text: value, source, locale: language },
  check: (output) => {
    const out = output as {
      language: string | null;
      basics: { name: string | null };
      work: {
        company: string | null;
        startDate: string | null;
        endDate: string | null;
      }[];
    };
    if (!out.basics.name) return "no name";
    if (out.work.length === 0) return "no work";
    for (const w of out.work) {
      if (w.company && !value.includes(w.company))
        return `employer not in source: ${w.company}`;
      for (const d of [w.startDate, w.endDate])
        if (d && !value.includes(d.slice(0, 4)))
          return `year not in source: ${d}`;
    }
    if (out.language !== language) return `language ${out.language}`;
    return null;
  },
});

/** Fixture inputs per task. Feature specs replace these with real shapes. */
const CASES: Record<TaskId, Case[]> = {
  "cv.import": [
    importCase("LinkedIn profile (en)", linkedinEn, "linkedin", "en"),
    importCase("LinkedIn profile (fr)", linkedinFr, "linkedin", "fr"),
    importCase("Uploaded CV (fr)", cvFr, "upload", "fr"),
    importCase("Uploaded CV (en)", cvEn, "upload", "en"),
  ],
  "job.extract": [text("French job ad", jobFr)],
  "cv.tailor": [text("French CV + job", `${cvFr}\n\n${jobFr}`)],
  "letter.write": [text("French CV + job", `${cvFr}\n\n${jobFr}`)],
  "cv.translate": [text("French CV to English", cvFr)],
  "cv.rewrite": rewriteCases,
  "email.followup": [text("French job", jobFr)],
};

const only = process.env.AI_EVAL_TASK;
if (only && !TASK_IDS.includes(only as TaskId)) {
  throw new Error(`Unknown task "${only}". One of: ${TASK_IDS.join(", ")}`);
}
const tasks = only ? [only as TaskId] : [...TASK_IDS];

// `--provider <id>` runs every task on that provider's eval model instead
// of the routing table (decision 0040); without it, the real routes run.
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
    for (const { name, input, check } of CASES[task]) {
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
          // Each task's own input shape; runTask validates it.
          input as never,
          { userId: "eval" },
        );
        const problem = result.ok && check ? check(result.data) : null;
        if (result.ok && check) console.log(result.data);
        console.log(
          `${result.ok && !problem ? "PASS" : "FAIL"}  ${task}  ${name}  ` +
            `${usage?.model}  in ${usage?.inputTokens}  out ${usage?.outputTokens}  ` +
            `$${usage?.costUsd.toFixed(6)}` +
            (usage?.errorReason ? `  (${usage.errorReason})` : "") +
            (problem ? `  (${problem})` : ""),
        );
        expect(result.ok).toBe(true);
        expect(problem).toBeNull();
      });
    }
  }
});

it.skipIf(ready)("needs an API key", () => {
  console.log(
    "Set GROQ_API_KEY or ANTHROPIC_API_KEY in .env.local to run the AI eval.",
  );
});
