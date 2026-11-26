import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

import {
  contentDisposition,
  fileNameFromDisposition,
  pdfFileName,
} from "./file-name";

describe("pdfFileName (0038)", () => {
  it("is the name and the word", () => {
    expect(
      pdfFileName({ name: "Amina Diallo", title: "x", word: "Resume" }),
    ).toBe("Amina Diallo - Resume.pdf");
  });

  it("keeps accents", () => {
    expect(pdfFileName({ name: "Hélène Dupré", title: "", word: "CV" })).toBe(
      "Hélène Dupré - CV.pdf",
    );
  });

  it("falls back to the title, then to the word alone", () => {
    expect(
      pdfFileName({ name: "  ", title: "Product designer", word: "CV" }),
    ).toBe("Product designer - CV.pdf");
    expect(pdfFileName({ name: "", title: " ", word: "Resume" })).toBe(
      "Resume.pdf",
    );
  });

  it("removes characters file systems refuse and collapses spaces", () => {
    expect(
      pdfFileName({
        name: 'A/B\\C:D*E?F"G<H>I|J\u0007  K',
        title: "",
        word: "CV",
      }),
    ).toBe("ABCDEFGHIJ K - CV.pdf");
  });

  it("caps the name at 100 characters before .pdf", () => {
    const name = pdfFileName({ name: "é".repeat(200), title: "", word: "CV" });
    expect([...name.replace(/\.pdf$/, "")]).toHaveLength(100);
    expect(name.endsWith(" - CV.pdf")).toBe(true);
  });
});

describe("file word by CV language and market (0017)", () => {
  it("is Resume only for an English CV in the US", () => {
    expect(en.cv.document.fileWord).toEqual({ US: "Resume", FR: "CV" });
    expect(fr.cv.document.fileWord).toEqual({ US: "CV", FR: "CV" });
  });
});

describe("contentDisposition (MDN)", () => {
  it("sends an ASCII name and the UTF-8 name", () => {
    expect(contentDisposition("Hélène Dupré-Œillet - CV.pdf")).toBe(
      "attachment; filename=\"Helene Dupre-OEillet - CV.pdf\"; filename*=UTF-8''H%C3%A9l%C3%A8ne%20Dupr%C3%A9-%C5%92illet%20-%20CV.pdf",
    );
  });

  it("drops what ASCII can't hold", () => {
    expect(contentDisposition("李雷 - CV.pdf")).toContain(
      'filename="- CV.pdf"',
    );
  });

  it("round-trips through the client's parser", () => {
    for (const name of ["Hélène Dupré - CV.pdf", "O'Brien (Jr) - Resume.pdf"]) {
      expect(fileNameFromDisposition(contentDisposition(name))).toBe(name);
    }
  });

  it("reads a plain filename, and nothing from no header", () => {
    expect(fileNameFromDisposition('attachment; filename="a.pdf"')).toBe(
      "a.pdf",
    );
    expect(fileNameFromDisposition(null)).toBeNull();
  });
});
