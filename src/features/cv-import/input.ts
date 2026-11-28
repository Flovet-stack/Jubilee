import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

/**
 * Reads what she sent (spec 31, 0052): a PDF or pasted text, within the caps
 * Flovet approved. The file stays in memory and is never stored or logged.
 */

export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_PAGES = 10;
export const MAX_PASTE_CHARS = 30_000;
/** Less than this after extraction: a scan or an empty file (no OCR). */
export const MIN_TEXT_CHARS = 200;

export type InputFailure = "too_large" | "not_pdf" | "too_long" | "no_text";

export type ReadInput =
  { ok: true; text: string } | { ok: false; reason: InputFailure };

const isPdf = (bytes: Uint8Array) =>
  bytes.length > 4 &&
  bytes[0] === 0x25 && // %PDF
  bytes[1] === 0x50 &&
  bytes[2] === 0x44 &&
  bytes[3] === 0x46;

/** Line breaks kept (sections), runs of spaces and blank lines folded. */
export function tidy(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function readPaste(raw: string): ReadInput {
  const text = tidy(raw);
  if (text.length > MAX_PASTE_CHARS) return { ok: false, reason: "too_long" };
  if (text.length < MIN_TEXT_CHARS) return { ok: false, reason: "no_text" };
  return { ok: true, text };
}

export async function readPdf(file: File): Promise<ReadInput> {
  if (file.size > MAX_PDF_BYTES) return { ok: false, reason: "too_large" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdf(bytes)) return { ok: false, reason: "not_pdf" };
  try {
    const pdf = await getDocumentProxy(bytes);
    if (pdf.numPages > MAX_PDF_PAGES) {
      return { ok: false, reason: "too_large" };
    }
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = tidy(text);
    if (clean.length < MIN_TEXT_CHARS) return { ok: false, reason: "no_text" };
    // A 10-page PDF can hold more than a paste may: same cap.
    return { ok: true, text: clean.slice(0, MAX_PASTE_CHARS) };
  } catch {
    // Password-protected or corrupt.
    return { ok: false, reason: "not_pdf" };
  }
}
