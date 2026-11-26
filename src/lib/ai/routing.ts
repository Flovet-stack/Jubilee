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

const HAIKU: ModelRef = "anthropic:claude-haiku-5-5";

/**
 * The one routing table (0036 rule 2). Every task starts on Claude Haiku 5.5;
 * a task moves only when its eval passes on the new model (rule 7). Only
 * approved providers may appear here: today, Anthropic.
 */
export const ROUTES: Record<TaskId, Route> = {
  "cv.import": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 4000,
    temperature: 0,
    timeoutMs: 60_000,
  },
  "job.extract": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 1500,
    temperature: 0,
    timeoutMs: 30_000,
  },
  "cv.tailor": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 3000,
    temperature: 0.3,
    timeoutMs: 60_000,
  },
  "letter.write": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 1500,
    temperature: 0.5,
    timeoutMs: 60_000,
  },
  "cv.translate": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 4000,
    temperature: 0,
    timeoutMs: 60_000,
  },
  "cv.rewrite": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 3000,
    temperature: 0.3,
    timeoutMs: 60_000,
  },
  "email.followup": {
    model: HAIKU,
    fallbacks: [],
    maxOutputTokens: 600,
    temperature: 0.4,
    timeoutMs: 30_000,
  },
};

export function providerOf(ref: ModelRef): string {
  return ref.slice(0, ref.indexOf(":"));
}
