import { Be_Vietnam_Pro, Figtree, Geist, Lexend } from "next/font/google";

/*
 * Font-pairing trial (dev only). These fonts load only on /design-system,
 * which 404s in production; the root layout still ships Plus Jakarta Sans
 * (decision 0007). A winning pair needs a new decision before it moves there.
 */
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-trial-figtree",
  display: "swap",
});
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-trial-geist",
  display: "swap",
});
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-trial-be-vietnam",
  display: "swap",
});
const lexend = Lexend({
  subsets: ["latin", "latin-ext"],
  variable: "--font-trial-lexend",
  display: "swap",
});

export const trialFontVariables = [figtree, geist, beVietnam, lexend]
  .map((font) => font.variable)
  .join(" ");
