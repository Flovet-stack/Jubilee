import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// Decision 0002: only the data-access layer touches Supabase.
const noSupabaseImports = {
  group: ["@/lib/supabase/*", "**/lib/supabase/*"],
  message:
    "Supabase clients are for the data-access layer only: read in features/<feature>/queries.ts, write in actions.ts (decision 0002).",
};

// Decision 0036: features call runTask, never a provider SDK.
const noAiSdkImports = {
  group: ["ai", "ai/*", "@ai-sdk/*"],
  message:
    "AI SDK packages are for src/lib/ai/ only: call runTask from @/lib/ai (decision 0036).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [noSupabaseImports, noAiSdkImports] },
      ],
    },
  },
  {
    // The data-access layer and the proxy, the only code allowed to use them.
    files: [
      "src/proxy.ts",
      "src/lib/supabase/**/*.ts",
      "src/features/**/queries.ts",
      "src/features/**/actions.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noAiSdkImports] }],
    },
  },
  {
    // The AI layer: the only code allowed to use the AI SDK, and its usage
    // log writes through the Supabase server client.
    files: ["src/lib/ai/**/*.ts", "scripts/ai-eval.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/worktrees/**",
    "src/types/database.types.ts",
  ]),
]);

export default eslintConfig;
