import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { OUR_ICONS } from "./icon-sources";

const dir = join(process.cwd(), "src/components/icons");
const read = (file: string) => readFileSync(join(dir, file), "utf8");

describe("icon sources (0049)", () => {
  it("lists every fallback icon that index.ts exports, and nothing else", () => {
    const ours = [
      ...read("index.ts").matchAll(/^\s*(\w+Icon),$|\{ (\w+Icon) \}/gm),
    ].map((m) => m[1] ?? m[2]);
    expect(new Set(ours)).toEqual(new Set(OUR_ICONS));
  });

  it("wraps every AnimateIcons icon from the Huge set only", () => {
    const huge = read("huge.tsx");
    const imports = [
      ...huge.matchAll(/from "(@animateicons\/react\/[^"]+)"/g),
    ].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(30);
    for (const path of imports)
      expect(path).toMatch(/^@animateicons\/react\/huge\//);
    const exported = [
      ...huge.matchAll(
        /export const (\w+) = fromAnimateIcons\(\s*\w+,\s*"(\w+)",?\s*\)/g,
      ),
    ];
    expect(exported).toHaveLength(imports.length);
    for (const [, name, display] of exported) expect(display).toBe(name);
  });
});
