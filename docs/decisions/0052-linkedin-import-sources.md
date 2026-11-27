# 0052: LinkedIn import sources (profile PDF and paste)

- **Status:** Approved
- **Proposed:** 2026-11-27 by the product team (roles: Tech Lead, Product, UX, Backend, Database)
- **Approved:** 2026-11-27 by Flovet
- **Supersedes:** none
- **Specs:** specs/31-start-cards-and-import.md

## Context

Brief, MVP feature 2: "The user pastes their LinkedIn profile or uploads its PDF. Work history, education and skills fill in automatically." 0004 and 0006 already note that LinkedIn sign-in (OIDC) returns name, email and photo only, not work history. 0036 routes the `cv.import` AI task; 0016 fixes the CV schema and the `import` revision source. Not yet decided: which inputs we accept, how they're read, and what happens to the user's CV when an import lands.

## User lens

User: Aminata (29, data analyst in Paris), first visit, wants a CV without retyping eight years of history.

1. **Why open it?** "My LinkedIn is already up to date. Don't make me type it again."
2. **How?** Most likely on a laptop (LinkedIn's "Save to PDF" doesn't exist in its mobile app). On a phone she can copy and paste profile sections. She has a few minutes and isn't paying full attention.
3. **What next?** "Did it get everything right?" So we show a review of what was found (entries per section, anything missing), then open the editor with the draft. Next step: pick a country format (feature 3).
4. **Left out:** importing someone else's profile, importing by URL, browser extensions, and live sync with LinkedIn.

## Research

| Reference                                                                         | What they do                                                                                                                                                                                           | Adopt / adapt / reject                     | Why                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resume builders (VisualCV, Standard Resume, Resumonk, BeamJobs, Kickresume, Teal) | Main route: the user saves their profile with LinkedIn's **More > Save to PDF** and uploads it; a parser or AI fills editable fields. Some tools take a public profile URL or offer a Chrome extension | Adopt PDF upload; reject URL and extension | PDF is the standard path, since there's no API for individuals. URL import requires scraping or a scraping vendor                                                                                                      |
| Reactive Resume (open source; already our 0016 reference)                         | Imports LinkedIn's **data export ZIP** (`Positions.csv`, `Education.csv`, `Skills.csv`, …)                                                                                                             | Reject for MVP (later option)              | The export is clean and structured, but the user has to request it and wait (minutes to 72 h). That breaks the 15-minute activation target (0036). LinkedIn also renames files and columns, so the parser needs upkeep |
| LinkedIn APIs (Profile API, OIDC)                                                 | OIDC gives `openid profile email` only. Positions, education and skills are partner-gated, and new partner applications are reported paused                                                            | Reject                                     | Not available to us                                                                                                                                                                                                    |
| Scraping or scraping vendors (Proxycurl-style, Apify)                             | Fetch a public profile by URL                                                                                                                                                                          | Reject                                     | Against LinkedIn's User Agreement. Breaks the brief's "no scraping of sites whose terms forbid it" and our recruiter-safe positioning. Sends user data to a third party                                                |
| Paste text                                                                        | A few builders accept pasted profile text                                                                                                                                                              | Adopt                                      | Works on a phone, needs no file, and goes through the same AI task                                                                                                                                                     |
| 0036 `cv.import` task (Reader route, provider PDF input through AI SDK)           | Turns text or a PDF into the 0016 Zod schema                                                                                                                                                           | Adopt                                      | Already built in spec 26. Both inputs become one task call                                                                                                                                                             |

Sources (links actually opened through search summaries, 2026-11-27, mostly third-party, so the LinkedIn facts get checked against LinkedIn's own pages at spec time):

- https://www.visualcv.com/linkedin-resume-builder/
- https://standardresume.co/linkedin-resume-builder
- https://www.resumonk.com/resume-builder/help/import-from-linkedin
- https://www.beamjobs.com/linkedin-resume-builder
- https://www.haired.app/blog/ai-resume-builder-linkedin-import-2026 (Teal and Kickresume flows; third-party)
- https://docs.rxresu.me/product-guides/importing-your-data-from-linkedin
- https://www.linkedin.com/help/linkedin/answer/50191 (Download your account data)
- https://clura.ai/blog/linkedin-api and https://www.swarmhit.com/blog/linkedin-profile-api (API restrictions; third-party)
- 0004, 0006, 0016, 0036 in this repo

## Options

1. **PDF upload + paste, read by the `cv.import` AI task.** Pros: matches the brief and the market. No LinkedIn dependency. One task handles both inputs. Cons: AI cost per import (small, Reader route). Output can be wrong, so a review step is needed. LinkedIn's PDF drops some fields, such as dates on some skills and the full text of long descriptions.
2. **Deterministic PDF parser (pdf text + rules), no AI.** Pros: free and predictable. Cons: breaks whenever LinkedIn changes its PDF layout, handles French and other languages poorly, and paste would need a separate parser.
3. **Data export ZIP.** Pros: the cleanest data. Cons: waiting hours kills activation. Keep it for later as a third input.
4. **URL import through a scraper.** Rejected: terms, privacy, brand.

## Decision

Option 1.

- **Inputs:** a LinkedIn profile PDF (one file, `application/pdf`, size cap set in the spec, about 5 MB) or pasted text (character cap in the spec). The user's own profile only, and the UI says so. On phones, the paste tab is the default, because Save to PDF needs a computer.
- **Reading:** text is extracted server-side first. If the PDF has a text layer (LinkedIn's PDF does), text goes to `cv.import`, which is cheaper and works on any provider. Otherwise the PDF goes in directly as provider PDF input (0036). The output is validated against the 0016 schema.
- **Never write directly.** Import produces a proposal (0036 rule 'no path writes `content` without an accepted proposal'). On an empty CV, accepting fills it. On a CV with content, the user chooses per section to replace or add. Either way a `cv_revisions` row with `source = import` keeps the previous version (0008 "Recoverable").
- **Privacy:** contact lines (email, phone, address, LinkedIn URL) are stripped before the prompt (0036) and then filled back in from the parse. The uploaded file isn't stored. It's processed in memory and discarded.
- **Not in MVP:** data export ZIP, URL import, browser extension, re-sync.

Tech Lead and Product disagreed on text-first versus PDF-direct. Text-first is cheaper and works with any provider. PDF-direct is better for odd layouts. We chose text-first with a fallback.

## Consequences

- Easier: one AI task, no LinkedIn app permissions, no partner dependency, works for pasted text from any source (old CVs too, later).
- Harder: accuracy depends on prompt and eval quality. The `cv.import` eval set needs real LinkedIn PDFs in English and French (with consent, or synthetic).
- New dependency to ask about at spec time: a PDF text extractor (for example `unpdf`). It isn't named in an approved decision.
- Rules out: scraping, URL import, storing uploaded files.
- A review checks: no file persisted; contact details absent from the prompt; output Zod-validated; nothing written without acceptance; an `import` revision exists after acceptance; the paste path works at 390 px; copy in message files.
