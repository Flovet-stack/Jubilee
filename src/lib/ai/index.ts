import "server-only";

import { getAiDailyLimit } from "./limits";
import { instructionsFor, languageModel } from "./registry";
import { type AiResult, runTaskWith } from "./run-task-core";
import type { TaskId, TaskInput, TaskOutput } from "./tasks";
import { countOkToday, logUsage } from "./usage";

export type { AiFailure, AiResult } from "./run-task-core";
export type { TaskId, TaskInput, TaskOutput } from "./tasks";

/**
 * The one way features call AI (decision 0036). Server only; the user must
 * be signed in, since the usage row is written for them. Show
 * `ai.errors.<reason>` from the message files when it returns `ok: false`.
 */
export function runTask<T extends TaskId>(
  taskId: T,
  input: TaskInput<T>,
  context: { userId: string },
): Promise<AiResult<TaskOutput<T>>> {
  return runTaskWith(
    {
      model: languageModel,
      instructions: instructionsFor,
      dailyLimit: getAiDailyLimit,
      countOkToday,
      log: logUsage,
    },
    taskId,
    input,
    context,
  );
}
