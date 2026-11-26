import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";
import type { SystemModelMessage } from "ai";

/** The Anthropic provider, or undefined when no key is set. */
export function anthropicProvider(apiKey: string | undefined) {
  return apiKey ? createAnthropic({ apiKey }) : undefined;
}

/**
 * Anthropic-only options live here (0036 rule 4). A task's instructions are
 * the stable prefix of every call, so they carry the cache breakpoint.
 */
export function anthropicInstructions(text: string): SystemModelMessage {
  return {
    role: "system",
    content: text,
    providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
  };
}
