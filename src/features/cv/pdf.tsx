import path from "node:path";

import { Font, renderToBuffer } from "@react-pdf/renderer";

import { pdfBaseName } from "./file-name";
import { CARLITO, ClassicPdf } from "./templates/classic/classic-pdf";
import type { CvTree } from "./tree";

/**
 * Renders a CV tree to PDF bytes on the server (decisions 0016, 0025, 0035).
 * No database or request here, so tests call it directly; the route reads
 * the CV and sends the file.
 */

const FONTS = path.join(
  process.cwd(),
  "src/features/cv/templates/classic/fonts",
);

let registered = false;

/** Longer than this, a "word" (a URL, mostly) may not fit on one line. */
const LONG_WORD = 40;

/**
 * Whole words, except over-long ones, which may break after a URL's own
 * separators so they wrap inside the margin instead of running off the page.
 */
export function breakPoints(word: string): string[] {
  if (word.length <= LONG_WORD) return [word];
  return word.split(/(?<=[/?&=])/).filter(Boolean);
}

function registerFonts() {
  if (registered) return;
  Font.register({
    family: CARLITO,
    fonts: [
      { src: path.join(FONTS, "Carlito-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONTS, "Carlito-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // Whole words only (0025): no hyphens for a parser to trip on.
  Font.registerHyphenationCallback(breakPoints);
  registered = true;
}

export async function renderCvPdf(
  tree: CvTree,
  file: { title: string; word: string },
): Promise<{ bytes: Buffer; fileName: string }> {
  registerFonts();
  const base = pdfBaseName({
    name: tree.name,
    title: file.title,
    word: file.word,
  });
  const bytes = await renderToBuffer(
    <ClassicPdf tree={tree} meta={{ title: base, author: tree.name }} />,
  );
  return { bytes, fileName: `${base}.pdf` };
}
