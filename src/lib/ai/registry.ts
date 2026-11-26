import "server-only";

import {
  createProviderRegistry,
  type Instructions,
  type LanguageModel,
} from "ai";

import { env } from "@/env";

import {
  type AiProvider,
  isProviderId,
  PROVIDERS,
  type ProviderId,
} from "./providers";
import { type ModelRef, providerOf, ROUTES } from "./routing";

/** Each provider's key, from the validated env (server only). */
const KEYS: Record<ProviderId, string | undefined> = {
  anthropic: env.ANTHROPIC_API_KEY,
  groq: env.GROQ_API_KEY,
};

/** Throws if a route names a provider the layer can't build (0036 rule 3). */
export function assertRoutesKnown(routes: typeof ROUTES = ROUTES) {
  for (const [task, route] of Object.entries(routes)) {
    for (const ref of [route.model, ...route.fallbacks]) {
      if (!isProviderId(providerOf(ref))) {
        throw new Error(`AI route ${task} names an unknown provider: ${ref}`);
      }
    }
  }
}

// Fails at startup, and in the registry test, before any request is served.
assertRoutesKnown();

function buildRegistry() {
  // Only providers whose key is set are registered (0036 rule 3).
  const providers: Record<string, AiProvider> = {};
  for (const id of Object.keys(PROVIDERS) as ProviderId[]) {
    const key = KEYS[id];
    if (key) providers[id] = PROVIDERS[id].create(key);
  }
  return {
    ids: new Set(Object.keys(providers)),
    registry: createProviderRegistry(providers),
  };
}

let built: ReturnType<typeof buildRegistry> | null = null;

/** The model for a `provider:model` ref, or undefined without its key. */
export function languageModel(ref: ModelRef): LanguageModel | undefined {
  built ??= buildRegistry();
  if (!built.ids.has(providerOf(ref))) return undefined;
  return built.registry.languageModel(ref);
}

/** A task's instructions, with the provider's own options if it has any. */
export function instructionsFor(ref: ModelRef, text: string): Instructions {
  const id = providerOf(ref);
  if (!isProviderId(id)) return text;
  const entry: { instructions?: (text: string) => Instructions } =
    PROVIDERS[id];
  return entry.instructions?.(text) ?? text;
}
