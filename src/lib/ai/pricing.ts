import "server-only";

import type { ModelRef } from "./routing";

/** US dollars per million tokens. Add a model here before routing to it. */
export const PRICES: Record<string, { input: number; output: number }> = {
  "anthropic:claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "anthropic:claude-sonnet-5-5": { input: 2, output: 10 },
};

export function costUsd(
  model: ModelRef,
  inputTokens: number,
  outputTokens: number,
): number {
  const price = PRICES[model];
  if (!price) throw new Error(`No price for ${model}: add it to pricing.ts`);
  const cost =
    (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
