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

/**
 * The Classic template as HTML (decisions 0025, 0026), read only from the
 * semantic tree (0024 §3). The paper is drawn at its real size in points and
 * scaled to fit its container. Page breaks are estimates (0024): the PDF
 * (#15) sets the real ones.
 */

const PX_PER_PT = 96 / 72;

const pt = (value: number) => `${value}pt`;

const text = (size: number, lineHeight: number): CSSProperties => ({
  fontSize: pt(size),
  lineHeight,
});

type ClassicPreviewProps = {
  tree: CvTree;
  /** "Page 2 starts about here". */
  pageBreakLabel: (page: number) => string;
  /** Shown in place of the name while it's empty. */
  namePlaceholder: string;
  className?: string;
};

export function ClassicPreview({
  tree,
  pageBreakLabel,
  namePlaceholder,
  className,
}: ClassicPreviewProps) {
  const page = PAGE[tree.paper];
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const outer = frame.current;
    const inner = content.current;
    if (!outer || !inner) return;
    const observer = new ResizeObserver(() => {
      setScale(outer.clientWidth / (page.width * PX_PER_PT));
      setContentHeight(inner.offsetHeight / PX_PER_PT);
    });
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [page.width]);

  // Each page holds its height minus top and bottom margins of content.
  const perPage = page.height - 2 * MARGIN;
  const pages = Math.max(1, Math.ceil(contentHeight / perPage));
  const sheetHeight = pages * page.height;
  const breaks = Array.from({ length: pages - 1 }, (_, i) => i + 1);

  return (
    <div
      ref={frame}
      className={cn("w-full", className)}
      style={{ height: sheetHeight * PX_PER_PT * scale }}
    >
      <div
        className={cn(
          carlito.className,
          "relative origin-top-left bg-paper shadow-paper",
        )}
        style={{
          width: pt(page.width),
          height: pt(sheetHeight),
          transform: `scale(${scale})`,
          color: COLOR.text,
        }}
      >
        <div
          ref={content}
          style={{
            position: "absolute",
            top: pt(MARGIN),
            left: pt(MARGIN),
            right: pt(MARGIN),
            fontFeatureSettings: '"tnum"',
          }}
        >
          <ClassicDocument tree={tree} namePlaceholder={namePlaceholder} />
        </div>
        {breaks.map((n) => (
          <div
            key={n}
            aria-hidden
            className="absolute inset-x-0 flex items-center gap-2 font-sans text-ink-muted"
            style={{ top: pt(MARGIN + n * perPage) }}
          >
            <span className="flex-1 border-t border-dashed border-line" />
            <span className="text-xs">{pageBreakLabel(n + 1)}</span>
            <span className="w-4 border-t border-dashed border-line" />
          </div>
        ))}
      </div>
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
      <header style={{ marginBottom: pt(SPACE.belowName) }}>
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
                <p key={i} style={text(TYPE.body.size, TYPE.body.lineHeight)}>
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
  return (
    <div style={{ marginTop: first ? 0 : pt(SPACE.betweenEntries) }}>
      <Corners left={entry.line1Left} right={entry.line1Right} bold />
      <Corners left={entry.line2Left} right={entry.line2Right} />
      {entry.text.map((paragraph, i) => (
        <p
          key={i}
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
