// `pnpm ai:eval [task]`: runs scripts/ai-eval.ts through Vitest (for the
// "@/" paths and TypeScript), passing the task to run, if one is named.
import { spawnSync } from "node:child_process";

const [task] = process.argv.slice(2);
const result = spawnSync(
  "pnpm",
  ["exec", "vitest", "run", "--config", "vitest.eval.config.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, AI_EVAL_TASK: task ?? "" },
  },
);
process.exit(result.status ?? 1);
