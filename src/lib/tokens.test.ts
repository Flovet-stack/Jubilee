import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Guards the contrast promises of decision 0007 by reading the real tokens in
 * globals.css, so a colour edit that breaks WCAG 2.2 AA fails the tests.
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

function hexTokens(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, value] of source.matchAll(
    /--([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi,
  )) {
    if (name && value) out[name] = value;
  }
  return out;
}

const light = hexTokens(block(css, ":root {"));
const dark = {
  ...light,
  ...hexTokens(
    block(block(css, "@media (prefers-color-scheme: dark)"), ":root"),
  ),
};

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

// [foreground, background, minimum ratio]
const TEXT = 4.5;
const UI = 3;
const pairs: [string, string, number][] = [
  ["ink", "card", TEXT],
  ["ink", "well", TEXT],
  ["ink", "tint", TEXT],
  ["ink-muted", "card", TEXT],
  ["ink-muted", "well", TEXT],
  ["ink", "desk", TEXT],
  ["ink-muted", "desk", TEXT],
  ["ink", "menu", TEXT],
  ["ink-muted", "menu", TEXT],
  ["danger", "menu", TEXT],
  ["ink-subtle", "card", TEXT],
  ["ink-subtle", "well", TEXT],
  ["ink-subtle", "tint", TEXT],
  ["violet", "card", TEXT],
  ["violet", "well", TEXT],
  ["on-violet", "violet", TEXT],
  ["on-violet", "violet-press", TEXT],
  ["success", "card", TEXT],
  ["danger", "card", TEXT],
  ["danger", "well", TEXT],
  ["field", "card", UI],
  ["violet", "page", UI],
  ["ink", "marigold", TEXT],
  ["stage-saved", "card", TEXT],
  ["stage-applied", "card", TEXT],
  ["stage-interview", "card", TEXT],
  ["stage-rejected", "card", TEXT],
  ["stage-saved", "well", TEXT],
  ["stage-applied", "well", TEXT],
  ["stage-interview", "well", TEXT],
  ["stage-rejected", "well", TEXT],
];

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("%s theme contrast (0007)", (_theme, tokens) => {
  it.each(pairs)("%s on %s ≥ %s:1", (fg, bg, min) => {
    const a = tokens[fg];
    const b = fg === "ink" && bg === "marigold" ? light.marigold : tokens[bg];
    // Text on marigold is always the light ink (0007: "always with --ink").
    const text = fg === "ink" && bg === "marigold" ? light.ink : a;
    expect(text, `--${fg} is missing`).toBeDefined();
    expect(b, `--${bg} is missing`).toBeDefined();
    expect(contrast(text as string, b as string)).toBeGreaterThanOrEqual(min);
  });
});
