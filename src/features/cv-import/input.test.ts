import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const pdf = { numPages: 1, text: "" };
vi.mock("unpdf", () => ({
  getDocumentProxy: vi.fn(async () => ({ numPages: pdf.numPages })),
  extractText: vi.fn(async () => ({
    totalPages: pdf.numPages,
    text: pdf.text,
  })),
}));

const { readPaste, readPdf, MAX_PDF_BYTES, MAX_PASTE_CHARS } =
  await import("./input");

const pdfFile = (size = 100) => {
  const bytes = new Uint8Array(size);
  bytes.set([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
  return new File([bytes], "profile.pdf", { type: "application/pdf" });
};

const profile =
  "Experience\n" + "Data analyst at Acme, 2021 to 2024. ".repeat(10);

describe("readPdf (spec 31)", () => {
  it("refuses a file over 5 MB", async () => {
    expect(await readPdf(pdfFile(MAX_PDF_BYTES + 1))).toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("refuses a file that isn't a PDF", async () => {
    const file = new File(["hello"], "cv.pdf", { type: "application/pdf" });
    expect(await readPdf(file)).toEqual({ ok: false, reason: "not_pdf" });
  });

  it("refuses more than 10 pages", async () => {
    pdf.numPages = 11;
    expect(await readPdf(pdfFile())).toEqual({
      ok: false,
      reason: "too_large",
    });
    pdf.numPages = 1;
  });

  it("returns no_text for a scan", async () => {
    pdf.text = "Page 1 of 1";
    expect(await readPdf(pdfFile())).toEqual({ ok: false, reason: "no_text" });
  });

  it("returns the tidied text", async () => {
    pdf.text = `  ${profile}\n\n\n\nEducation  `;
    const read = await readPdf(pdfFile());
    expect(read.ok && read.text.endsWith("\n\nEducation")).toBe(true);
  });
});

describe("readPaste", () => {
  it("refuses more than 30,000 characters", () => {
    expect(readPaste("a".repeat(MAX_PASTE_CHARS + 1))).toEqual({
      ok: false,
      reason: "too_long",
    });
  });

  it("returns no_text for a few words", () => {
    expect(readPaste("Aminata")).toEqual({ ok: false, reason: "no_text" });
  });

  it("accepts a profile", () => {
    expect(readPaste(profile).ok).toBe(true);
  });
});
