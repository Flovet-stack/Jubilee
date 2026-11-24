import { describe, expect, it } from "vitest";

import { activeNav, parseCollapsed, pathInLocale } from "./logic";

describe("activeNav (0027)", () => {
  it("marks the link for its path in any locale", () => {
    expect(activeNav("/en-us/home")).toBe("home");
    expect(activeNav("/fr-fr/jobs")).toBe("jobs");
    expect(activeNav("/en-gb/to-approve")).toBe("toApprove");
  });

  it("marks the link for paths under it", () => {
    expect(activeNav("/en-us/applications/42")).toBe("applications");
  });

  it("marks nothing for other pages and look-alike paths", () => {
    expect(activeNav("/en-us/cvs/abc")).toBeNull();
    expect(activeNav("/en-us/settings")).toBeNull();
    expect(activeNav("/en-us/jobsearch")).toBeNull();
    expect(activeNav("/en-us")).toBeNull();
  });
});

describe("pathInLocale", () => {
  it("keeps the path when switching locale", () => {
    expect(pathInLocale("/en-us/cvs/abc", "fr-fr")).toBe("/fr-fr/cvs/abc");
    expect(pathInLocale("/fr-fr", "en-gb")).toBe("/en-gb");
  });
});

describe("parseCollapsed", () => {
  it("is collapsed only for the value we write", () => {
    expect(parseCollapsed("1")).toBe(true);
    expect(parseCollapsed(undefined)).toBe(false);
    expect(parseCollapsed("")).toBe(false);
    expect(parseCollapsed("true; drop")).toBe(false);
  });
});
