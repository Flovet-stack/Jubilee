import { describe, expect, it } from "vitest";

import {
  endsBeforeStart,
  formatDay,
  monthFromName,
  parseDay,
  parseMonth,
  parseYear,
} from "./dates";
import {
  defaultCountryFor,
  exampleFor,
  formatNational,
  listCountries,
  matchesCountry,
  parsePhone,
} from "./phone";

describe("parsePhone (0021)", () => {
  it.each([
    ["US", "(201) 555-0123", "+12015550123"],
    ["US", "201.555.0123", "+12015550123"],
    ["GB", "07400 123456", "+447400123456"],
    ["GB", "07400-123-456", "+447400123456"],
    ["FR", "06 12 34 56 78", "+33612345678"],
    ["FR", "06.12.34.56.78", "+33612345678"],
    ["CM", "6 71 23 45 67", "+237671234567"],
  ] as const)("reads %s %s as %s", (country, text, e164) => {
    expect(parsePhone(text, country)).toEqual({
      status: "valid",
      country,
      e164,
    });
  });

  it("switches country for a pasted international number", () => {
    expect(parsePhone("+237 6 71 23 45 67", "FR")).toEqual({
      status: "valid",
      country: "CM",
      e164: "+237671234567",
    });
    expect(parsePhone("0033 6 12 34 56 78", "US")).toMatchObject({
      status: "valid",
      country: "FR",
    });
  });

  it("rejects a number valid elsewhere but not in the chosen country", () => {
    expect(parsePhone("06 12 34 56 78", "GB")).toEqual({
      status: "invalid",
      country: "GB",
    });
  });

  it("treats blank input as empty, and junk as invalid", () => {
    expect(parsePhone("   ", "FR")).toEqual({ status: "empty" });
    expect(parsePhone("12", "FR")).toEqual({
      status: "invalid",
      country: "FR",
    });
  });

  it("shows numbers back in the national format", () => {
    expect(formatNational("+33612345678")).toBe("06 12 34 56 78");
  });

  it("gives an example for error messages", () => {
    expect(exampleFor("FR")).toMatch(/^0\d( \d\d){4}$/);
  });

  it("picks the default country from the locale", () => {
    expect(defaultCountryFor("en-us")).toBe("US");
    expect(defaultCountryFor("en-gb")).toBe("GB");
    expect(defaultCountryFor("fr-fr")).toBe("FR");
  });

  it("names countries in the UI language and searches name or code", () => {
    const fr = listCountries("fr-FR");
    const cm = fr.find((country) => country.code === "CM");
    expect(cm).toMatchObject({ name: "Cameroun", dial: "+237" });
    const ci = fr.find((country) => country.code === "CI");
    expect(ci && matchesCountry(ci, "cote")).toBe(true);
    expect(cm && matchesCountry(cm, "+237")).toBe(true);
    expect(cm && matchesCountry(cm, "23")).toBe(true);
    expect(cm && matchesCountry(cm, "france")).toBe(false);
  });
});

describe("parseDay (0021)", () => {
  it.each([
    ["3/2/2024", "dmy", "2024-02-03"],
    ["03.02.2024", "dmy", "2024-02-03"],
    ["3-2-2024", "dmy", "2024-02-03"],
    ["2/3/2024", "mdy", "2024-02-03"],
    ["3 févr 2024", "dmy", "2024-02-03"],
    ["3 fevrier 2024", "dmy", "2024-02-03"],
    ["3 février 2024", "dmy", "2024-02-03"],
    ["Feb 3 2024", "mdy", "2024-02-03"],
    ["3 february 2024", "dmy", "2024-02-03"],
    ["29/2/2024", "dmy", "2024-02-29"],
  ] as const)("reads %s (%s) as %s", (text, order, value) => {
    expect(parseDay(text, order)).toEqual({ status: "valid", value });
  });

  it("rejects 29 February in a non-leap year", () => {
    expect(parseDay("29/02/2023", "dmy")).toEqual({
      status: "invalid",
      error: "impossible",
    });
  });

  it("rejects incomplete and ambiguous input", () => {
    expect(parseDay("3/2", "dmy")).toMatchObject({ error: "incomplete" });
    expect(parseDay("3 jui 2024", "dmy")).toMatchObject({
      error: "incomplete",
    });
    expect(parseDay("", "dmy")).toEqual({ status: "empty" });
  });

  it("applies min and max", () => {
    expect(parseDay("1/1/2020", "dmy", { min: "2021-01-01" })).toMatchObject({
      error: "beforeMin",
    });
    expect(parseDay("1/1/2030", "dmy", { max: "2026-12-31" })).toMatchObject({
      error: "afterMax",
    });
  });

  it("formats back in the locale's order", () => {
    expect(formatDay("2024-02-03", "dmy")).toBe("03/02/2024");
    expect(formatDay("2024-02-03", "mdy")).toBe("02/03/2024");
  });
});

describe("month and year precision (0016 formats)", () => {
  it("reads a month and a year", () => {
    expect(parseMonth(3, "2021")).toEqual({
      status: "valid",
      value: "2021-03",
    });
  });

  it("asks for the year when only the month is chosen", () => {
    expect(parseMonth(3, "")).toEqual({
      status: "invalid",
      error: "yearMissing",
    });
  });

  it("reads a year on its own", () => {
    expect(parseYear("2019")).toEqual({ status: "valid", value: "2019" });
    expect(parseYear("19")).toMatchObject({ error: "incomplete" });
    expect(parseYear("1850")).toMatchObject({ error: "impossible" });
  });

  it("matches month names only when one month fits", () => {
    expect(monthFromName("sept")).toBe(9);
    expect(monthFromName("Août")).toBe(8);
    expect(monthFromName("jui")).toBeUndefined();
    expect(monthFromName("juil")).toBe(7);
  });

  it("spots an end before its start", () => {
    expect(endsBeforeStart("2022-03", "2021-12")).toBe(true);
    expect(endsBeforeStart("2021-12", "2022-03")).toBe(false);
  });
});
