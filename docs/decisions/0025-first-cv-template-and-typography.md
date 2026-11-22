# 0025: The first CV template and its typography

- **Status:** Approved; entry lines and body line height superseded by [0026](0026-cv-entry-layout.md)
- **Proposed:** 2026-11-22 by the product team (roles: UI, Copy, Frontend, Product, Tech Lead)
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Supersedes:** none. Fills the "CV templates and their typography" row in the README's "Still to decide", for the first template only.
- **Specs:** [specs/14-cv-builder.md](../../specs/14-cv-builder.md)

## Context

0024 draws the CV preview in HTML from one semantic tree, and #15 will render the same tree to PDF with react-pdf (0016). Both need one layout and one font, decided before #14 is specced. 0016 already fixes the constraints:

- one column;
- contact details in the body, not in a page header or footer;
- standard section headings in the CV's language;
- real text with embedded static TTF fonts.

Brief: the CV must be "clean, ATS-readable", with "no tables or graphics". The design brief (§5) left "the CV templates and their typography (ATS rules)" to its own decision, and its principle 1 says the user's document leads.

Country rules (photo, date of birth, date style, length) belong to #13 and are not decided here. This template is neutral and has slots that #13 can fill.

## Research

| Reference                                      | What they say or do                                                                                                                                                                                                                                                                  | Adopt / adapt / reject    | Why                                                                                                                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jobscan, best resume fonts (2026)              | Calibri, Arial and Georgia are "the safest all-around picks". Body "10–12 pt", headings "14–16 pt", name "around 18–22 pt". Avoid decorative, condensed and uncommon fonts. "Circles and dashes scan cleanly" for bullets                                                            | **Adopt** (sizes adapted) | The clearest numbers we found. Calibri itself can't be embedded (it's licensed), so we use a free font with the same metrics. Headings at 12 pt bold caps read as headings without taking the space 14–16 pt would on a one-page CV |
| Jobscan, ATS formatting mistakes (2026)        | One column; no tables, charts, skill bars or images; contact details in the main body, not the header or footer; text labels, not icons; standard headings ("Work Experience", "Education", "Skills"); dates like "Jan 2021 – Mar 2023", never "Jan '21"; PDF unless asked otherwise | **Adopt**                 | Matches 0016 and becomes the template's rules and #15's tests                                                                                                                                                                       |
| Harvard FAS, Create a strong resume            | "Be consistent in format and content"; balance white space; reverse chronological order; don't include a picture, don't "Start each line with a date"                                                                                                                                | **Adopt**                 | Dates go to the right of the title line, never at the start of a line                                                                                                                                                               |
| Margin guides (Jobscan, Resume.io, others)     | 1 inch is the usual default; never below 0.5 inch. Line spacing 1.0–1.15 (Resume.io, Resume Worded), or 120–150% (Teal)                                                                                                                                                              | **Adapt**                 | 0.75 inch (54 pt) gives room for a one-page CV and stays well above the floor. A line height of 1.25 suits Carlito's tall x-height; the 1.15 advice assumes Word's single spacing, which already includes the font's line gap       |
| French CV guides (Enhancv FR, Jobrise, others) | One column; classic fonts (Arial, Calibri, Helvetica, Garamond); PDF; margins of 1.25–2.5 cm; body 10–12; one page under about 10 years of experience. No APEC or Welcome to the Jungle page could be read                                                                           | **Adopt**, with a caveat  | They agree with the US guidance, so one template serves both markets on A4 or Letter. They're CV-tool vendors, not official sources; French-specific rules wait for #13                                                             |
| react-pdf fonts (v4 docs)                      | "only TTF and WOFF fonts files are supported"; variable fonts don't work properly; a style that isn't registered "will fail"; built-in Helvetica, Times and Courier have no OpenType features; hyphenation callback per font, on by default for English                              | **Adopt**                 | Rules out variable fonts (for example Arimo, the Arial-metric font, which Google Fonts ships only as variable). We register exactly the weights the template uses, and switch hyphenation off so words stay whole for parsers       |
| OpenResume font notes (code)                   | Offers Roboto, Lato, Montserrat, Open Sans, Raleway and five serifs. Warns that "most font family doesn't work with React PDF out of box": text looks right but copies as different characters, unless the font is re-exported                                                       | **Adopt the warning**     | Our extraction test (#15, pdf.js) must check the chosen font with English and French text, and the fallback is named here                                                                                                           |
| Reactive Resume (code)                         | About 20 templates in `packages/pdf/src/templates`, each with a `semantic.ts` that maps the shared tree to its layout, plus font subsetting                                                                                                                                          | **Adopt the shape**       | One template folder that reads the semantic tree from 0024; later templates add folders without touching the tree                                                                                                                   |
| Carlito (Google Fonts, `ofl/carlito`)          | Static TTFs: Regular, Bold, Italic, Bold Italic (613, 666, 600, 789 KB). OFL. By Łukasz Dziedzic (Lato's designer), built to the same metrics as Calibri                                                                                                                             | **Adopt**                 | Looks and measures like Jobscan's top pick; free to embed; full Latin, so French accents and œ are covered; static files work in react-pdf. Only Regular and Bold are needed                                                        |

Sources (opened 2026-11-22):

- https://www.jobscan.co/blog/best-fonts-resume-ats-recruiter/
- https://www.jobscan.co/blog/ats-formatting-mistakes/
- https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/
- https://react-pdf.org/fonts
- Search results only, pages not read in full: https://www.jobscan.co/blog/how-to-set-resume-margins/, https://resume.io/blog/resume-margins, https://resume.io/blog/resume-spacing, https://resumeworded.com/blog/resume-margins, https://enhancv.com/fr/blog/mise-en-page-cv/, https://jobrise.io/fr/blog/cv-passer-ats-france-2026/
- OpenResume code: `src/app/components/fonts/constants.ts`, `src/app/components/Resume/ResumePDF/styles.ts` in https://github.com/xitanggg/open-resume
- Reactive Resume code: `packages/pdf/src/templates/` in https://github.com/amruthpillai/reactive-resume
- Google Fonts: `ofl/carlito` and `ofl/arimo` in https://github.com/google/fonts

Failed:

- https://www.jobscan.co/blog/best-resume-fonts/ (404)
- https://www.tealhq.com/post/resume-font (403)
- https://www.apec.fr/candidat/mes-outils-candidat/ (403)
- https://www.welcometothejungle.com/fr/articles/mise-en-page-cv (no article content)

## Options

1. **Built-in Helvetica or Times:** nothing to embed. But 0016 asks for embedded fonts, the faces have no OpenType features, and the HTML preview would show a different font on Android (no Helvetica or Arial there).
2. **Plus Jakarta Sans, the brand font:** already in the app. But the CV is the user's document, not ours; the font is geometric and less "classic" than the ATS guides advise; and a branded CV would mark every applicant as a Jubilee user.
3. **Carlito:** Calibri's look and metrics, OFL, with static TTFs. The fallback is **Liberation Sans** (Arial metrics; static TTFs, OFL), if #15's extraction test fails for Carlito.
4. **A serif (for example Gelasio, metric-compatible with Georgia):** fine for ATS, but heavier on a phone screen at preview scale. It's a choice for a second template later.

## Decision

**Option 3: one template, "Classic", set in Carlito.**

### Page

| Item         | Value                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Paper        | US Letter for the US market, A4 for France (from the CV's `market`)                                                       |
| Margins      | 54 pt (0.75 in, 19 mm) on every side                                                                                      |
| Columns      | One. No tables, text boxes, icons, images, bars or page header and footer. No photo (until #13 asks)                      |
| Colour       | Text `#111111`. Secondary text (dates, locations, headline) `#444444`. Heading rules `#BBBBBB`, 0.75 pt. No accent colour |
| Alignment    | Left. No justification, no hyphenation (react-pdf callback returns the whole word)                                        |
| Page numbers | None (footers are often dropped by ATS anyway)                                                                            |
| Length       | Flows to as many pages as the content needs. The preview marks approximate page breaks (0024)                             |

### Type (Carlito Regular 400 and Bold 700 only)

| Element                           | Size / line height | Style                                                |
| --------------------------------- | ------------------ | ---------------------------------------------------- |
| Name                              | 20 pt / 1.15       | Bold                                                 |
| Headline                          | 11 pt / 1.25       | Regular, secondary colour                            |
| Contact line                      | 10 pt / 1.25       | Regular                                              |
| Section heading                   | 12 pt / 1.2        | Bold, uppercase, 0.5 pt letter spacing, rule below   |
| Entry title line                  | 10.5 pt / 1.25     | Bold title; the date range is Regular, right-aligned |
| Entry second line (place, detail) | 10.5 pt / 1.25     | Regular, secondary colour                            |
| Body, summary and bullets         | 10.5 pt / 1.3      | Regular; bullet `•` with a 10 pt hanging indent      |

Spacing: 4 pt below the name block, 14 pt above each section heading, 6 pt below it, 8 pt between entries, 2 pt between bullets. Tabular figures (`tnum`) for dates.

### Layout, top to bottom

1. **Name**, then the **headline** when there is one.
2. **One contact line** in the body: location (city, country), email, phone and links, separated by " · ". Links print as their visible URL text, without the protocol. No icons or "Phone:" labels: the values speak for themselves on one line, and every value is plain text an ATS can read.
3. **Summary** with no heading of its own when it comes straight after the contact block. It gets the "Summary" / "Profil" heading only if the user moves it elsewhere.
4. **Sections in the user's order** (0024), each with its heading.
   - The heading is the section's title, or the default in the **CV's** language:

     | Kind         | English         | French                     |
     | ------------ | --------------- | -------------------------- |
     | work         | Work Experience | Expérience professionnelle |
     | education    | Education       | Formation                  |
     | skills       | Skills          | Compétences                |
     | languages    | Languages       | Langues                    |
     | projects     | Projects        | Projets                    |
     | certificates | Certifications  | Certifications             |
     | awards       | Awards          | Distinctions               |
     | volunteer    | Volunteering    | Bénévolat                  |

     A custom section always has its own title.

   - **Work and volunteering:** line 1 is "Position, Company" with the date range right-aligned. Line 2 is the location. Then the summary, then the bullets.
   - **Education:** line 1 is "Degree, field" (`studyType`, `area`) with the date range. Line 2 is the institution and location. Then the score and courses, as text.
   - **Skills:** one line per group, "Group: skill, skill, skill". With no groups, one comma-separated line. Never bars or ratings.
   - **Languages:** "French: native, English: fluent", on one line.
   - **Certificates and awards:** "Name, issuer" with the date right-aligned.
5. **Dates:** month and year in the CV's language ("Jan 2021 – Present", "janv. 2021 – aujourd'hui"), a year alone when only the year is set, and an en dash between them. Market-specific date styles are #13's to change, in the tree's date formatter only.

### Fonts in each renderer

- **PDF (#15):**
  - Register `Carlito-Regular.ttf` and `Carlito-Bold.ttf` from the repo (OFL, with `OFL.txt`), loaded from disk in the Node route.
  - Document `title`, `author` and `language` are set (0016).
  - The extraction test checks English and French text with accents and œ. If Carlito text doesn't extract exactly, switch to Liberation Sans and note it in that spec.
- **HTML preview (#14):**
  - The same two weights through `next/font/local`, loaded only on the builder route.
  - Subset to Latin, Latin-1 and Latin Extended-A as WOFF2, generated once and committed (the full TTFs are about 600 KB each).
  - The subset is made with a one-off command (fonttools `pyftsubset`), not a project dependency. The command is written in the spec.
  - Sizes in pt become CSS `pt`, on a page box scaled to fit (0024).

### Code shape

`src/features/cv/templates/classic/` holds the template:

- its constants (the tables above);
- the HTML component (#14);
- later, the react-pdf component (#15).

Both components read only the semantic tree from 0024. Default headings live in the message files, by CV language, not UI language.

**Where the roles disagreed:**

- **UI** wanted Jubilee violet for the headings, so the CV feels like ours. **Product** and **Copy** said the CV is the user's, a branded colour marks every applicant as a tool user, and colour adds nothing for an ATS. We chose black and greys, and a coloured template can come later, as a choice.
- **Frontend** asked whether a 600 KB font is too heavy for phones. The WOFF2 subset settles it for the preview; the PDF embeds only the glyphs it uses, to be checked in #15.

## Consequences

- **#14** can draw the preview: the semantic tree plus the Classic HTML component.
- **#15** adds the react-pdf component and the extraction test. It must verify that the PDF embeds a subset of the font, and name Liberation Sans if Carlito fails.
- **#13** (country formats) plugs into the date formatter and the optional slots (photo, personal details) without changing this layout.
- **More templates** become new folders reading the same tree, and each needs its own decision.
- **Rules out** for this template: colour, icons, columns, photos, skill bars, justified text and hyphenation.
- **Review checks:**
  - the preview matches the tables above at 390 px and 1440 px, in English and French;
  - no text of the CV sits in a page header or footer;
  - the headings follow the CV's language, not the UI's;
  - the font files and their OFL licence are in the repo.
