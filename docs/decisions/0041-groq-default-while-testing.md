# 0041: Groq as the default AI provider while Jubilee has test users only

- **Status:** Approved
- **Proposed:** 2026-11-26 by the product team (lead, backend)
- **Approved:** 2026-11-26 by Flovet (in chat: "It's okay to set the whole system to use groq now... for now we will be using only test users")
- **Supersedes:** 0040, for the routing table only (0040's eval flag stays)
- **Specs:** specs/26-ai-foundation.md

## Context

0036 started every task on Claude Haiku 5.5, and 0040 kept Groq to evals. The Anthropic account has no API credit, and Flovet wants the whole layer to run on Groq's free tier now, while only test users sign in. He also wants switching models to be a one-line change, which the first build didn't make obvious.

## Research

Builds on the 0036 provider research and 0040 (Groq's free tier: no card, rate-limited, no inference data kept by default, `openai/gpt-oss-120b` handles structured output). On 2026-11-26, 7 of 8 eval cases passed on it; `email.followup` fails on Groq's JSON mode with its placeholder prompt.

## Options

1. **Keep Haiku as default, fund Anthropic.** Costs a little; production-like.
2. **Groq for every task now, Haiku as fallback.** Free; fine for test users; Groq's free-tier rate limits are the risk.

## Decision

Option 2. `DEFAULT_MODEL` in `src/lib/ai/routing.ts` is `groq:openai/gpt-oss-120b`, with `anthropic:claude-haiku-5-5` as the fallback (used only when its key has credit). Providers live in one map (`src/lib/ai/providers/index.ts`): adding one is an entry there, its key in `src/env.ts` and its price in `pricing.ts`. Switching every task is one line (`DEFAULT_MODEL`); switching one task is a `model` on its row.

The privacy page names Groq and Anthropic.

## Consequences

- Before real users join, a new decision sets the production routes, after checking the chosen providers' processing terms (DPA, retention, region). This one is for test users only.
- Groq's free tier has rate limits; a busy test session may hit them, and the fallback only helps once Anthropic has credit.
- Each feature's eval must pass on the model it's routed to before it ships (0040).
