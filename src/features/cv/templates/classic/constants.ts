/**
 * The Classic template's numbers, in points (decisions 0025 and 0026). The
 * HTML preview uses them as CSS `pt`; the react-pdf template (#15) will use
 * the same values.
 */
export const PAGE = {
  letter: { width: 612, height: 792 },
  a4: { width: 595.28, height: 841.89 },
} as const;

export const MARGIN = 54;

export const COLOR = {
  text: "#111111",
  secondary: "#444444",
  rule: "#BBBBBB",
} as const;

export const TYPE = {
  name: { size: 20, lineHeight: 1.15 },
  headline: { size: 11, lineHeight: 1.25 },
  contact: { size: 10, lineHeight: 1.25 },
  heading: { size: 12, lineHeight: 1.2, letterSpacing: 0.5 },
  entry: { size: 10.5, lineHeight: 1.25 },
  body: { size: 10.5, lineHeight: 1.25 },
} as const;

export const SPACE = {
  belowName: 4,
  aboveHeading: 14,
  belowHeading: 6,
  betweenEntries: 8,
  betweenBullets: 2,
  bulletIndent: 10,
  rule: 0.75,
} as const;
