import { describe, expect, it } from "vitest";

import { site } from "./site";

describe("site", () => {
  it("names the product", () => {
    expect(site.name).toBe("Jubilee");
  });
});
