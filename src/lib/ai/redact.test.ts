import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { stripContactDetails } = await import("./redact");

describe("stripContactDetails", () => {
  it("removes LinkedIn profile URLs (spec 31)", () => {
    const out = stripContactDetails(
      "Contact\nwww.linkedin.com/in/jordan-reyes-example (LinkedIn)\nhttps://fr.linkedin.com/in/camille/",
    );
    expect(out).not.toMatch(/linkedin\.com\/in/i);
    expect(out).toContain("[removed] (LinkedIn)");
  });

  it("keeps the word LinkedIn and years", () => {
    expect(stripContactDetails("LinkedIn Learning, 2019 - 2023")).toBe(
      "LinkedIn Learning, 2019 - 2023",
    );
  });
});
