import { describe, expect, it } from "vitest";

import { type Atom, paginate } from "./paginate";

/** Lines of one paragraph, `height` points each, from `top`. */
const para = (top: number, count: number, group: number, height = 10) =>
  Array.from({ length: count }, (_, i): Atom => ({
    top: top + i * height,
    bottom: top + (i + 1) * height,
    kind: "line",
    group,
  }));

describe("paginate (0044)", () => {
  it("keeps everything on one page when it fits", () => {
    expect(paginate(para(0, 9, 1), 100)).toEqual([0]);
    expect(paginate([], 100)).toEqual([0]);
  });

  it("breaks a paragraph between lines", () => {
    // 15 lines of 10 pt on 100 pt pages: 10 lines, then 5.
    expect(paginate(para(0, 15, 1), 100)).toEqual([0, 100]);
  });

  it("never leaves a single line at the foot of a page (orphans)", () => {
    // A paragraph starting at 90 would leave one line on page 1.
    const atoms = [...para(0, 9, 1), ...para(90, 5, 2)];
    expect(paginate(atoms, 100)).toEqual([0, 90]);
  });

  it("never carries a single line over (widows)", () => {
    // 11 lines: one would carry over, so two do.
    expect(paginate(para(0, 11, 1), 100)).toEqual([0, 90]);
  });

  it("moves a whole short paragraph when widows would orphan it", () => {
    // 3 lines from 80: 2 fit, 1 carries; moving 1 more leaves 1. Move all.
    const atoms = [...para(0, 8, 1), ...para(80, 3, 2)];
    expect(paginate(atoms, 100)).toEqual([0, 80]);
  });

  it("never splits a keep block", () => {
    const atoms: Atom[] = [
      ...para(0, 8, 1),
      { top: 85, bottom: 110, kind: "keep" },
    ];
    expect(paginate(atoms, 100)).toEqual([0, 85]);
  });

  it("moves a heading on when less than 40 pt would follow it", () => {
    const atoms: Atom[] = [
      ...para(0, 6, 1),
      { top: 64, bottom: 76, kind: "heading" },
      { top: 80, bottom: 110, kind: "keep" },
    ];
    expect(paginate(atoms, 100)).toEqual([0, 64]);
  });

  it("keeps a heading when enough follows it", () => {
    const atoms: Atom[] = [
      { top: 0, bottom: 12, kind: "heading" },
      ...para(14, 15, 1),
    ];
    // 14 + 8 lines = 94 fits; the heading has 80 pt after it.
    expect(paginate(atoms, 100)).toEqual([0, 94]);
  });

  it("cuts a block taller than a page where the page is full", () => {
    const atoms: Atom[] = [{ top: 0, bottom: 250, kind: "keep" }];
    expect(paginate(atoms, 100)).toEqual([0, 100, 200]);
  });

  it("moves a heading on even with a block between it and the break", () => {
    const atoms: Atom[] = [
      ...para(0, 6, 1),
      { top: 60, bottom: 72, kind: "heading" },
      { top: 72, bottom: 84, kind: "keep" },
      ...para(84, 3, 2),
    ];
    // The paragraph would leave 1 line (orphan) and move; the heading would
    // then have 12 pt after it, under 40, so it moves too.
    expect(paginate(atoms, 100)).toEqual([0, 60]);
  });

  it("starts the next page with a moved block's top margin", () => {
    const atoms: Atom[] = [
      ...para(0, 8, 1),
      { top: 88, bottom: 110, kind: "keep", gapAbove: 8 },
    ];
    expect(paginate(atoms, 100)).toEqual([0, 80]);
  });
});
