import "server-only";

import { z } from "zod";

/**
 * The seven AI tasks of decision 0036. Each has its input and output schema
 * and a provider-neutral prompt. These are placeholders: each feature spec
 * (LinkedIn import, tailoring, letters, ...) replaces its task's schemas and
 * prompt. Nothing outside src/lib/ai sees a provider or a model name.
 */
export const TASK_IDS = [
  "cv.import",
  "job.extract",
  "cv.tailor",
  "letter.write",
  "cv.translate",
  "cv.rewrite",
  "email.followup",
] as const;

export type TaskId = (typeof TASK_IDS)[number];

export type TaskPrompt = { instructions: string; prompt: string };

export type TaskDefinition<I extends z.ZodType, O extends z.ZodType> = {
  input: I;
  output: O;
  buildPrompt: (input: z.infer<I>) => TaskPrompt;
};

/**
 * Binds a task's prompt to its own input schema, so runTask can validate and
 * build any task's prompt without knowing its type.
 */
function defineTask<I extends z.ZodType, O extends z.ZodType>(
  definition: TaskDefinition<I, O>,
) {
  return {
    ...definition,
    /** The prompt for a raw input, or null when the input is invalid. */
    prepare(raw: unknown, clean: <V>(value: V) => V): TaskPrompt | null {
      const parsed = definition.input.safeParse(raw);
      return parsed.success ? definition.buildPrompt(clean(parsed.data)) : null;
    },
  };
}

/** Source text the user chose to send, capped well under the model's limit. */
const sourceText = z.string().trim().min(1).max(60_000);

function placeholder(instructions: string) {
  return defineTask({
    input: z.object({ text: sourceText }),
    output: z.object({ text: z.string() }),
    buildPrompt: ({ text }: { text: string }): TaskPrompt => ({
      instructions:
        `${instructions} Use only facts found in the text. Never invent ` +
        "experience, skills, dates, companies, titles or numbers.",
      prompt: text,
    }),
  });
}

export const TASKS = {
  "cv.import": placeholder("Extract the CV from this LinkedIn profile."),
  "job.extract": placeholder("Extract the requirements from this job ad."),
  "cv.tailor": placeholder("Suggest changes that fit this CV to the job."),
  "letter.write": placeholder("Write a cover letter from this CV and job."),
  "cv.translate": placeholder("Translate this CV."),
  "cv.rewrite": placeholder("Suggest clearer wording for this CV."),
  "email.followup": placeholder("Draft a short follow-up email."),
} satisfies Record<TaskId, unknown>;

export type TaskInput<T extends TaskId> = z.input<(typeof TASKS)[T]["input"]>;
export type TaskOutput<T extends TaskId> = z.infer<(typeof TASKS)[T]["output"]>;
