import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { generate } from "../../../scripts/brand.mjs";

const root = process.cwd();

describe("brand files (spec 32)", () => {
  const files = (generate as (root: string) => Record<string, string>)(root);

  it.each(Object.keys(files))(
    "%s matches docs/design/brand/logo (run `pnpm brand`)",
    (file) => {
      expect(readFileSync(join(root, file), "utf8")).toBe(files[file]);
    },
  );
});
