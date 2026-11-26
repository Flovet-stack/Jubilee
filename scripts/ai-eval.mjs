// `pnpm ai:eval [task]`: runs scripts/ai-eval.ts through Vitest (for the
// "@/" paths and TypeScript), passing the task to run, if one is named.
import { spawnSync } from "node:child_process";

// `pnpm ai:eval [task] [--provider anthropic|groq]` (groq: decision 0040).
const args = process.argv.slice(2);
const at = args.indexOf("--provider");
const provider = at === -1 ? "" : (args[at + 1] ?? "");
const task = args.find((arg, i) => !arg.startsWith("--") && i !== at + 1);
const result = spawnSync(
  "pnpm",
  ["exec", "vitest", "run", "--config", "vitest.eval.config.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      AI_EVAL_TASK: task ?? "",
      AI_EVAL_PROVIDER: provider,
    },
  },
);
process.exit(result.status ?? 1);
