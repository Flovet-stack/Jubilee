import { describe, expect, it } from "vitest";

import {
  activeNav,
  CV_SEARCH_FROM,
  cvRowText,
  editedJustNow,
  sidebarCvs,
  matchesCv,
  parseCollapsed,
  pathInLocale,
} from "./logic";

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

describe("cvRowText", () => {
  const untitled = "Untitled resume";
  it("shows the headline, then the name", () => {
    expect(
      cvRowText(
        { headline: "Data analyst", name: "Amina Diallo", title: "CV" },
        untitled,
      ).full,
    ).toBe("Data analyst | Amina Diallo");
  });
  it("falls back to the title, then to untitled, and drops a blank name", () => {
    expect(
      cvRowText({ headline: " ", name: "", title: "My CV" }, untitled),
    ).toEqual({
      primary: "My CV",
      secondary: "",
      full: "My CV",
    });
    expect(
      cvRowText({ headline: "", name: "", title: "" }, untitled).primary,
    ).toBe(untitled);
  });
  it("doesn't repeat a name that equals the headline", () => {
    expect(
      cvRowText({ headline: "Amina", name: "Amina", title: "" }, untitled).full,
    ).toBe("Amina");
  });
});

describe("sidebarCvs (0031)", () => {
  const list = (n: number) => Array.from({ length: n }, (_, i) => i);
  it("shows every resume and no link up to five", () => {
    expect(sidebarCvs(list(0))).toEqual({
      shown: [],
      total: 0,
      viewAll: false,
    });
    expect(sidebarCvs(list(5))).toEqual({
      shown: list(5),
      total: 5,
      viewAll: false,
    });
  });
  it("caps at five and offers View all from six", () => {
    expect(sidebarCvs(list(6))).toEqual({
      shown: list(5),
      total: 6,
      viewAll: true,
    });
    expect(sidebarCvs(list(12)).total).toBe(12);
    expect(CV_SEARCH_FROM).toBe(6);
  });
});

describe("editedJustNow", () => {
  const now = new Date("2026-11-25T12:00:00Z");
  it("is true under a minute and for a time slightly ahead", () => {
    expect(editedJustNow(new Date("2026-11-25T11:59:30Z"), now)).toBe(true);
    expect(editedJustNow(new Date("2026-11-25T12:00:02Z"), now)).toBe(true);
  });
  it("is false from a minute", () => {
    expect(editedJustNow(new Date("2026-11-25T11:59:00Z"), now)).toBe(false);
  });
});

describe("matchesCv", () => {
  const text = cvRowText(
    { headline: "Chargée de communication", name: "Amina Diallo", title: "" },
    "x",
  );
  it("matches any part, ignoring case and accents", () => {
    expect(matchesCv(text, "chargee")).toBe(true);
    expect(matchesCv(text, "DIALLO")).toBe(true);
    expect(matchesCv(text, "  ")).toBe(true);
    expect(matchesCv(text, "engineer")).toBe(false);
  });
});
