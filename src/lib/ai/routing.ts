import "server-only";

import type { TaskId } from "./tasks";

/** A model address in the registry: `provider:model`. */
export type ModelRef = `${string}:${string}`;

export type Route = {
  model: ModelRef;
  /** Tried in order when the model's call fails (0036 rule 5). */
  fallbacks: readonly ModelRef[];
  maxOutputTokens: number;
  temperature: number;
  timeoutMs: number;
};

/**
 * The models in use. To switch every task to another model, change
 * DEFAULT_MODEL; to switch one task, give it its own `model` below. Any
 * provider in providers/index.ts can be named, as long as it has a key and
 * a price in pricing.ts.
 *
 * Today (decision 0039): Groq's `gpt-oss-120b` for every task while Jubilee
 * has test users only, with Claude Haiku 5.5 as the fallback when its key is
 * set. Before real users join, a decision picks the production routes.
 */
export const DEFAULT_MODEL: ModelRef = "groq:openai/gpt-oss-120b";
export const DEFAULT_FALLBACKS: readonly ModelRef[] = [
  "anthropic:claude-haiku-5-5",
];

/** Per-task settings; `model` and `fallbacks` default to the above. */
const TASK_SETTINGS: Record<
  TaskId,
  Omit<Route, "model" | "fallbacks"> &
    Partial<Pick<Route, "model" | "fallbacks">>
> = {
  "cv.import": { maxOutputTokens: 4000, temperature: 0, timeoutMs: 60_000 },
  "job.extract": { maxOutputTokens: 1500, temperature: 0, timeoutMs: 30_000 },
  "cv.tailor": { maxOutputTokens: 3000, temperature: 0.3, timeoutMs: 60_000 },
  "letter.write": {
    maxOutputTokens: 1500,
    temperature: 0.5,
    timeoutMs: 60_000,
  },
  "cv.translate": {
    maxOutputTokens: 4000,
    temperature: 0,
    timeoutMs: 60_000,
  },
  "cv.rewrite": { maxOutputTokens: 3000, temperature: 0.3, timeoutMs: 60_000 },
  "email.followup": {
    maxOutputTokens: 600,
    temperature: 0.4,
    timeoutMs: 30_000,
  },
};

/** The one routing table (0036 rule 2). */
export const ROUTES = Object.fromEntries(
  Object.entries(TASK_SETTINGS).map(([task, settings]) => [
    task,
    { model: DEFAULT_MODEL, fallbacks: DEFAULT_FALLBACKS, ...settings },
  ]),
) as Record<TaskId, Route>;

export function providerOf(ref: ModelRef): string {
  return ref.slice(0, ref.indexOf(":"));
}
