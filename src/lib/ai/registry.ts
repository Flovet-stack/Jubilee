import "server-only";

import {
  createProviderRegistry,
  type Instructions,
  type LanguageModel,
} from "ai";

import { env } from "@/env";

import {
  anthropicInstructions,
  anthropicProvider,
} from "./providers/anthropic";
import { type ModelRef, providerOf, ROUTES } from "./routing";

/** Every provider the layer can build. Routes may name only these. */
export const KNOWN_PROVIDERS: readonly string[] = ["anthropic"];

/** Throws if a route names a provider the layer can't build (0036 rule 3). */
export function assertRoutesKnown(
  routes: typeof ROUTES = ROUTES,
  known: readonly string[] = KNOWN_PROVIDERS,
) {
  for (const [task, route] of Object.entries(routes)) {
    for (const ref of [route.model, ...route.fallbacks]) {
      if (!known.includes(providerOf(ref))) {
        throw new Error(`AI route ${task} names an unknown provider: ${ref}`);
      }
    }
  }
}

// Fails at startup, and in the registry test, before any request is served.
assertRoutesKnown();

function buildRegistry() {
  const anthropic = anthropicProvider(env.ANTHROPIC_API_KEY);
  // Only providers whose key is set are registered (0036 rule 3).
  return anthropic ? createProviderRegistry({ anthropic }) : undefined;
}

let registry: ReturnType<typeof buildRegistry> | null = null;

function isAnthropicRef(ref: ModelRef): ref is `anthropic:${string}` {
  return providerOf(ref) === "anthropic";
}

/** The model for a `provider:model` ref, or undefined without its key. */
export function languageModel(ref: ModelRef): LanguageModel | undefined {
  if (!isAnthropicRef(ref)) return undefined;
  registry ??= buildRegistry();
  return registry?.languageModel(ref);
}

export function instructionsFor(ref: ModelRef, text: string): Instructions {
  return providerOf(ref) === "anthropic" ? anthropicInstructions(text) : text;
}
