import { describe, expect, it } from "vitest";

import { loadMessages, mergeMessages } from "@/i18n/messages";

import enGB from "./en-GB.json";
import en from "./en.json";
import fr from "./fr.json";

/** Every leaf path; list items count by index, as overrides name them. */
function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function at(messages: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown>)[part],
      messages,
    );
}

describe("base message files (decision 0017)", () => {
  it("have the same keys in English and French", () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort());
  });

  it("have no empty strings", () => {
    for (const messages of [en, fr, enGB]) {
      for (const key of keys(messages)) {
        expect(at(messages, key), key).not.toBe("");
      }
    }
  });
});

describe("regional overrides", () => {
  it("only override keys that exist in their base", () => {
    const base = new Set(keys(en));
    for (const key of keys(enGB)) expect(base.has(key), key).toBe(true);
  });

  it("merged en-GB has every base key, with the override's words", async () => {
    const merged = await loadMessages("en-gb");
    expect(keys(merged).sort()).toEqual(keys(en).sort());
    expect(at(merged, "home.description")).toContain("CVs");
    expect(at(merged, "auth.errors.cancelled")).toContain("cancelled");
  });

  it("en-US says resume, US spelling", async () => {
    const messages = await loadMessages("en-us");
    expect(at(messages, "home.description")).toContain("resumes");
    expect(at(messages, "auth.errors.cancelled")).toContain("canceled");
  });

  it("fr-FR is the French base", async () => {
    expect(await loadMessages("fr-fr")).toEqual(fr);
  });
});

describe("mergeMessages", () => {
  it("merges objects key by key", () => {
    expect(
      mergeMessages({ a: "1", b: { c: "2", d: "3" } }, { b: { d: "x" } }),
    ).toEqual({ a: "1", b: { c: "2", d: "x" } });
  });

  it("overrides list items by index, leaving the rest", () => {
    expect(
      mergeMessages(
        { blocks: ["a", { list: ["b", "c"] }] },
        {
          blocks: { "1": { list: { "1": "z" } } },
        },
      ),
    ).toEqual({ blocks: ["a", { list: ["b", "z"] }] });
  });

  it("does not change the base", () => {
    const base = { a: ["x"] };
    mergeMessages(base, { a: { "0": "y" } });
    expect(base).toEqual({ a: ["x"] });
  });
});
