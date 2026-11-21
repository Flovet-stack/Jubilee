# 0005: Launch markets

- **Status:** Proposed
- **Proposed:** 2026-11-21 by the product team (roles: Product Designer, PM, Tech Lead, Backend, Copy)
- **Approved:**
- **Specs:**

## Context

The brief says Jubilee starts "in French- and English-speaking markets (launch markets to confirm; Cameroon and France are the working examples)", and the MVP ships "for 2 launch markets and 2 languages" (`docs/product/mvp.md`). Country CV formats, job sources, payments and alerts all depend on which two markets come first, so this has to be settled before decisions on CV format rules, job sources and payments.

What matters for each market:

- **Demand:** active job seekers who would pay for a short job-search pass.
- **Job sources:** at least one source we're licensed to use (brief: "No scraping of sites whose terms forbid it").
- **Payments:** a way to pay that people there actually use (the decision index already notes "must work in launch markets, e.g. mobile money").
- **Language:** coverage of both `en` and `fr` (0003).
- **Constraints:** "Mobile data and mid-range phones are common in launch markets: keep pages light."

## Research

| Reference                                                                            | What it shows                                                                                                                                                                                                             | Adopt / adapt / reject | Why                                                                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| France Travail "API Offres d'emploi" (data.gouv)                                     | Real-time job offers from France Travail and its consenting partners, for public or private job-search services. Access through francetravail.io after signing a licence contract.                                        | Adopt (France)         | An official, licensed job source for France: exactly what the brief requires              |
| Adzuna job-search API                                                                | Covers France (`fr`) among about 16 countries, per a third-party list; no African country listed. The official Intelligence API docs say other countries are "contact us".                                                | Adapt (France)         | A possible second source for France; confirm coverage in the job-sources decision         |
| Cameroon job boards (emploi.cm, MinaJobs, others)                                    | emploi.cm is the most-cited local board (about 1,000 active offers per a local guide). LinkedIn leads estimated job-site traffic. No public API was found for any of them. Facebook is a major channel for opportunities. | Adapt (Cameroon)       | Demand is real, but there is **no confirmed licensed feed**: the main risk of this choice |
| Careerjet publisher API                                                              | Localised sites in 90+ countries with a keyed publisher API; Cameroon coverage not confirmed                                                                                                                              | Investigate            | A candidate Cameroon source for the job-sources decision                                  |
| Notch Pay, Flutterwave, dLocal, MTN MoMo, Orange                                     | All accept MTN Mobile Money and Orange Money in Cameroon in XAF, through APIs with webhooks. Notch Pay advises offering both, since MTN leads in anglophone regions and Orange in francophone ones.                       | Adopt (Cameroon)       | Mobile-money checkout is well served; the payments decision picks one                     |
| Stripe availability                                                                  | No evidence Stripe supports merchant accounts or card payments in Cameroon; it works fully in France                                                                                                                      | Adapt                  | Two payment rails: mobile money in Cameroon, cards in France                              |
| DataReportal Digital 2025: Cameroon                                                  | 41.9% internet penetration (about 12.4M users) at the start of 2025, mostly on mobile                                                                                                                                     | Adopt                  | Backs the brief's "keep pages light" constraint                                           |
| Cameroon youth employment (INS via Cameroon Tribune; Afrobarometer 2026; World Bank) | The national statistics institute cites 39.3% youth unemployment. Unemployment tops young people's concerns, with rising interest in emigration. Graduate placement is a known problem.                                   | Adopt                  | Strong need. Many candidates apply abroad, often to France, so the two markets connect    |

Sources: found with web search on 2026-11-21. The search tool returned summaries of these pages; they were **not opened in a browser**, so each figure needs re-checking when the job-sources and payments decisions are written:

- https://www.data.gouv.fr/fr/dataservices/api-offres-demploi/
- https://www.francetravail.fr/informations/informations-legales-et-conditio/conditions-generales-dutilisatio.html
- https://developer.intelligence.adzuna.com/doc-593840
- https://jentic.com/apis/adzuna.com/adzuna
- https://www.careerjet.im/partners/api
- https://infospratiques.cm/offres-emploi-cameroun/
- https://ahrefs.com/websites/cameroon/jobs-and-education
- https://developer.notchpay.co/accept-payments/mobile-money
- https://developer.flutterwave.com/docs/francophone
- https://docs.dlocal.com/docs/cameroon
- https://momoapi.mtn.com/Cameroon_Collection_productDetails
- https://developer.orange.com/apis/om-webpay
- https://docs.stripe.com/global-payouts/recipient-countries
- https://datareportal.com/reports/digital-2025-cameroon
- https://www.cameroon-tribune.cm/article.html/71889/fr.html/challenges-facing-youths-solving-unemployment
- https://www.afrobarometer.org/publication/ad1222-unemployment-pessimism-and-rising-interest-in-emigration-mark-cameroons-youth/

**Assumption (not researched):** Flovet knows the Cameroonian market first-hand and can reach early users there. This is why Cameroon is the working example; Flovet should confirm it.

## Options

1. **Cameroon + France (the working examples).** Pros: Cameroon is officially bilingual, so one market exercises both `en` and `fr` and both the francophone and anglophone CV traditions. France has an official, licensed job API. Many Cameroonian candidates apply to France, which links the two markets. Cons: no confirmed licensed job feed for Cameroon, and two payment rails (mobile money and cards).
2. **Côte d'Ivoire + France.** Pros: one CV tradition (French) and a similar mobile-money setup. Cons: French only, so English CVs go untested; no confirmed job API there either; no known owner network.
3. **France + Canada (Québec).** Pros: both have mature job sources and card payments. Cons: drops the underserved-market angle (feature-priorities A8) and the mobile-first constraint the brief is written around; Canadian CV norms add a third tradition.
4. **Cameroon + Nigeria.** Pros: large English-speaking demand. Cons: Nigeria's CV norms and payment rails differ again; France, the main destination market for francophone candidates, is left out.

## Decision

Option 1: **Cameroon (`CM`) and France (`FR`)**.

The team agrees Cameroon gives the most product learning per market (two languages, two CV traditions, mobile money, low bandwidth), and France gives a licensed job source and a destination market for Cameroonian candidates. Backend and the Tech Lead flag the Cameroon job feed as the top risk. Fallback if no licensed Cameroon source is found: Cameroon launches with saved jobs and pasted job descriptions (the user brings the job; match score, tailoring, letters and the tracker still work), and the matches feed and alerts launch in France first. The job-sources decision settles this.

**Default languages per market** (UI locale and CV language stay separate, per 0003):

| Market   | Default UI language                                    | Default CV language                             | Notes                                                            |
| -------- | ------------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------- |
| Cameroon | From `Accept-Language` (`fr` or `en`); `fr` if unclear | Same as the user's UI language; can be changed  | Both languages are first-class; anglophone users get English CVs |
| France   | `fr`                                                   | `fr`; English available for international roles | Works the same for a Cameroonian applying to France              |

The market follows the **target job** (where the user wants to work), not where the user lives: a candidate in Douala applying to Lyon gets a French-format CV.

## Consequences

- The next decisions are scoped to `CM` and `FR`: country CV format rules (#13), job sources and licences (#22), and payments with mobile money for `CM` and cards for `FR` (#32).
- Both message files (`en`, `fr`) matter from day one, and 0003's same-keys test covers them.
- Pages stay light for Cameroonian mobile users. Reviews check page weight on the main flows.
- Adding a third market later means one country-format entry, at least one licensed job source and a payment check, each in its own decision.
- Reviews check: no market other than `CM` / `FR` hard-coded; the market is stored on the CV version (0003), not inferred from the UI locale.
