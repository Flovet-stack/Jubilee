# 0026: CV entry layout in four corners, and tighter body lines

- **Status:** Approved
- **Proposed:** 2026-11-22 by the product team (roles: UI, Copy, Product)
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Supersedes:** in [0025](0025-first-cv-template-and-typography.md), the entry lines for work, volunteering and education, and the body line height. The rest of 0025 stands.
- **Specs:** (the builder spec #14, and #15)

## Context

After 0025 was approved, Flovet asked whether we had looked at real CVs. We hadn't, so we compared Classic with public example CVs. Two points differ from what good examples do.

## Research

| Reference                                                    | What it does                                                                                                                                                                                                                                                 | Adopt / adapt / reject                     | Why                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Harvard MCS bullet-point template (Google Doc, read as HTML) | Calibri 11 pt, 1 in margins, line height about 1.0–1.1. **Organization bold with location on the right; position on the next line with dates on the right.** Bullets indented 42 pt. Skills as "Technical: …", "Language: …"                                 | **Adopt** the corners                      | The most widely copied US template; every entry reads in two lines with the "where" and "when" on the right |
| Teal example ("Software Engineer", hero image)               | One column. Name, then a contact line separated by " · ". **Position bold with dates on the right; company on the next line.** Small uppercase section headings, no rule. Line height about 1.2–1.25. Bullets indented                                       | **Adopt** the two-line entry               | Same pattern, from the main competitor; confirms Classic's contact line and dates on the right              |
| Enhancv example (Software Engineer)                          | Two columns, icons and dot ratings for languages. Entries: **position, dates on the right; company, location on the right.** Uppercase headings with a rule                                                                                                  | **Adopt** the corners; **reject** the rest | The columns, icons and ratings break the ATS rules in 0025. The entry corners are the same pattern again    |
| Enhancv FR, "Traditionnel classique" (thumbnail)             | One column with an optional photo top right; uppercase headings (RÉSUMÉ, EXPÉRIENCE, ÉDUCATION, LANGUES, COMPÉTENCES); **position and company on the left, place and dates on the right**; languages on one line, "Français (Natif)"; skills as a comma list | **Adopt**; photo goes to #13               | French examples use the same corners. The photo is a country-format question (#13), as 0025 says            |

Sources (opened 2026-11-22):

- https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/, with its Google Doc exported as HTML (read in the browser, nothing saved)
- https://www.tealhq.com/resume-examples/software-engineer, and its hero example image
- https://enhancv.com/resume-examples/software-engineer/, and its first example image
- https://enhancv.com/fr/modeles-de-cv/traditionnel/

## Decision

**Entries use four corners: what and when on line 1, where on line 2.**

| Kind                  | Line 1, left (bold) | Line 1, right | Line 2, left (secondary colour) | Line 2, right |
| --------------------- | ------------------- | ------------- | ------------------------------- | ------------- |
| Work and volunteering | Position            | Date range    | Company (organisation)          | Location      |
| Education             | Degree, field       | Date range    | Institution                     | Location      |

- An empty corner is simply left out. If line 2 is empty on both sides, it isn't printed.
- On a narrow page, if the left text would meet the right text, the right text wraps under it. Nothing is cut off.
- **Reading order** in the PDF stays left then right on each line: position, dates, company, location. #15's extraction test checks it.
- **Body line height** (summary and bullets): 1.25 instead of 1.3. Teal's examples sit at about 1.2–1.25 and Harvard tighter still, and 1.25 keeps more CVs on one page without crowding.

Everything else in 0025 is unchanged: Carlito, the sizes, margins, headings, colours and the contact line. 0025's choices on those already match the examples (contact line with " · ", dates on the right, plain uppercase headings, no icons).

## Consequences

- The semantic tree (0024) gives each entry four slots, so the HTML preview and the PDF place them the same way.
- On approval, 0025's status becomes "Approved; entry lines and body line height superseded by 0026".
- Review checks: the four corners at 390 px preview scale and in the PDF; an entry with no location; a long company name next to a long location.
