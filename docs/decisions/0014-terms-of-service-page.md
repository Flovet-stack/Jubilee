# 0014: Terms of service page

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: Product Designer, Copy, UX, Frontend)
- **Approved:** 2026-11-21 by Flovet (in chat)
- **Builds on:** 0011 (same page pattern as the privacy policy), 0013 (sign-in links to it), 0003 (en/fr)
- **Specs:** none yet

## Context

The sign-in footer (0013) says "By signing in, you agree to the Terms of service". There is no Terms page, so that consent would point at nothing. Flovet asked for one. Like the privacy page (0011), it may only describe what Jubilee does today and must not invent facts. Brief rules that belong in it: "AI must never invent experience", approval-based apply, recruiter-safe.

## Research

| Reference                        | What they do                                                                                                                                                                             | Adopt / adapt / reject                 | Why                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| 37signals Terms                  | Plain words, "last updated" at top, short sections (account, payment, cancellation with exact deletion timelines, changes with notice)                                                   | Adopt the tone and the exact timelines | Easiest to read; matches 0011                                                                 |
| Teal Terms                       | Long US contract: capitals, arbitration and class-action waiver, broad "we may change at any time"                                                                                       | Reject                                 | Hard to read; arbitration waivers and one-sided change clauses are risky against EU consumers |
| EU Digital Services Act, Art. 14 | Terms must state any restrictions on what users may put in the service, how it is moderated, and how to complain, in clear, plain language; users must be told about significant changes | Adopt                                  | Jubilee stores users' CVs, so it is likely an intermediary (hosting) service                  |
| 0011 privacy page                | Summary first, jump-link contents, numbered sections, en/fr                                                                                                                              | Adopt                                  | One pattern for legal pages                                                                   |

Sources (opened 2026-11-21): https://37signals.com/policies/terms · https://www.tealhq.com/terms · https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065 (Art. 14). Failed: economie.gouv.fr (bot check, not passed).

## Decision

`/[locale]/terms` in `(marketing)`, built like the privacy page: "last updated" date, a short summary, contents, then these sections:

1. **Who we are** and how to reach us (the support email, as a link)
2. **What Jubilee is today:** an account you sign in to with Google, LinkedIn or an emailed code. New features come with updated terms.
3. **Your account:** one per person, keep your details accurate, keep your email secure
4. **Your content:** your CV stays yours; we only use it to run the service for you
5. **AI and applications:** Jubilee never invents experience; you check everything before it's used; nothing is sent to an employer without your approval
6. **Fair use:** no false information, no abuse, no scraping. How we review problems, and how to appeal (DSA Art. 14)
7. **Price:** free today. Nothing is charged without a clear price and your consent first.
8. **Ending:** you can delete your account at any time. We can suspend an account only for breaking these terms, and we tell you why.
9. **Responsibility:** limited as far as the law allows. Your consumer rights are not affected.
10. **Changes:** we tell you before any significant change
11. **Law:** to be confirmed

## Open points (Flovet)

- **Legal entity:** the name and country of the company or person running Jubilee
- **Governing law and courts:** for example French law, which keeps EU consumers' home-country rights
- **Minimum age:** for example 16
- **Lawyer review:** this is a plain-language draft, not legal advice. Have a lawyer review it before launch.

## Consequences

- The sign-in consent line is valid once this page is live.
- Each new feature (payments, AI, apply) must update the Terms and the "last updated" date.
