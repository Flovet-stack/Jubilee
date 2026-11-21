# 0005: Target markets and rollout order

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Product Designer, PM, Tech Lead, Backend, Copy)
- **Approved:** 2026-11-21 by Flovet
- **Specs:**

## Context

The brief says Jubilee starts "in French- and English-speaking markets (launch markets to confirm; Cameroon and France are the working examples)", and the MVP ships "for 2 launch markets and 2 languages" (`docs/product/mvp.md`). Country CV formats, job sources and payments all depend on which markets come first.

On 2026-11-21 Flovet set the target markets: **the United States, Canada, the United Kingdom, France and Africa**. In Africa that means Cameroon, Nigeria, Côte d'Ivoire, Senegal, Kenya and South Africa. Flovet chose a **phased rollout**, with **France and the United States** first.

**Language is not the same as format.** Every target market writes CVs in English or French, but the norms differ by country, even within one language. For example, a US résumé has no photo and no date of birth and runs 1–2 pages; a UK CV is up to 2 A4 pages; Canada uses YYYY-MM-DD dates; a French CV often includes a photo. So each market needs its own format rules (decision #13), even though there are only two CV languages.

What every market needs before it opens:

- **Format:** CV format rules for that country (#13).
- **Job source:** at least one source we're licensed to use (#22). The brief says "No scraping of sites whose terms forbid it".
- **Payments:** a way to pay that people there actually use (#32).
- **Language:** `en` or `fr`, both already covered by 0003.

## Research

| Reference                                                                                                         | What it shows                                                                                                                                                                      | Adopt / adapt / reject     | Why                                                                              |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| France Travail "API Offres d'emploi" (data.gouv)                                                                  | Real-time job offers from France Travail and its consenting partners, for public or private job-search services. Access through francetravail.io after signing a licence contract. | Adopt (FR)                 | An official, licensed job source for France                                      |
| Adzuna job-search API                                                                                             | Covers `us`, `gb`, `ca`, `fr` and `za`, among about 16 countries (third-party list; the official docs say "contact us" for some countries)                                         | Adapt (US, UK, CA, FR, ZA) | One source could cover phases 1 and 2; confirm coverage and terms in #22         |
| Résumé norms: US, UK and Canada (resume.io, Enhancv, Novorésumé, TopCV; the UK National Careers Service as cited) | US and Canada: no photo, no date of birth, 1–2 pages. UK: up to 2 A4 pages, no age or marital status. Canada: YYYY-MM-DD dates.                                                    | Adopt                      | Confirms format is per country, not per language (input to #13)                  |
| Cameroon job boards (emploi.cm, MinaJobs, others)                                                                 | emploi.cm is the most-cited local board; LinkedIn leads estimated traffic; no public API found for any of them                                                                     | Defer (phase 3)            | Demand is real, but there is no licensed feed yet                                |
| Careerjet publisher API                                                                                           | 90+ countries with a keyed publisher API; African coverage not confirmed                                                                                                           | Investigate (phase 3)      | A candidate source for the African markets                                       |
| Notch Pay, Flutterwave, dLocal, MTN MoMo, Orange Money                                                            | Mobile money (MTN, Orange) by API in Cameroon, Côte d'Ivoire and Senegal; Flutterwave covers francophone mobile money                                                              | Adopt (phase 3)            | The African markets need mobile money; #32 picks the provider                    |
| Stripe availability                                                                                               | No evidence of merchant support in Cameroon; Senegal and Côte d'Ivoire appear only as payout destinations                                                                          | Adapt                      | Cards (likely Stripe) for phases 1–2 and mobile money for Africa; #32 verifies   |
| DataReportal Digital 2025: Cameroon                                                                               | 41.9% internet penetration, mostly on mobile                                                                                                                                       | Adopt (phase 3)            | Supports the brief's "keep pages light" constraint once Africa opens             |
| Cameroon youth employment (INS via Cameroon Tribune; Afrobarometer 2026)                                          | 39.3% youth unemployment (national figure); rising interest in emigration                                                                                                          | Adopt                      | African candidates often apply to FR, UK, CA and US jobs, so the markets connect |

Sources: found with web search on 2026-11-21. The search tool returned summaries of these pages; they were **not opened in a browser**, so #13, #22 and #32 must re-check every figure:

- https://www.data.gouv.fr/fr/dataservices/api-offres-demploi/
- https://developer.intelligence.adzuna.com/doc-593840
- https://jentic.com/apis/adzuna.com/adzuna
- https://resume.io/how-to-write-a-resume/international-resume-cv-writing
- https://enhancv.com/blog/international-resume
- https://novoresume.com/career-blog/canada-resume-format
- https://topcv.co.uk/career-advice/international-cv-differences
- https://infospratiques.cm/offres-emploi-cameroun/
- https://ahrefs.com/websites/cameroon/jobs-and-education
- https://www.careerjet.im/partners/api
- https://developer.notchpay.co/accept-payments/mobile-money
- https://developer.flutterwave.com/docs/francophone
- https://docs.dlocal.com/docs/cameroon
- https://docs.stripe.com/global-payouts/recipient-countries
- https://datareportal.com/reports/digital-2025-cameroon
- https://www.cameroon-tribune.cm/article.html/71889/fr.html/challenges-facing-youths-solving-unemployment
- https://www.afrobarometer.org/publication/ad1222-unemployment-pessimism-and-rising-interest-in-emigration-mark-cameroons-youth/

**Not yet researched:** US job sources beyond Adzuna (for example USAJOBS for federal jobs), and US competitors in the competitor map. Both go into #22 and a product review before phase 1 ships.

## Options

1. **Phased: France + US, then UK + Canada, then Africa country by country** (Flovet's choice). Pros: a small MVP (two formats and one card payment rail) and the largest paying market early. Phase 2 likely reuses the same job source and payment rail. Cons: the US is the most competitive market, and the brief's underserved-market angle (feature-priorities A8) waits until phase 3.
2. **All five at launch.** Cons: about six or more format rule sets, several job sources and two payment rails before the first user, against the MVP's "thin slices" rule.
3. **Cameroon + France first** (the brief's working examples). Pros: a less crowded market and both languages in one country. Cons: no licensed job feed confirmed for Cameroon; not what Flovet chose.

## Decision

Option 1. Each phase opens one market at a time, and a market opens only once its format rules, at least one licensed job source and its payment method are decided and built.

| Phase   | Markets                                                                                       | Formats (#13)                      | Likely job source (#22)                             | Payments (#32)                   |
| ------- | --------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------- | -------------------------------- |
| 1 (MVP) | France (`FR`), United States (`US`)                                                           | French CV, US résumé               | France Travail API; Adzuna (US, and FR as a second) | Cards                            |
| 2       | United Kingdom (`GB`), Canada (`CA`)                                                          | UK CV, Canadian résumé (EN and FR) | Adzuna                                              | Cards                            |
| 3       | Cameroon, Nigeria, Côte d'Ivoire, Senegal, Kenya, South Africa (order set when phase 2 ships) | One set per country                | Per country; none confirmed except Adzuna for ZA    | Mobile money; cards where common |

**Default languages per market** (UI locale and CV language stay separate, per 0003):

| Market                               | Default UI language                                    | Default CV language                     |
| ------------------------------------ | ------------------------------------------------------ | --------------------------------------- |
| France, Côte d'Ivoire, Senegal       | `fr`                                                   | `fr`                                    |
| US, UK, Nigeria, Kenya, South Africa | `en`                                                   | `en`                                    |
| Canada, Cameroon                     | From `Accept-Language` (`en` or `fr`); `en` if unclear | Same as the UI language; can be changed |

The market follows the **target job** (where the user wants to work), not where the user lives: a candidate in Douala applying to a job in Lyon gets a French-format CV, and one applying to a job in Toronto gets a Canadian résumé.

## Consequences

- The MVP (phase 1) builds two format rule sets (FR and US) and one card payment rail. Mobile money moves to phase 3.
- The brief changes: the launch markets become France and the US, and the "mobile data and mid-range phones" constraint becomes a phase 3 requirement. Pages still stay light, because the US and France have mobile users too.
- #13 covers FR and US first; #22 covers France Travail, Adzuna and US sources; #32 covers cards for phases 1–2.
- **Open question for later:** `en` is a single UI locale. US and UK spelling can stay one locale until phase 2; decide then whether `en-GB` is needed.
- Adding a market means one format entry, at least one licensed job source and a payment check, each recorded in a decision.
- Reviews check: markets are a fixed list in code (`FR`, `US` in phase 1); the market is stored on the CV version (0003), not inferred from the UI locale.
