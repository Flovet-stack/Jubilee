# 0038: Groq's free tier for AI evals, made-up data only

- **Status:** Superseded by 0039 (routing only; the eval flag stays)
- **Proposed:** 2026-11-26 by the product team (lead, backend)
- **Approved:** 2026-11-26 by Flovet (in chat: "Let's use a free provider for now", then sent a Groq key)
- **Specs:** specs/25-ai-foundation.md

## Context

[0036](0036-ai-provider-and-integration.md) starts every AI task on Claude Haiku 5.5. Its rule 7 also says evals decide when a task can move to a cheaper model, and that free tiers get fixture data only. The Anthropic account behind our key has no API credit, and a Claude Pro subscription doesn't pay for API calls, so `pnpm ai:eval` can't run. Flovet wants to test on a free provider for now.

## Research

| Reference              | What they do                                                                 | Adopt / adapt / reject | Why                                                                              |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| Groq free tier         | No card needed; rate-limited; open models; no inference data kept by default | Adopt (evals only)     | Free, fast, has an AI SDK provider, and runs structured output on `gpt-oss-120b` |
| Gemini free tier       | Free; uses inputs to improve Google's products; not offered in the EEA       | Reject                 | Can't be the path to real EU users, and trains on inputs                         |
| OpenRouter free models | Free models from many hosts; some log or train on prompts                    | Reject                 | Terms vary by model; no single answer for data handling                          |

Sources: the 0036 research block (provider table and its sources), and Groq's model list read with our key on 2026-11-26.

## Options

1. **Add Anthropic credit (about $5).** Tests on the model real users will get, but costs money.
2. **Groq's free tier for evals only.** Free. Tests the layer and the prompts, but on a different model than production.
3. **Groq for real users too.** Would need its terms checked as a processor and the privacy page changed. Too early.

## Decision

Option 2. `pnpm ai:eval --provider groq` runs the evals on Groq's `openai/gpt-oss-120b`, using the made-up fixtures only. The app's routing table doesn't change: real users stay on Anthropic, and Groq is never registered for `runTask`. Adds `@ai-sdk/groq` (pinned) and an optional, server-only `GROQ_API_KEY`.

## Consequences

- Evals can run for free now. A pass on Groq shows that the layer and the prompt work, not that Haiku passes; before a feature ships, its eval must pass on the model it's routed to.
- Never send real user data to Groq under this decision; the privacy page doesn't name it. Routing a real task to Groq needs a new decision and a privacy update (0011).
- A review should check that `src/lib/ai/registry.ts` doesn't register Groq, and that only the eval script uses it.
