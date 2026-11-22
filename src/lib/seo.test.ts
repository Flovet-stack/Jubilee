import { describe, expect, it } from "vitest";

import { alternatesFor } from "./seo";

describe("alternatesFor", () => {
  it("links every locale and an x-default for a page", () => {
    expect(alternatesFor("fr-fr", "/privacy")).toEqual({
      canonical: "/fr-fr/privacy",
      languages: {
        "en-US": "/en-us/privacy",
        "en-GB": "/en-gb/privacy",
        "fr-FR": "/fr-fr/privacy",
        "x-default": "/en-us/privacy",
      },
    });
  });

  it("handles the home page", () => {
    expect(alternatesFor("en-gb")?.canonical).toBe("/en-gb");
  });
});
