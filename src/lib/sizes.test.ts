import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Guards decisions 0020 (control heights, 44 px on touch) and 0022 (radius by
 * size) by reading the real tokens in globals.css.
 */
const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

function block(source: string, start: string): string {
  const from = source.indexOf(start);
  if (from === -1) throw new Error(`Missing block: ${start}`);
  const open = source.indexOf("{", from);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(open + 1, i);
  }
  throw new Error(`Unclosed block: ${start}`);
}

function px(source: string, name: string): number | undefined {
  const match = new RegExp(String.raw`--${name}:\s*(\d+)px\s*;`).exec(source);
  return match ? Number(match[1]) : undefined;
}

const touch = block(block(css, "@media (pointer: coarse)"), ":root");

describe("control heights (0020)", () => {
  it.each([
    ["control-h-lg", 48],
    ["control-h", 40],
    ["control-h-sm", 32],
  ])("--%s is %i px with a mouse", (name, value) => {
    expect(px(css, name)).toBe(value);
  });

  it.each(["control-h", "control-h-sm"])(
    "--%s is at least 44 px on touch",
    (name) => {
      expect(px(touch, name)).toBeGreaterThanOrEqual(44);
    },
  );
});

describe("radius by size (0022)", () => {
  it.each([
    ["radius-control-lg", 8],
    ["radius-control", 6],
    ["radius-control-sm", 4],
    ["radius-card", 8],
    ["radius-box", 12],
    ["radius-sheet", 16],
  ])("--%s is %i px", (name, value) => {
    expect(px(css, name)).toBe(value);
  });
});
