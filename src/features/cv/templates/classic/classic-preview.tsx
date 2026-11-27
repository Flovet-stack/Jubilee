"use client";

import {
  type CSSProperties,
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import type { CvTree, TreeEntry } from "../../tree";
import { COLOR, MARGIN, PAGE, SPACE, TYPE } from "./constants";
import { carlito } from "./font";
import { type Atom, paginate } from "./paginate";

/**
 * The Classic template as HTML (decisions 0025, 0026), read only from the
 * semantic tree (0024 §3), drawn as paper sheets page by page (0044). The
 * document is laid out once per sheet at its real size in points; each sheet
 * clips its slice, and `paginate()` picks the breaks with the PDF's rules.
 * Breaks are a close estimate: the PDF (0038) sets the real ones.
 */

const PX_PER_PT = 96 / 72;

const pt = (value: number) => `${value}pt`;

const text = (size: number, lineHeight: number): CSSProperties => ({
  fontSize: pt(size),
  lineHeight,
});

type ClassicPreviewProps = {
  tree: CvTree;
  /** Shown in place of the name while it's empty. */
  namePlaceholder: string;
  className?: string;
};

/** Offset of `el` from `root`, in px, ignoring transforms. */
function offsetWithin(el: HTMLElement, root: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * The top margin a block keeps when react-pdf moves it to a new page: its own,
 * plus each enclosing block it opens (an entry, a section), in points.
 */
function gapAbove(el: HTMLElement, root: HTMLElement): number {
  let gap = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    gap += parseFloat(getComputedStyle(node).marginTop) || 0;
    const parent: HTMLElement | null = node.parentElement;
    if (!parent || parent === root || parent.firstElementChild !== node) break;
    node = parent;
  }
  return gap / PX_PER_PT;
}

/**
 * The document's breakable pieces, in points: `data-pg="text"` splits into
 * lines, `"keep"` never splits, `"heading"` wants 40 pt after it (0044).
 */
function measure(root: HTMLElement): Atom[] {
  const atoms: Atom[] = [];
  root.querySelectorAll<HTMLElement>("[data-pg]").forEach((el, group) => {
    const top = offsetWithin(el, root) / PX_PER_PT;
    const height = el.offsetHeight / PX_PER_PT;
    const kind = el.dataset.pg;
    const gap = gapAbove(el, root);
    if (kind === "text") {
      const line = parseFloat(getComputedStyle(el).lineHeight) / PX_PER_PT;
      const count = line > 0 ? Math.max(1, Math.round(height / line)) : 1;
      const step = height / count;
      for (let i = 0; i < count; i++) {
        atoms.push({
          top: top + i * step,
          bottom: top + (i + 1) * step,
          kind: "line",
          group,
          ...(i === 0 && gap ? { gapAbove: gap } : {}),
        });
      }
    } else {
      atoms.push({
        top,
        bottom: top + height,
        kind: kind === "heading" ? "heading" : "keep",
        ...(gap ? { gapAbove: gap } : {}),
      });
    }
  });
  return atoms;
}

export function ClassicPreview({
  tree,
  namePlaceholder,
  className,
}: ClassicPreviewProps) {
  const page = PAGE[tree.paper];
  const perPage = page.height - 2 * MARGIN;
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [layout, setLayout] = useState({ starts: [0], height: 0 });

  useLayoutEffect(() => {
    const outer = frame.current;
    const inner = content.current;
    if (!outer || !inner) return;
    let cancelled = false;
    const update = () => {
      if (cancelled) return;
      setScale(outer.clientWidth / (page.width * PX_PER_PT));
      const starts = paginate(measure(inner), perPage);
      const height = inner.offsetHeight / PX_PER_PT;
      setLayout((prev) =>
        prev.height === height && prev.starts.join() === starts.join()
          ? prev
          : { starts, height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    // Lines rewrap once the CV font has loaded.
    void document.fonts?.ready.then(update);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [tree, page.width, perPage]);

  const sheets = layout.starts.map((start, i) => ({
    start,
    end: layout.starts[i + 1] ?? Math.max(layout.height, start),
  }));

  return (
    <div ref={frame} className={cn("flex w-full flex-col gap-4", className)}>
      {sheets.map(({ start, end }, i) => (
        <div
          key={i}
          style={{ height: page.height * PX_PER_PT * scale }}
          // Sheets after the first are for the eye only: the CV is read once.
          aria-hidden={i > 0 || undefined}
          inert={i > 0 || undefined}
        >
          <div
            className={cn(
              carlito.className,
              "relative origin-top-left bg-paper shadow-paper",
            )}
            style={{
              width: pt(page.width),
              height: pt(page.height),
              transform: `scale(${scale})`,
              color: COLOR.text,
            }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                top: pt(MARGIN),
                left: pt(MARGIN),
                right: pt(MARGIN),
                height: pt(Math.min(end - start, perPage)),
              }}
            >
              <div
                ref={i === 0 ? content : undefined}
                style={{
                  position: "absolute",
                  top: pt(-start),
                  left: 0,
                  right: 0,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                <ClassicDocument
                  tree={tree}
                  namePlaceholder={namePlaceholder}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClassicDocument({
  tree,
  namePlaceholder,
}: {
  tree: CvTree;
  namePlaceholder: string;
}) {
  return (
    <article lang={tree.language === "fr" ? "fr" : "en"}>
      <header data-pg="keep" style={{ paddingBottom: pt(SPACE.belowName) }}>
        <h1
          style={{
            ...text(TYPE.name.size, TYPE.name.lineHeight),
            fontWeight: 700,
            color: tree.name ? COLOR.text : COLOR.rule,
          }}
        >
          {tree.name || namePlaceholder}
        </h1>
        {tree.headline ? (
          <p
            style={{
              ...text(TYPE.headline.size, TYPE.headline.lineHeight),
              color: COLOR.secondary,
            }}
          >
            {tree.headline}
          </p>
        ) : null}
        {tree.contact.length > 0 ? (
          <p style={text(TYPE.contact.size, TYPE.contact.lineHeight)}>
            {tree.contact.join(" · ")}
          </p>
        ) : null}
      </header>

      {tree.summary ? (
        <p
          data-pg="text"
          style={{
            ...text(TYPE.body.size, TYPE.body.lineHeight),
            marginTop: pt(SPACE.belowHeading),
            whiteSpace: "pre-line",
          }}
        >
          {tree.summary}
        </p>
      ) : null}

      {tree.sections.map((section) => (
        <section key={section.id} style={{ marginTop: pt(SPACE.aboveHeading) }}>
          <h2
            data-pg="heading"
            style={{
              ...text(TYPE.heading.size, TYPE.heading.lineHeight),
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: pt(TYPE.heading.letterSpacing),
              borderBottom: `${pt(SPACE.rule)} solid ${COLOR.rule}`,
              paddingBottom: pt(2),
              marginBottom: pt(SPACE.belowHeading),
            }}
          >
            {section.heading}
          </h2>
          {section.layout === "lines"
            ? section.lines.map((line, i) => (
                <p
                  key={i}
                  data-pg="text"
                  style={text(TYPE.body.size, TYPE.body.lineHeight)}
                >
                  {line}
                </p>
              ))
            : section.entries.map((entry, i) => (
                <Entry key={entry.id} entry={entry} first={i === 0} />
              ))}
        </section>
      ))}
    </article>
  );
}

function Corners({
  left,
  right,
  bold,
}: {
  left: string;
  right: string;
  bold?: boolean;
}) {
  if (!left && !right) return null;
  return (
    <p
      style={{
        ...text(TYPE.entry.size, TYPE.entry.lineHeight),
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        columnGap: pt(12),
        color: bold ? COLOR.text : COLOR.secondary,
      }}
    >
      <span style={{ fontWeight: bold ? 700 : 400 }}>{left}</span>
      {right ? (
        <span
          style={{
            marginLeft: "auto",
            color: bold ? COLOR.text : COLOR.secondary,
            fontWeight: 400,
          }}
        >
          {right}
        </span>
      ) : null}
    </p>
  );
}

function Entry({ entry, first }: { entry: TreeEntry; first: boolean }) {
  const hasCorners =
    entry.line1Left || entry.line1Right || entry.line2Left || entry.line2Right;
  return (
    <div style={{ marginTop: first ? 0 : pt(SPACE.betweenEntries) }}>
      {/* The two corner lines stay together on one page, as in the PDF. */}
      {hasCorners ? (
        <div data-pg="keep">
          <Corners left={entry.line1Left} right={entry.line1Right} bold />
          <Corners left={entry.line2Left} right={entry.line2Right} />
        </div>
      ) : null}
      {entry.text.map((paragraph, i) => (
        <p
          key={i}
          data-pg="text"
          style={{
            ...text(TYPE.body.size, TYPE.body.lineHeight),
            whiteSpace: "pre-line",
          }}
        >
          {paragraph}
        </p>
      ))}
      {entry.bullets.length > 0 ? (
        <ul style={{ marginTop: pt(SPACE.betweenBullets) }}>
          {entry.bullets.map((bullet, i) => (
            <Fragment key={i}>
              <li
                data-pg="text"
                style={{
                  ...text(TYPE.body.size, TYPE.body.lineHeight),
                  display: "flex",
                  gap: pt(4),
                  paddingLeft: pt(SPACE.bulletIndent - 4),
                  marginTop: i === 0 ? 0 : pt(SPACE.betweenBullets),
                }}
              >
                <span aria-hidden>•</span>
                <span>{bullet}</span>
              </li>
            </Fragment>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
