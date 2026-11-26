import { Document, Page, type Styles, Text, View } from "@react-pdf/renderer";

import type { CvTree, TreeEntry } from "../../tree";
import { COLOR, MARGIN, PAGE, SPACE, TYPE } from "./constants";

/**
 * The Classic template as a PDF (decisions 0025, 0026), read only from the
 * semantic tree (0024 §3) and the same constants as the HTML preview. One
 * column, no page header or footer, real text in Carlito (registered in
 * `../../pdf.tsx`).
 */

export const CARLITO = "Carlito";

type Style = Styles[string];

const text = (size: number, lineHeight: number): Style => ({
  fontSize: size,
  lineHeight,
});

export type ClassicPdfProps = {
  tree: CvTree;
  /** Document metadata (0035): no product name anywhere. */
  meta: { title: string; author: string };
};

export function ClassicPdf({ tree, meta }: ClassicPdfProps) {
  const page = PAGE[tree.paper];
  return (
    <Document
      title={meta.title}
      author={meta.author}
      creator={meta.author}
      producer={meta.author}
      language={tree.language}
    >
      <Page
        size={{ width: page.width, height: page.height }}
        style={{
          padding: MARGIN,
          fontFamily: CARLITO,
          color: COLOR.text,
          ...text(TYPE.body.size, TYPE.body.lineHeight),
        }}
      >
        <View style={{ marginBottom: SPACE.belowName }}>
          {tree.name ? (
            <Text
              style={{
                ...text(TYPE.name.size, TYPE.name.lineHeight),
                fontWeight: 700,
              }}
            >
              {tree.name}
            </Text>
          ) : null}
          {tree.headline ? (
            <Text
              style={{
                ...text(TYPE.headline.size, TYPE.headline.lineHeight),
                color: COLOR.secondary,
              }}
            >
              {tree.headline}
            </Text>
          ) : null}
          {tree.contact.length > 0 ? (
            <Text style={text(TYPE.contact.size, TYPE.contact.lineHeight)}>
              {tree.contact.join(" · ")}
            </Text>
          ) : null}
        </View>

        {tree.summary ? (
          <Text
            style={{
              ...text(TYPE.body.size, TYPE.body.lineHeight),
              marginTop: SPACE.belowHeading,
            }}
          >
            {tree.summary}
          </Text>
        ) : null}

        {tree.sections.map((section) => (
          <View key={section.id} style={{ marginTop: SPACE.aboveHeading }}>
            <Text
              // Never leave a heading alone at the foot of a page.
              minPresenceAhead={40}
              style={{
                ...text(TYPE.heading.size, TYPE.heading.lineHeight),
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: TYPE.heading.letterSpacing,
                borderBottomWidth: SPACE.rule,
                borderBottomColor: COLOR.rule,
                borderBottomStyle: "solid",
                paddingBottom: 2,
                marginBottom: SPACE.belowHeading,
              }}
            >
              {section.heading}
            </Text>
            {section.layout === "lines"
              ? section.lines.map((line, i) => (
                  <Text
                    key={i}
                    style={text(TYPE.body.size, TYPE.body.lineHeight)}
                  >
                    {line}
                  </Text>
                ))
              : section.entries.map((entry, i) => (
                  <Entry key={entry.id} entry={entry} first={i === 0} />
                ))}
          </View>
        ))}
      </Page>
    </Document>
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
  const color = bold ? COLOR.text : COLOR.secondary;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        columnGap: 12,
        ...text(TYPE.entry.size, TYPE.entry.lineHeight),
      }}
    >
      {left ? (
        <Text style={{ fontWeight: bold ? 700 : 400, color, flexShrink: 1 }}>
          {left}
        </Text>
      ) : null}
      {right ? (
        <Text style={{ marginLeft: "auto", color, fontWeight: 400 }}>
          {right}
        </Text>
      ) : null}
    </View>
  );
}

function Entry({ entry, first }: { entry: TreeEntry; first: boolean }) {
  return (
    <View style={{ marginTop: first ? 0 : SPACE.betweenEntries }}>
      {/* The two corner lines stay together on one page. */}
      <View wrap={false}>
        <Corners left={entry.line1Left} right={entry.line1Right} bold />
        <Corners left={entry.line2Left} right={entry.line2Right} />
      </View>
      {entry.text.map((paragraph, i) => (
        <Text key={i} style={text(TYPE.body.size, TYPE.body.lineHeight)}>
          {paragraph}
        </Text>
      ))}
      {entry.bullets.length > 0 ? (
        <View style={{ marginTop: SPACE.betweenBullets }}>
          {entry.bullets.map((bullet, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                paddingLeft: SPACE.bulletIndent - 4,
                marginTop: i === 0 ? 0 : SPACE.betweenBullets,
                ...text(TYPE.body.size, TYPE.body.lineHeight),
              }}
            >
              <Text style={{ width: 4 + 4 }}>•</Text>
              <Text style={{ flex: 1 }}>{bullet}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
