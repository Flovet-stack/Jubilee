/**
 * Page breaks for the HTML preview (decision 0044), mirroring the PDF's
 * react-pdf rules in classic-pdf.tsx:
 * - text may break between lines, keeping at least 2 lines on each side
 *   (react-pdf's orphans and widows defaults);
 * - "keep" blocks (an entry's corner lines, the name block) never split
 *   (`wrap={false}`);
 * - a heading moves on when less than 40 pt would follow it on the page
 *   (`minPresenceAhead={40}`).
 * Pure: measured positions in, page start offsets out. All units are points
 * from the top of the content box.
 */

export type Atom = {
  top: number;
  bottom: number;
  kind: "line" | "keep" | "heading";
  /** Lines of one paragraph or bullet share a group, for orphans and widows. */
  group?: number;
  /**
   * The top margin of the block this atom starts. react-pdf keeps a moved
   * block's margin at the top of the next page; only a split block's rest
   * loses it.
   */
  gapAbove?: number;
};

export const MIN_LINES = 2;
export const HEADING_PRESENCE = 40;

/**
 * The y where each page starts (the first is always 0). A page shows
 * `[start[i], start[i + 1])`, which is never taller than `pageHeight`.
 */
export function paginate(atoms: Atom[], pageHeight: number): number[] {
  const starts = [0];
  let start = 0;
  // An atom can force more than one break when it's taller than a page.
  let guard = 0;
  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i]!;
    if (atom.bottom - start <= pageHeight) continue;
    if (++guard > atoms.length * 4 + 100) break;

    let cut = chooseBreak(atoms, i, start);
    // A block moved whole keeps its top margin on the next page.
    const moved = atoms.find((a) => a.top === cut);
    if (moved?.gapAbove) cut = Math.max(start, cut - moved.gapAbove);
    // Nothing earlier fits a break: cut the page where it's full.
    if (cut <= start) cut = start + pageHeight;
    starts.push(cut);
    start = cut;
    // Re-check this atom against the new page.
    i = firstAtomFrom(atoms, cut) - 1;
  }
  return starts;
}

function firstAtomFrom(atoms: Atom[], y: number): number {
  const index = atoms.findIndex((a) => a.bottom > y);
  return index === -1 ? atoms.length : index;
}

/** The break before atom `i` (which overflows), after applying the rules. */
function chooseBreak(atoms: Atom[], i: number, start: number): number {
  const atom = atoms[i]!;
  let cut = atom.top;

  if (atom.kind === "line" && atom.group !== undefined) {
    const lines = groupLines(atoms, atom.group);
    const at = lines.indexOf(i);
    // Lines of this paragraph already on the page, and lines carried over.
    const before = lines.filter((l) => atoms[l]!.top >= start).indexOf(i);
    const after = lines.length - at;
    const wholeOn = before > 0 ? atoms[lines[at - before]!]!.top : cut;
    if (before > 0 && before < MIN_LINES) {
      // Orphans: too few lines would stay; move the paragraph on.
      cut = wholeOn;
    } else if (before > 0 && after < MIN_LINES) {
      // Widows: carry more lines over, unless that orphans the rest.
      const more = MIN_LINES - after;
      cut =
        before - more >= MIN_LINES ? atoms[lines[at - more]!]!.top : wholeOn;
    }
  }

  // A heading needs some of what follows it on the same page, however
  // many blocks sit between it and the break.
  const heading = lastHeadingBefore(atoms, cut, start);
  if (heading && cut - heading.bottom < HEADING_PRESENCE) cut = heading.top;
  return cut;
}

function groupLines(atoms: Atom[], group: number): number[] {
  const out: number[] = [];
  atoms.forEach((a, index) => {
    if (a.kind === "line" && a.group === group) out.push(index);
  });
  return out;
}

function lastHeadingBefore(
  atoms: Atom[],
  y: number,
  start: number,
): Atom | undefined {
  for (let i = atoms.length - 1; i >= 0; i--) {
    const a = atoms[i]!;
    if (a.bottom > y) continue;
    if (a.top < start) return undefined;
    if (a.kind === "heading") return a;
  }
  return undefined;
}
