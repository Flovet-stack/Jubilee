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

/**
 * "Suggest a rewrite" (spec 29, decision 0049): one summary or one bullet,
 * reworded in the CV's language. The proposal card shows it; code checks it
 * for new details before Accept (src/features/cv/rewrite.ts).
 */
export const REWRITE_FINDINGS = [
  "longSummary",
  "bulletsWithoutNumbers",
  "longBullets",
] as const;

const rewriteInput = z.object({
  kind: z.enum(["summary", "bullet"]),
  text: z.string().trim().min(1).max(2000),
  language: z.enum(["en", "fr"]),
  /** The entry's title and employer, for a bullet's context. */
  title: z.string().max(200).optional(),
  employer: z.string().max(200).optional(),
  finding: z.enum(REWRITE_FINDINGS).optional(),
  /** The field's limit; the prompt also aims under the review's limits. */
  maxLength: z.number().int().min(20).max(2000),
});

const rewriteOutput = z.object({
  text: z.string().trim().min(1).max(2000),
  reason: z.string().trim().min(1).max(240),
});

const LANGUAGE_NAME = { en: "English", fr: "French" } as const;

const FINDING_GOAL = {
  longSummary:
    "The summary is too long: bring it to about 600 characters, keeping the most important facts.",
  bulletsWithoutNumbers:
    "The bullet has no number. Never add one. Make the result clearer and stronger, and say in the reason which figure the owner could add if they know it.",
  longBullets:
    "The bullet is too long: bring it to about 200 characters, keeping its facts.",
} as const;

const rewriteTask = defineTask({
  input: rewriteInput,
  output: rewriteOutput,
  buildPrompt: (input): TaskPrompt => {
    const language = LANGUAGE_NAME[input.language];
    const what =
      input.kind === "summary" ? "the summary of a CV" : "one bullet of a CV";
    const context =
      input.kind === "bullet" && (input.title || input.employer)
        ? `The bullet belongs to: ${[input.title, input.employer].filter(Boolean).join(", ")}.
`
        : "";
    return {
      instructions: [
        `You reword ${what} so it reads clearer and stronger to a recruiter.`,
        "Keep every fact exactly as given. Never add a number, percentage, amount, date, tool, skill, company, title, degree or place that is not in the text.",
        "Never invent results or experience. If the text is vague, keep it vague but clearer.",
        input.kind === "bullet"
          ? "Start with a strong past-tense action verb (present tense if the text is about a current role). No first person, no full stop at the end."
          : "Write in the first person without pronouns, as CV summaries usually are, in two to four sentences.",
        `Write the text and the reason in ${language}. The text must stay under ${input.maxLength} characters: aim for about ${Math.round(input.maxLength * 0.85)}.`,
        input.finding ? FINDING_GOAL[input.finding] : "",
        `The reason is one short sentence in ${language} describing the change in the passive or with a noun ("Stronger verb, shorter sentence"), never "I" or "you changed". If it suggests what the owner could add, address them as ${input.language === "fr" ? '"vous"' : '"you"'}.`,
        "If the text can't be improved, return it unchanged and say so in the reason.",
      ]
        .filter(Boolean)
        .join(" "),
      prompt: `${context}Text:
${input.text}`,
    };
  },
});

/**
 * Import (spec 31, decisions 0050, 0052): a LinkedIn profile or a CV, as
 * text, into flat sections. Code adds ids and checks dates before the CV is
 * made (src/features/cv-import/map.ts). Fields are nullable, not optional,
 * for providers with strict schemas (0036).
 */
const s = (max: number) => z.string().max(max).nullable();
const importDates = { startDate: s(20), endDate: s(20) };
const importHighlights = z.array(z.string().max(300)).max(20);

export const importOutput = z.object({
  language: z.enum(["en", "fr"]).nullable(),
  basics: z.object({
    name: s(120),
    headline: s(160),
    city: s(100),
    region: s(100),
    countryCode: s(2),
    summary: s(2000),
  }),
  work: z
    .array(
      z.object({
        position: s(120),
        company: s(120),
        location: s(120),
        ...importDates,
        summary: s(2000),
        highlights: importHighlights,
      }),
    )
    .max(50),
  education: z
    .array(
      z.object({
        institution: s(160),
        degree: s(120),
        area: s(120),
        location: s(120),
        ...importDates,
      }),
    )
    .max(50),
  skills: z.array(z.string().max(60)).max(60),
  languages: z.array(z.object({ language: s(60), fluency: s(60) })).max(20),
  certificates: z
    .array(z.object({ name: s(160), issuer: s(120), date: s(20) }))
    .max(50),
  projects: z
    .array(
      z.object({
        name: s(120),
        description: s(2000),
        ...importDates,
        highlights: importHighlights,
      }),
    )
    .max(50),
  volunteer: z
    .array(
      z.object({
        organization: s(120),
        position: s(120),
        ...importDates,
        summary: s(2000),
      }),
    )
    .max(50),
  /** Parts it found but couldn't place, listed for her, never guessed. */
  unread: z.array(z.string().max(200)).max(20),
});

const importTask = defineTask({
  input: z.object({
    text: sourceText,
    source: z.enum(["linkedin", "upload"]),
    locale: z.enum(["en", "fr"]),
  }),
  output: importOutput,
  buildPrompt: ({ text, source }): TaskPrompt => ({
    instructions: [
      source === "linkedin"
        ? "The text is a LinkedIn profile its owner exported or copied."
        : "The text is a CV its owner uploaded.",
      "Extract it into the given structure, exactly as written.",
      "Use only facts in the text. Never invent or complete an employer, title, date, degree, skill, number or place. Leave a field null when the text doesn't give it.",
      "Keep the text's own language; don't translate. Set language to the language most of the text is in.",
      "Dates: YYYY-MM when a month is given, YYYY when only a year is. endDate is null for a current role (Present, aujourd'hui, en cours).",
      "Map headings in English or French: Experience/Expérience to work, Education/Formation to education, Skills/Compétences and Top Skills to skills, Languages/Langues to languages, Licenses & certifications/Certifications to certificates, Projects/Projets to projects, Volunteering/Bénévolat to volunteer, Summary/About/Résumé/Infos to basics.summary. The headline under the name goes to basics.headline.",
      "Bullet points of a role go to highlights; its paragraph text goes to summary.",
      "Skip page furniture: page numbers, 'Contact', 'Page 1 of 3', profile URLs, 'See more'. Contact details were removed and show as [removed]; ignore them.",
      "Put any other content you can't place in unread as a short label (for example 'Honors: 2 items'). Never put it in another section.",
    ].join(" "),
    prompt: text,
  }),
});

export const TASKS = {
  "cv.import": importTask,
  "job.extract": placeholder("Extract the requirements from this job ad."),
  "cv.tailor": placeholder("Suggest changes that fit this CV to the job."),
  "letter.write": placeholder("Write a cover letter from this CV and job."),
  "cv.translate": placeholder("Translate this CV."),
  "cv.rewrite": rewriteTask,
  "email.followup": placeholder("Draft a short follow-up email."),
} satisfies Record<TaskId, unknown>;

export type TaskInput<T extends TaskId> = z.input<(typeof TASKS)[T]["input"]>;
export type TaskOutput<T extends TaskId> = z.infer<(typeof TASKS)[T]["output"]>;
