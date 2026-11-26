import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";

import { emptyEntry } from "./editor";
import { cvFileWord, cvLabels } from "./labels";
import { emptyCvContent } from "./logic";
import { renderCvPdf } from "./pdf";
import type { CvContent, CvLanguage, CvMarket, SectionKind } from "./schemas";
import { buildCvTree, treeText, type CvTree } from "./tree";

/**
 * The ATS check from decision 0016 (spec 23): the PDF's text, extracted with
 * pdf.js as a parser would, holds every string of the tree in reading order,
 * with accents intact.
 */

let n = 0;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const LONG =
  "Led a team of eight across three countries to rebuild the onboarding flow, cutting drop-off by a third and support tickets by half within two quarters.";

function content(language: CvLanguage): CvContent {
  const fr = language === "fr";
  const c = emptyCvContent(id);
  c.basics = {
    ...c.basics,
    name: fr ? "Hélène Dupré-Œillet" : "Amina Diallo",
    headline: fr ? "Chef de projet numérique" : "Product designer",
    email: "person@example.com",
    phone: fr ? "+33612345678" : "+12025550143",
    location: fr
      ? { city: "Nîmes", region: "", countryCode: "FR" }
      : { city: "Austin", region: "TX", countryCode: "US" },
    summary: fr
      ? "Cœur de métier : « faire simple », à l’échelle européenne."
      : "Designs calm tools for busy people.",
    links: [
      { id: id(), label: "", url: "https://www.linkedin.com/in/someone-long" },
    ],
  };
  const kinds: SectionKind[] = [
    "work",
    "education",
    "skills",
    "languages",
    "projects",
    "certificates",
    "awards",
    "volunteer",
    "custom",
  ];
  c.sections = kinds.map((kind) => {
    const base = { id: id(), kind, title: "", hidden: false };
    switch (kind) {
      case "work":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("work", id),
              position: fr ? "Responsable produit" : "Senior designer",
              name: fr ? "Société Générale d’Études" : "Acme Corp",
              location: fr ? "Besançon" : "Remote",
              startDate: "2021-01",
              summary: fr ? "Équipe de 8 personnes." : "Team of eight.",
              highlights: [
                LONG,
                fr ? "Réduit les délais de 30 %" : "Shipped v2",
              ],
            },
          ],
        };
      case "education":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("education", id),
              studyType: fr ? "Master" : "BSc",
              area: fr ? "Ingénierie" : "Design",
              institution: fr ? "École Polytechnique" : "UT Austin",
              startDate: "2014",
              endDate: "2018",
            },
          ],
        };
      case "skills":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("skills", id),
              name: "Tools",
              keywords: ["Figma", "SQL", "TypeScript"],
            },
          ],
        };
      case "languages":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("languages", id),
              language: fr ? "Français" : "English",
              fluency: fr ? "langue maternelle" : "native",
            },
          ],
        };
      case "projects":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("projects", id),
              name: "Jubilee",
              url: "https://example.com/a-very-long-path/that-keeps-going",
              description: fr ? "Un outil de candidature." : "A job tool.",
            },
          ],
        };
      case "certificates":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("certificates", id),
              name: "UX Certificate",
              issuer: "NN/g",
              date: "2022-06",
            },
          ],
        };
      case "awards":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("awards", id),
              title: fr ? "Prix de l’innovation" : "Design award",
              awarder: "Red Dot",
              date: "2020",
            },
          ],
        };
      case "volunteer":
        return {
          ...base,
          kind,
          entries: [
            {
              ...emptyEntry("volunteer", id),
              position: "Mentor",
              organization: fr ? "Association Cœur" : "Code Club",
              startDate: "2019-09",
              endDate: "2020-06",
            },
          ],
        };
      case "custom":
        return {
          ...base,
          kind,
          title: fr ? "Publications" : "Talks",
          entries: [
            {
              ...emptyEntry("custom", id),
              title: fr ? "Conférence à Lyon" : "Config talk",
              subtitle: "2023",
            },
          ],
        };
    }
  }) as CvContent["sections"];
  return c;
}

async function render(language: CvLanguage, market: CvMarket) {
  const tree = buildCvTree(content(language), {
    language,
    market,
    labels: await cvLabels(language),
  });
  const word = await cvFileWord(language, market);
  const result = await renderCvPdf(tree, { title: "Unused title", word });
  return { tree, ...result };
}

async function extract(bytes: Buffer) {
  const task = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
  });
  const pdf = await task.promise;
  const pages: { width: number; height: number }[] = [];
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const [, , width = 0, height = 0] = page.view;
    pages.push({ width, height });
    const text = await page.getTextContent();
    for (const item of text.items) {
      if ("str" in item) parts.push(item.str, item.hasEOL ? " " : "");
    }
  }
  const { info } = (await pdf.getMetadata()) as {
    info: Record<string, unknown>;
  };
  await task.destroy();
  return { text: parts.join("").replace(/\s+/g, " "), pages, info };
}

/** Headings print in capitals (0025), so compare without case. */
const norm = (value: string) =>
  value.replace(/\s+/g, " ").trim().toLocaleUpperCase();

function expectInOrder(text: string, tree: CvTree) {
  const haystack = norm(text);
  let from = 0;
  for (const needle of treeText(tree)) {
    const at = haystack.indexOf(norm(needle), from);
    expect(at, `"${needle}" missing or out of order`).toBeGreaterThanOrEqual(0);
    from = at + norm(needle).length;
  }
}

describe("CV PDF (spec 23)", () => {
  it.each([
    ["en", "US"],
    ["fr", "FR"],
  ] as const)(
    "%s/%s: every field comes out, in order, with no garbled characters",
    async (language, market) => {
      const { tree, bytes } = await render(language, market);
      const { text } = await extract(bytes);
      expect(text).not.toContain("�");
      expectInOrder(text, tree);
      if (language === "fr") {
        for (const word of ["Hélène", "Œillet", "Cœur", "« faire simple »"]) {
          expect(text).toContain(word);
        }
      }
    },
    30_000,
  );

  it("uses Letter for the US and A4 for France (0025)", async () => {
    const us = await extract((await render("en", "US")).bytes);
    const fr = await extract((await render("fr", "FR")).bytes);
    expect(us.pages[0]).toEqual({ width: 612, height: 792 });
    expect(fr.pages[0]?.width).toBeCloseTo(595.28, 1);
    expect(fr.pages[0]?.height).toBeCloseTo(841.89, 1);
  }, 30_000);

  it("names the file after the person and never names Jubilee (0035)", async () => {
    const { bytes, fileName } = await render("en", "US");
    expect(fileName).toBe("Amina Diallo - Resume.pdf");
    const { info } = await extract(bytes);
    expect(info.Title).toBe("Amina Diallo - Resume");
    expect(info.Author).toBe("Amina Diallo");
    const credits = `${String(info.Creator)} ${String(info.Producer)}`;
    expect(credits).not.toMatch(/jubilee|react-pdf/i);
  }, 30_000);

  it("renders an empty CV as one valid page", async () => {
    const tree = buildCvTree(emptyCvContent(id), {
      language: "en",
      market: "US",
      labels: await cvLabels("en"),
    });
    const { bytes, fileName } = await renderCvPdf(tree, {
      title: "",
      word: "Resume",
    });
    expect(fileName).toBe("Resume.pdf");
    const { pages } = await extract(bytes);
    expect(pages).toHaveLength(1);
  }, 30_000);
  it("wraps an over-long URL inside the right margin, losing nothing", async () => {
    const c = emptyCvContent(id);
    const url = `www.example.com/${"a-very-long-path-segment/".repeat(5)}end`;
    c.basics = { ...c.basics, name: "Long Link", summary: url };
    const tree = buildCvTree(c, {
      language: "en",
      market: "US",
      labels: await cvLabels("en"),
    });
    const { bytes } = await renderCvPdf(tree, { title: "", word: "Resume" });
    const task = getDocument({ data: new Uint8Array(bytes) });
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const { items } = await page.getTextContent();
    let right = 0;
    let text = "";
    for (const item of items) {
      if (!("str" in item)) continue;
      text += item.str;
      right = Math.max(right, (item.transform[4] as number) + item.width);
    }
    await task.destroy();
    // react-pdf marks the break with "-" (spec 23, Results); nothing is lost.
    expect(text.replace(/\s+/g, "").replace(/([/?&=])-/g, "$1")).toContain(url);
    expect(right).toBeLessThanOrEqual(612 - 54 + 0.5);
  }, 30_000);
});
