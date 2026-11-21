import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // next-intl's ESM imports "next/server" without an extension, which Node
    // can't resolve; inlining lets Vite resolve it (src/proxy.test.ts).
    server: { deps: { inline: ["next-intl"] } },
  },
});
