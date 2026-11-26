import "server-only";

import {
  generateText,
  type Instructions,
  type LanguageModel,
  NoObjectGeneratedError,
  Output,
} from "ai";

import { costUsd } from "./pricing";
import { redactDeep } from "./redact";
import { type ModelRef, providerOf, type Route, ROUTES } from "./routing";
import { TASKS, type TaskId, type TaskInput, type TaskOutput } from "./tasks";

export type AiFailure = "limit" | "unavailable" | "failed";

export type AiResult<T> =
  { ok: true; data: T } | { ok: false; reason: AiFailure };

export type UsageRow = {
  task: TaskId;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  ok: boolean;
  errorReason: string | null;
};

/** Everything runTask touches outside itself, so tests can replace it. */
export type RunTaskDeps = {
  model: (ref: ModelRef) => LanguageModel | undefined;
  instructions: (ref: ModelRef, text: string) => Instructions;
  dailyLimit: (userId: string) => Promise<number>;
  countOkToday: (userId: string) => Promise<number>;
  log: (row: UsageRow) => Promise<void>;
  /** The eval script swaps the routing table (decision 0038); the app never does. */
  routes?: Record<TaskId, Route>;
};

type Usage = { inputTokens?: number; outputTokens?: number } | undefined;

function row(
  task: TaskId,
  ref: ModelRef,
  usage: Usage,
  ok: boolean,
  errorReason: string | null,
): UsageRow {
  const inputTokens = usage?.inputTokens ?? 0;
  const outputTokens = usage?.outputTokens ?? 0;
  return {
    task,
    provider: providerOf(ref),
    model: ref.slice(ref.indexOf(":") + 1),
    inputTokens,
    outputTokens,
    costUsd: costUsd(ref, inputTokens, outputTokens),
    ok,
    errorReason: errorReason?.slice(0, 200) ?? null,
  };
}

async function safeLog(deps: RunTaskDeps, usage: UsageRow) {
  try {
    await deps.log(usage);
  } catch (error) {
    // A lost usage row must not lose the user's result.
    console.error("ai_usage log failed", error);
  }
}

/**
 * Validates, strips contact details, checks the daily limit, calls the
 * routed model (then its fallbacks), validates the output and logs one
 * usage row (0036 rules 1, 3, 5, 6, 9). Never throws.
 */
export async function runTaskWith<T extends TaskId>(
  deps: RunTaskDeps,
  taskId: T,
  input: TaskInput<T>,
  { userId }: { userId: string },
): Promise<AiResult<TaskOutput<T>>> {
  const task = TASKS[taskId];
  const route = (deps.routes ?? ROUTES)[taskId];

  const prepared = task.prepare(input, redactDeep);
  if (!prepared) return { ok: false, reason: "failed" };

  const candidates = [route.model, ...route.fallbacks].flatMap((ref) => {
    const model = deps.model(ref);
    return model ? [{ ref, model }] : [];
  });
  if (candidates.length === 0) return { ok: false, reason: "unavailable" };

  try {
    const [used, limit] = await Promise.all([
      deps.countOkToday(userId),
      deps.dailyLimit(userId),
    ]);
    if (used >= limit) return { ok: false, reason: "limit" };
  } catch (error) {
    console.error("ai limit check failed", error);
    return { ok: false, reason: "failed" };
  }

  const { instructions, prompt } = prepared;

  for (const { ref, model } of candidates) {
    try {
      const result = await generateText({
        model,
        instructions: deps.instructions(ref, instructions),
        prompt,
        output: Output.object({ schema: task.output }),
        maxOutputTokens: route.maxOutputTokens,
        temperature: route.temperature,
        timeout: route.timeoutMs,
        maxRetries: 1,
      });
      const output = task.output.safeParse(result.output);
      if (!output.success) {
        await safeLog(deps, row(taskId, ref, result.usage, false, "schema"));
        return { ok: false, reason: "failed" };
      }
      await safeLog(deps, row(taskId, ref, result.usage, true, null));
      return { ok: true, data: output.data as TaskOutput<T> };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        // The model answered in the wrong shape: another model won't help.
        await safeLog(deps, row(taskId, ref, error.usage, false, "schema"));
        return { ok: false, reason: "failed" };
      }
      const message = error instanceof Error ? error.message : String(error);
      // One row per attempt, so a failing provider shows in the log.
      await safeLog(deps, row(taskId, ref, undefined, false, message));
    }
  }

  return { ok: false, reason: "failed" };
}
