import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// `pnpm ai:eval [task]` (spec 25): calls the real model, so it costs money
// and is never part of `pnpm check`.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["scripts/ai-eval.ts"],
    testTimeout: 120_000,
  },
});
