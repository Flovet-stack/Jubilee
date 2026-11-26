import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import type { createProviderRegistry, Instructions } from "ai";

import { anthropicInstructions } from "./anthropic";

/**
 * Every provider the AI layer can use (0036 rules 3, 4). Adding one is one
 * entry here, its package, its key in src/env.ts and its prices in
 * pricing.ts; then any route in routing.ts can name it. Each provider's own
 * options (prompt caching and the like) stay inside its entry.
 */
/** Anything the AI SDK's provider registry accepts. */
export type AiProvider = Parameters<typeof createProviderRegistry>[0][string];

export type ProviderEntry = {
  create: (apiKey: string) => AiProvider;
  /** Wraps a task's instructions with provider-only options. */
  instructions?: (text: string) => Instructions;
};

export type ProviderId = "anthropic" | "groq";

export const PROVIDERS: Record<ProviderId, ProviderEntry> = {
  anthropic: {
    create: (apiKey) => createAnthropic({ apiKey }),
    instructions: anthropicInstructions,
  },
  groq: {
    create: (apiKey) => createGroq({ apiKey }),
  },
};

export function isProviderId(id: string): id is ProviderId {
  return Object.hasOwn(PROVIDERS, id);
}
