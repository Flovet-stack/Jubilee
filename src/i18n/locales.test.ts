import { describe, expect, it } from "vitest";

import {
  localeFromAcceptLanguage,
  localeFromCookie,
  localeTag,
} from "./locales";

describe("localeFromAcceptLanguage (decision 0017 table)", () => {
  it.each([
    [null, "en-us"],
    ["", "en-us"],
    ["en", "en-us"],
    ["en-US", "en-us"],
    ["en-CA", "en-us"],
    ["en-GB", "en-gb"],
    ["en-NG", "en-gb"],
    ["en-ZA", "en-gb"],
    ["en-KE", "en-gb"],
    ["en-AU", "en-gb"],
    ["en-IE", "en-gb"],
    ["fr", "fr-fr"],
    ["fr-FR", "fr-fr"],
    ["fr-CM", "fr-fr"],
    ["fr-CA", "fr-fr"],
    ["fr-BE", "fr-fr"],
    ["de-DE", "en-us"],
    ["*", "en-us"],
  ])("%s → %s", (header, locale) => {
    expect(localeFromAcceptLanguage(header)).toBe(locale);
  });

  it("follows quality order, skipping other languages", () => {
    expect(localeFromAcceptLanguage("de-DE, fr;q=0.8")).toBe("fr-fr");
    expect(localeFromAcceptLanguage("en-US;q=0.5, en-GB;q=0.9")).toBe("en-gb");
    expect(localeFromAcceptLanguage("fr-CM,fr;q=0.9,en-US;q=0.8")).toBe(
      "fr-fr",
    );
  });

  it("keeps the header's order for equal qualities", () => {
    expect(localeFromAcceptLanguage("en-GB, fr")).toBe("en-gb");
    expect(localeFromAcceptLanguage("fr, en-GB")).toBe("fr-fr");
  });

  it("ignores entries refused with q=0", () => {
    expect(localeFromAcceptLanguage("fr;q=0, en-GB")).toBe("en-gb");
  });

  it("is case-insensitive and accepts underscores", () => {
    expect(localeFromAcceptLanguage("EN-gb")).toBe("en-gb");
    expect(localeFromAcceptLanguage("en_NG")).toBe("en-gb");
  });
});

describe("localeFromCookie", () => {
  it("reads current and old values, ignores the rest", () => {
    expect(localeFromCookie("en-gb")).toBe("en-gb");
    expect(localeFromCookie("en")).toBe("en-us");
    expect(localeFromCookie("fr")).toBe("fr-fr");
    expect(localeFromCookie("de")).toBeNull();
    expect(localeFromCookie(undefined)).toBeNull();
  });
});

describe("localeTag", () => {
  it("gives BCP 47 tags", () => {
    expect(localeTag("en-gb")).toBe("en-GB");
    expect(localeTag("fr-fr")).toBe("fr-FR");
  });
});
