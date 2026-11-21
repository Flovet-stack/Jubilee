import { describe, expect, it } from "vitest";

import { alternatesFor } from "./seo";

describe("alternatesFor", () => {
  it("links every locale and an x-default for a page", () => {
    expect(alternatesFor("fr", "/privacy")).toEqual({
      canonical: "/fr/privacy",
      languages: {
        en: "/en/privacy",
        fr: "/fr/privacy",
        "x-default": "/en/privacy",
      },
    });
  });

  it("handles the home page", () => {
    expect(alternatesFor("en")?.canonical).toBe("/en");
  });
});
