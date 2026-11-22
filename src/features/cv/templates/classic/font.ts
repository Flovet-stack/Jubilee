import localFont from "next/font/local";

/**
 * Carlito (OFL, Calibri's metrics) for the Classic preview (decision 0025):
 * Regular and Bold only, as Latin, Latin-1 and Latin Extended-A WOFF2
 * subsets (about 37 KB each). Imported only by the CV editor, so no other
 * page loads it. The PDF (#15) embeds the full TTFs instead.
 */
export const carlito = localFont({
  src: [
    {
      path: "./fonts/carlito-regular-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/carlito-bold-latin.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-carlito",
  display: "swap",
  adjustFontFallback: "Arial",
});
