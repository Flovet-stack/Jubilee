import { describe, expect, it } from "vitest";

import en from "./en.json";
import fr from "./fr.json";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message files (decision 0003)", () => {
  it("have the same keys in English and French", () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort());
  });

  it("have no empty strings", () => {
    for (const messages of [en, fr]) {
      for (const key of keys(messages)) {
        const value = key
          .split(".")
          .reduce<unknown>(
            (node, part) => (node as Record<string, unknown>)[part],
            messages,
          );
        expect(value, key).not.toBe("");
      }
    }
  });
});
