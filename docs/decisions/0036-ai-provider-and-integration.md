# 0036: A swappable AI layer, routed per task, starting on Claude

- **Status:** Approved
- **Proposed:** 2026-11-26 by the product team (roles: Tech Lead, PM, Database, Product, UX, Copy, Frontend, Backend)
- **Approved:** 2026-11-26 by Flovet (in chat)
- **Supersedes:** none. Fills the "AI provider, prompts, cost limits and data handling" row of the README's "Still to decide", and unblocks 0031 §4 (phase 2).
- **Specs:** —

## Context

Flovet asked (in chat, 2026-11-26) which AI to use, how to build it in, and which MVP features need it. After the first draft (one provider, called directly), Flovet added:

- Providers must be **swappable and modular**: pick a provider and model **per task**, to keep cost down.
- Start on **Claude** to test everything, on his own Claude account; move tasks to cheaper or free providers where they hold up.
- A dashboard to choose providers per task may come later; not now.

What limits the answer:

- Brief: "AI must never invent experience; every AI change to a CV is visible and reversible." 0016: the AI never writes `content`; it proposes, the user accepts, and accepting appends a `cv_revisions` row with `source = 'ai'`.
- Brief: "Personal data (CVs, contact details) is sensitive: least privilege." CLAUDE.md, Ask first: "Anything that sends user data to a third party (AI providers …)". 0011: every new processor updates the privacy page in the same spec.
- Brief: recruiter-safe; "capped, honest, high-fit applications". France launches first (0005), so GDPR applies from day one.
- MVP doc: the riskiest assumption is whether people pay for "a pass that turns one good CV into tailored, approved applications". Activation target: 60% finish a CV within 15 minutes.
- Stack (0001, 0002): Next.js 16 on Vercel, Supabase in eu-west-1, Zod 4 already installed, data access only in `queries.ts` / `actions.ts`.

## User lens

**User:** Aminata, 29, data analyst in Paris (the user from 0031), applying to 3–5 jobs a week during a hunt. Laptop in the evening, phone to check during the day.

1. **Why she opens it:** "Make my CV fit this job without me rewriting it for an hour, and don't make things up about me."
2. **How she uses it:** she pastes or picks a job, waits a few seconds, reads what changed, accepts most, edits one line. In French for French jobs, English for others. Short attention; she will not read a long AI essay.
3. **What she wants next:** "Is it good enough to send?" then "Write the letter" then "Send it". So each AI result ends in the next action (Accept, then letter, then queue), and the match score tells her if the job is worth it.
4. **What we leave out:** a chat assistant, AI on every keystroke, AI-ranked candidates for recruiters, AI headshots, mock interviews, auto-written answers to custom questions (v1.1), and any AI text the user didn't ask for (0031).

## Research

### Design references (how others use AI; most from 0031's research)

| Reference                                 | What they do                                                                                                                           | Adopt / adapt / reject | Why                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| Reactive Resume, AI in the builder (0031) | "Nothing changes until you accept." Old struck through, new highlighted, with a reason. Edits that add facts are flagged as new facts. | Adopt                  | Same model as 0016's proposals; the new-fact flag is our guard against invention |
| Teal, "Improve with AI" (0031)            | Per-bullet button; warns suggestions may contain placeholder metrics to replace                                                        | Adapt                  | On-demand per item, yes; placeholder metrics, no: we flag, never invent          |
| Rezi / Enhancv scores (0031)              | Live 1–100 score, feedback tied to entries                                                                                             | Adapt                  | Match score per job, explained by keywords; no single "CV score" (0031)          |
| web.dev, AI UX patterns (0031)            | Explicit accept or edit before saving; clear action labels, not "Ask AI"                                                               | Adopt                  | Matches 0016 and our copy rules                                                  |

### Providers (facts looked up 2026-11-26)

| Provider                   | Price per 1M tokens (in / out)                                                                             | Data terms                                                                                                                              | EU processing                                                                              | Adopt / adapt / reject                        | Why                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Anthropic (Claude API)** | Haiku 5.5 $0.10 / $0.50 · Sonnet 5.5 $2 / $10 · Opus 5.5 $4 / $20. Batch −50%; cache reads 0.05–0.1× input | Commercial terms: no training on customer content; DPA; EEA customers contract with Anthropic Ireland                                   | Inference geo is only `global` or `us`; storage geo only `us`. No EU-only option           | **Adopt first**                               | Flovet's choice to test with; Haiku 5.5 is also the cheapest paid model on this list          |
| OpenAI                     | GPT-5 mini $0.25 / $2 (aggregators citing OpenAI)                                                          | No training on API data by default; abuse logs up to 30 days                                                                            | EU residency (`eu.api.openai.com`) for eligible orgs only, via sales; +10% on newer models | Later, per task                               | Pluggable; EU residency is the plus if French users or the legal review need it               |
| Mistral (La Plateforme)    | Small 4 $0.15 / $0.60 · Medium 3.5 $1.50 / $7.50 (official docs)                                           | Not confirmed (pages didn't say)                                                                                                        | EU company; EU hosting **not verified**                                                    | Later, per task, after its terms are checked  | Pluggable; strong EU story if confirmed                                                       |
| Google Gemini API          | Flash prices are promotional until 2026-12-31 and double on 2027-01-01; sources conflict                   | Free tier: content used to improve products, human review, "do not submit … personal information". Paid: not used. EEA users: paid only | Via Vertex AI regions                                                                      | Paid tier later; free tier for test data only | Free tier can't legally take EEA users' CVs                                                   |
| Groq                       | Not checked                                                                                                | Doesn't retain inference data by default; logs up to 30 days for abuse, opt-out; zero retention available to all                        | US (GCP), under SCCs                                                                       | Later, per task                               | Fast, cheap open models; possible for reader tasks                                            |
| OpenRouter                 | Provider list price; 5.5% fee when buying credits                                                          | Doesn't train itself; some providers (free models included) may; can opt out of providers that train                                    | EU routing on the Business plan only                                                       | Test data only                                | Good for trying many models in the evals; not for real CVs on the Standard plan               |
| Vercel AI Gateway          | No markup on tokens; BYOK on the paid tier                                                                 | Optional zero-retention routing                                                                                                         | EU endpoint in beta, +5%, Pro only                                                         | Not now                                       | A second processor between us and the provider; can be added later as one more registry entry |

### The swappable layer

| Reference                                             | What it does                                                                                                                                                                                                                 | Adopt / adapt / reject | Why                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| **Vercel AI SDK** (`ai` 7.0, provider packages 4.0)   | One API (`generateText`, `streamText`) for every provider. `createProviderRegistry` addresses models as `providerId:modelId`, e.g. `anthropic:claude-haiku-5-5`. Structured output with a Zod schema through `Output.object` | **Adopt**              | Swapping a task's model is a string; Zod is already ours         |
| `@ai-sdk/anthropic`                                   | PDF input; prompt caching through `providerOptions.anthropic.cacheControl`; structured output; Message Batches (experimental)                                                                                                | Adopt                  | The Claude features we planned to use still work through the SDK |
| `@ai-sdk/openai`, `@ai-sdk/mistral`, `@ai-sdk/google` | Same calls; structured output; PDF (Mistral through OCR). OpenAI's strict schemas don't accept optional fields (use nullable)                                                                                                | Adopt when needed      | Each is one package and one key away                             |
| Anthropic SDK direct (first draft)                    | Full Claude API, nothing else                                                                                                                                                                                                | Reject                 | Moving a task to another provider would mean rewriting that code |

**Correction to the first draft.** It said PDF input, batch and caching were "provider-specific either way". Checked against the AI SDK docs: PDF input is the same call for every provider that supports it; caching is one provider option inside our layer; Anthropic batches work (experimental). Only the options differ per provider, and they stay inside `src/lib/ai/`.

### Regulation

| Source                                                 | What it says                                                                                                                                                                                                                            | Consequence                                                                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| EU AI Act Service Desk, employment (Annex III point 4) | High-risk = tools used in recruitment or selection (ranking candidates for recruiters, filtering applicants). A CV-tailoring tool and a job-matching tool used by candidates are out of scope: "initiated and managed by the candidate" | Jubilee as specified is not high-risk. Anything that scores candidates **for employers** would be: never build it without a new decision |
| Gemini terms, EEA clause                               | Free tiers can't serve EEA users                                                                                                                                                                                                        | Free tiers never receive real users' data                                                                                                |
| Claude help centre                                     | "A paid Claude subscription enhances your chat experience, and the Claude API is billed separately." Max, Ultra and Team plans include monthly API credits                                                                              | Jubilee needs a Claude Console API key; the claude.ai subscription itself can't power the app                                            |

This is the team's reading, not legal advice. The privacy-page legal review before launch (0011) should cover the AI processors and the AI Act reading.

Sources (links actually opened):

- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/manage-claude/data-residency
- https://support.claude.com/en/articles/9876003
- https://aistudio.google.com/docs/terms
- https://developers.openai.com/api/docs/guides/your-data
- https://developers.openai.com/api/docs/guides/data-residency
- https://docs.mistral.ai/getting-started/models
- https://console.groq.com/docs/your-data
- https://openrouter.ai/docs/features/privacy-and-logging
- https://openrouter.ai/pricing
- https://vercel.com/docs/ai-gateway/pricing
- https://ai-sdk.dev/docs/reference/ai-sdk-core/provider-registry
- https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
- https://ai-sdk.dev/providers/ai-sdk-providers/openai
- https://ai-sdk.dev/providers/ai-sdk-providers/mistral
- https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- https://ai-act-service-desk.ec.europa.eu/en/employment-0
- npm registry, 2026-11-26: `ai` 7.0.183, `@ai-sdk/anthropic` 4.0.110

Search summaries only (page not opened): Anthropic commercial terms (no training, Anthropic Ireland), OpenAI and Gemini price pages, Mistral pricing, law-firm notes on AI Act dates (they disagree: 2 Aug 2026 vs a delay to late 2027).

## Where the MVP needs AI

Each row is one **task**: the unit we route to a provider.

| #   | MVP feature               | Task(s)                          | What the AI does                                                                                                                                                                                     | Kind   |
| --- | ------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Resume builder (optional) | `cv.rewrite`                     | "Suggest a rewrite" for one flagged item, on request (0031 phase 2)                                                                                                                                  | Writer |
| 2   | LinkedIn import           | `cv.import`                      | Turns a pasted profile or LinkedIn PDF into our CV schema (validated by the 0016 Zod schema)                                                                                                         | Reader |
| 3   | Country CV formats        | none                             | Rules per market: deterministic and testable                                                                                                                                                         | —      |
| 4   | French and English CVs    | `cv.translate`                   | Translates the CV into a natural professional version, as a proposal                                                                                                                                 | Writer |
| 5   | Match score and tailoring | `job.extract`, `cv.tailor`       | `job.extract` pulls the job's required skills and keywords; **the score is computed by our code** so it's explainable and stable. `cv.tailor` rewrites summary and bullets for the job, as proposals | Both   |
| 6   | Cover letter              | `letter.write`                   | A short letter from the CV facts and the job, in the job's language, streamed                                                                                                                        | Writer |
| 7   | Job matches and alerts    | `job.extract` (nightly, batched) | Reuses the job extraction and our score to rank the daily feed. No embeddings in the MVP                                                                                                             | Reader |
| 8   | Approval-based apply      | none                             | Sending and pre-filling are mechanical; AI answers to custom questions are v1.1                                                                                                                      | —      |
| 9   | Application tracker       | none                             | Plain data                                                                                                                                                                                           | —      |
| 10  | Follow-up emails          | `email.followup`                 | Drafts a follow-up or thank-you from the application's facts; the user edits and sends                                                                                                               | Reader |

Seven tasks. Features 3, 8 and 9 don't need AI.

## Options

1. **Anthropic SDK called directly** (first draft). Pros: least code. Cons: every switch is a rewrite; can't mix providers per task. Ruled out by Flovet's requirement.
2. **Vercel AI SDK with direct provider packages, behind our own per-task router.** Pros: a task's provider and model change in one entry; no extra processor between us and the provider; Zod-native. Cons: two packages now (`ai`, `@ai-sdk/anthropic`), one more per provider later; the SDK moves fast (major 7), so versions are pinned.
3. **Option 2 through Vercel AI Gateway or OpenRouter** (one key, hundreds of models). Pros: trying models is easiest. Cons: a second processor sees every CV; zero retention and EU routing cost extra or need higher plans; free models on OpenRouter may train on data.
4. **Our own adapter per provider, no SDK.** Pros: no dependency. Cons: we'd rebuild structured output, streaming and PDF handling per provider; the AI SDK already does this.

## Decision

**Option 2.** The Vercel AI SDK, provider packages called directly, and a per-task router in `src/lib/ai/`. Every task starts on Claude; each task moves to the cheapest model that passes its eval.

### How the layer works

```
feature actions.ts ──► runTask("cv.tailor", input) ──► routing table ──► registry ──► provider
                         │ Zod input / output            │ task → "anthropic:claude-haiku-5-5"
                         │ prompt (provider-neutral)     │ + fallbacks, max tokens, caps
                         └ usage log (task, provider, model, tokens, cost)
```

1. **Tasks, not providers.** Features call `runTask(taskId, input)` and never import a provider package. Each task owns its Zod input schema, Zod output schema and prompt, written provider-neutral.
2. **One routing table.** `src/lib/ai/routing.ts` maps each task to a `providerId:modelId` string, a fallback list, `max_tokens` and its per-user cap. Changing a task's provider is one line. Later the table can move to the database and a dashboard can edit it (its own decision; not now).
3. **One registry.** `createProviderRegistry` holds only the providers whose API key is set. A route to a provider without a key fails at startup, not in front of a user.
4. **Provider options stay inside.** Anything provider-specific (Claude prompt caching, OpenAI's nullable-only schemas, batch) lives in `src/lib/ai/providers/`, never in features.
5. **Fallbacks.** If the routed model errors, refuses or times out, the router tries the next model in the task's list, only among approved providers. Then the calm error from rule 9.
6. **Usage log.** Every call records task, provider, model, tokens and cost, per user. This shows which provider is cheapest per task, and it is what a dashboard would read.
7. **Evals choose the model.** Each task has fixture CVs and jobs (French and English, no real people). A script runs a task against any `provider:model` and checks it: schema valid, no invented facts, required content present. A task moves to a cheaper model only when it passes.
8. **Proposals and no invention (0016).** Results that touch a CV are proposals (old/new, reason, Accept / Edit / Reject). Code flags any company, title, date, degree or number not in the source CV as "New fact: check this", never pre-accepted.
9. **Minimisation and calm failures.** Contact details are stripped before sending. Nothing is sent until the user clicks. Failures show "We couldn't write this right now. Try again in a minute." with nothing lost.
10. **Server only.** `import "server-only"`; keys in `src/env.ts`, never `NEXT_PUBLIC_`.

### Which providers may receive real users' data

- **Allowed now:** Anthropic, on a paid API key (no training, DPA).
- **Adding another provider for real data** (OpenAI, Mistral, Gemini paid, Groq): a short decision checking its terms, plus the privacy-page update (0011). The layer makes it a config change; the decision makes it lawful.
- **Free tiers and OpenRouter free models:** fixture data only, in local evals. Never real CVs (Gemini's terms forbid it for EEA users; others may train on it).

### Starting setup

- **Account:** a Claude Console API key in a dedicated "Jubilee" workspace with a monthly spend limit. The claude.ai subscription doesn't power API calls; Max, Ultra and Team plans include monthly API credits that can cover testing.
- **Models:** every task starts on **Claude Haiku 5.5** ($0.10 / $0.50, the cheapest paid model researched). The evals compare the writer tasks (`cv.tailor`, `letter.write`, `cv.translate`, `cv.rewrite`) against Sonnet 5.5; a task moves up only if Haiku fails it. Flovet confirms these choices.
- **Rough cost:** tailoring plus a letter ≈ 18k tokens in, 4k out (estimate, with the newer tokenizer). On Haiku that is about **$0.004 per application**, $0.08 for 20; on Sonnet about $0.08, $1.60 for 20.
- **Packages:** `ai` and `@ai-sdk/anthropic`, pinned. Others only when a task moves to them.

### Order of AI specs

1. AI foundation: `src/lib/ai/` (router, registry, routing table, usage log table, caps), the env var, the eval script, the privacy page. No user-visible feature.
2. LinkedIn import (`cv.import`): cheap, low risk, drives the 15-minute activation target.
3. Match score and tailoring (`job.extract`, `cv.tailor`): the paywall moment.
4. Cover letter (`letter.write`).
5. "Suggest a rewrite", translation, follow-ups.

**Where roles disagreed:** the Tech Lead first chose the direct Anthropic SDK for fewer moving parts; Flovet's need to route per task and cut cost outweighs that, and the AI SDK covers the Claude features we need. Database wanted EU-only processing; Product accepted Anthropic under its DPA to start, with OpenAI EU residency or Mistral as per-task options once their terms are checked. Backend wanted Vercel AI Gateway for one key; the team kept it out so no second processor sees CVs.

## Consequences

- **Easier:** moving a task to a cheaper provider is a routing change plus a passing eval; mixing providers per task works from day one; the usage log shows cost per task and provider; a future dashboard only edits the routing table.
- **Harder:** two packages to keep pinned and upgraded; prompts must work across providers (the evals catch drift); each new provider for real data needs a short decision and a privacy-page line.
- **Rules out:** features importing provider packages; free tiers with real users' data; AI that writes `content` directly; AI that scores candidates for employers (EU AI Act high-risk); embeddings and a chat assistant in the MVP; AI calls from the browser.
- **Needs Flovet:** approval of this decision; Haiku 5.5 as the starting model for every task; adding `ai`, `@ai-sdk/anthropic` and `ANTHROPIC_API_KEY` (Ask first); a Console API key in a Jubilee workspace with a spend limit, set in Vercel and `.env.local`; the daily caps for free and pass users.
- **A review checks:** no provider package imported outside `src/lib/ai/`; every task has Zod schemas, a route and an eval; every route points to an approved provider with a key; no `NEXT_PUBLIC_` key; no path writes `content` without an accepted proposal; contact details absent from prompts; caps checked before the call; usage logged per call; the privacy page names every provider in the routing table.
