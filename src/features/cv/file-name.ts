/**
 * The downloaded PDF's name (decision 0038): "{name} - {word}.pdf", where the
 * word ("Resume", "CV") follows the CV's language and market. Pure, so it's
 * unit-tested and shared by the route and the PDF's title.
 */

const MAX_BASE = 100;

/** Characters no common file system accepts, plus control characters. */
const FORBIDDEN = /[/\\:*?"<>|\u0000-\u001f\u007f]/g;

function clean(value: string): string {
  return value.replace(FORBIDDEN, "").replace(/\s+/g, " ").trim();
}

/** The name without ".pdf", also used as the PDF's title. */
export function pdfBaseName({
  name,
  title,
  word,
}: {
  name: string;
  title: string;
  word: string;
}): string {
  const suffix = clean(word);
  const who = clean(name) || clean(title);
  if (!who) return [...suffix].slice(0, MAX_BASE).join("");
  // Cap the name, not the word, so a long name still ends "- CV".
  const room = Math.max(1, MAX_BASE - [...` - ${suffix}`].length);
  const short = [...who].slice(0, room).join("").trim();
  return `${short} - ${suffix}`;
}

export function pdfFileName(parts: {
  name: string;
  title: string;
  word: string;
}): string {
  return `${pdfBaseName(parts)}.pdf`;
}

/** "é" → "e"; anything else outside printable ASCII is dropped. */
function asciiFallback(fileName: string): string {
  return fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** RFC 5987 value: UTF-8, percent-encoded, with its few extra escapes. */
function encodeRfc5987(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** `attachment` with an ASCII `filename` and the UTF-8 `filename*` (MDN). */
export function contentDisposition(fileName: string): string {
  const ascii = asciiFallback(fileName).replace(/["\\]/g, "") || "download.pdf";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeRfc5987(fileName)}`;
}

/** The file name from a Content-Disposition header, `filename*` first. */
export function fileNameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      // Fall through to the plain name.
    }
  }
  const plain = /filename="([^"]*)"/i.exec(header);
  return plain?.[1] || null;
}
