# 25: AI foundation

Status: Done (92/100, 2026-11-26) · Written: 2026-11-26

## Goal

Build the shared AI layer that every AI feature will call, so the first feature (LinkedIn import, #16) only has to write its prompt and schema. When this is done, a server-side call to `runTask` for any of the seven tasks goes to the model its route names, is checked against its Zod schemas, is logged with its cost and is refused once the user hits the daily limit. No user-facing AI feature ships in this spec.

## User lens

The full lens is in [0036](../docs/decisions/0036-ai-provider-and-integration.md#user-lens). For this spec, the user Aminata (29, data analyst in Paris) sees only two things:

- The privacy page names Anthropic and says what it receives, before any feature sends it her CV.
- When she reaches the daily limit, she gets a calm message telling her when it resets, not an error.

Everything else in this spec is invisible to her.

## Decisions

Implements [0036](../docs/decisions/0036-ai-provider-and-integration.md) (rules 1–7, 9 and 10, plus the starting setup), with these approvals Flovet gave in chat on 2026-11-26:

- Add `ai` and `@ai-sdk/anthropic` (pinned versions).
- Add the `ANTHROPIC_API_KEY` env var.
- Add a usage-log table (new migration and RLS).
- Daily limits of 10 AI tasks for free users and 100 for pass holders.

It also builds on:

- [0004](../docs/decisions/0004-auth-database-and-env.md): env and Supabase.
- [0011](../docs/decisions/0011-privacy-policy-page.md): the privacy page.
- [0003](../docs/decisions/0003-internationalisation.md): copy in the message files.

## Acceptance criteria

1. `ai` and `@ai-sdk/anthropic` are added at exact pinned versions. No other provider packages are added.
2. `src/env.ts` adds `ANTHROPIC_API_KEY` as an optional server-only string. It is never `NEXT_PUBLIC_`, and it is never read outside `src/lib/ai/`.
3. `src/lib/ai/` exists, every file in it imports `server-only`, and it holds:
   - `tasks.ts`: the seven task ids from 0036 (`cv.import`, `job.extract`, `cv.tailor`, `letter.write`, `cv.translate`, `cv.rewrite`, `email.followup`). Each id has its Zod input schema, its Zod output schema and a provider-neutral prompt builder. In this spec the schemas and prompts are placeholders that the feature specs fill in.
   - `routing.ts`: one table from each task to its `provider:model`, its fallbacks, its max output tokens and its temperature. Every task routes to `anthropic:claude-haiku-5-5`.
   - `registry.ts`: a `createProviderRegistry` that holds only the providers whose key is set. If a route points to a missing provider, startup fails with a clear message in production and a test fails in CI. If no key is set in dev or test, `runTask` returns an "AI unavailable" result instead of throwing.
   - `providers/anthropic.ts`: the Anthropic-only options, such as prompt caching on the system prompt. No feature code passes provider options.
   - `run-task.ts`: `runTask(taskId, input, { userId })` does the following, in order:
     1. Validates the input.
     2. Strips contact details (email, phone, street address) before sending.
     3. Checks the daily limit.
     4. Calls the routed model with structured output.
     5. Tries the fallbacks in order on a provider error.
     6. Validates the output.
     7. Writes one usage-log row.
     8. Returns a typed result, either `{ ok: true, data }` or `{ ok: false, reason }`, where `reason` is `limit`, `unavailable` or `failed`.
   - `pricing.ts`: the price per million input and output tokens for each model in the routing table, used to compute each row's cost. Haiku 5.5 is $0.10 in and $0.50 out.
4. The lint boundary test (`src/lib/import-boundaries.test.ts`) fails if any file outside `src/lib/ai/` imports `ai` or `@ai-sdk/*`.
5. A new migration creates `ai_usage` with these columns: `id`, `user_id` (references auth users, cascade on delete), `task`, `provider`, `model`, `input_tokens`, `output_tokens`, `cost_usd` (numeric), `ok` (bool), `error_reason`, `created_at`. RLS is on. Users can select their own rows; nothing can insert from the client (inserts go through the server's service role or a security-definer function). There is an index on `(user_id, created_at)`.
6. Daily limit: the count of today's `ok` rows (UTC) for that user is checked before the call. It is 10 for free users and 100 for pass holders. Until the pass exists (#35), every user is free, and the plan comes from one function (`getAiDailyLimit(userId)`) so #35 only has to change that function. Calls that fail don't count.
7. `scripts/ai-eval.ts`, run with `pnpm ai:eval [task]`, runs each task on fixture inputs in `src/lib/ai/fixtures/`: one French and one English CV, and one job ad. It prints pass or fail against the output schema, plus tokens and cost. Fixtures are made up; no real person's data. The script is not part of `pnpm check`, because it costs money.
8. Privacy page, all three message files: the AI section says, in plain words, that:
   - Jubilee uses Anthropic (Claude) to process the CV and job text you choose to send when you use an AI feature.
   - Your contact details are removed first.
   - Anthropic does not use this data to train its models.
   - The data is processed in the US under Anthropic's EU terms.
   - AI only suggests changes, and you accept each one.

   The page's "last updated" date changes.

9. Copy for the three failure reasons lives in the message files (`ai.errors.limit`, `ai.errors.unavailable`, `ai.errors.failed`). The limit message says it resets tomorrow; none of them say "error" or blame the user.
10. Unit tests (with the model mocked through the AI SDK's mock provider) cover:
    - routing to the right model, and fallback on a provider error
    - an output that fails its schema returns `failed`
    - contact details are stripped from the input
    - the limit refuses the 11th call of the day for a free user
    - one usage row is written per call, with the right cost
    - no key set returns `unavailable`

## Out of scope

- Any AI feature or UI beyond the error copy: import, tailoring, letters, translation and follow-ups each get their own spec.
- Other providers, and batch calls (`job.extract` nightly).
- A routing dashboard or routes stored in the database.
- The rule 8 "New fact: check this" flag, which belongs to the first spec that proposes CV changes.
- Vercel env setup. Flovet adds the key to Vercel when the first feature ships.

## Edge cases

- The key is missing in preview builds (Vercel previews are already failing; don't make it worse). The build must pass without the key.
- The provider times out: set a timeout per task, then fall back, then return `failed`.
- The model returns valid JSON that has the wrong shape: return `failed` and log it.
- Two calls arrive at once at the limit: an off-by-one is acceptable, so document it rather than lock the table.
- The user deletes their account: their usage rows cascade.
- Days are counted in UTC; the copy says "tomorrow", not a clock time.

## Files and patterns to follow

- `src/env.ts` (t3-env server block).
- `src/lib/supabase/` for the server client and the service-role pattern.
- `supabase/migrations/20261122111324_cvs.sql` for table, RLS and index style. Add a new migration; never edit an old one.
- `src/lib/import-boundaries.test.ts` for the import rule.
- The privacy page messages under `privacy.sections.ai` in `src/messages/*.json`, and `src/messages/messages.test.ts` for key parity.
- AI SDK docs for `createProviderRegistry`, `generateText` with `Output.object`, and `MockLanguageModel` for tests.

## Boundaries

- Always: server only; every model call goes through `runTask`; inputs and outputs validated; one usage row per call; tests mock the model.
- Ask first: any provider other than Anthropic; any change to the limits; sending real user data in the eval script.
- Never: send a user's contact details to the model; put the key in client code, logs or commits; use `any` or `@ts-ignore`; push to `main`.

## Check

- `pnpm check` passes, with and without `ANTHROPIC_API_KEY` set.
- The migration applies on a Supabase branch or locally, and an RLS check shows that a user sees only their own `ai_usage` rows and can't insert any.
- `pnpm ai:eval cv.import` runs once against the real key, and its output (pass, tokens, cost) is pasted in the PR.
- Screenshots of the privacy page's AI section at 390 px and 1440 px in English and French.
- Reviewer skill at 90 or more.

## Build notes (deviations, with reasons)

- `ai_usage.user_id` references `public.profiles(id)`, like every other table; profiles cascade from `auth.users`, so deleting an account still deletes the rows.
- `run-task.ts` is split into `run-task-core.ts` (the logic, with its dependencies passed in so tests mock them) and `index.ts` (the public `runTask`, wired to the real registry, limits and usage log).
- Writes go through `log_ai_usage`, a security-definer function granted to signed-in users. It pins `user_id` to `auth.uid()`, so a client can only add rows against its own limit; there is no service-role key in the app.
- `pnpm ai:eval [task]` runs `scripts/ai-eval.ts` through Vitest (`vitest.eval.config.ts`) from a small Node launcher, for TypeScript and the `@/` paths without a new dependency.
- One usage row per model attempt (not per `runTask`), so a failing provider shows in the log before its fallback succeeds.
- After review (decision 0039): providers are one map in `providers/index.ts`, and `routing.ts` has `DEFAULT_MODEL` (Groq's `gpt-oss-120b`) with Haiku as fallback, so switching every task is one line. The privacy page names Groq and Anthropic. Eval on the routing table: 7 of 8 pass; `email.followup` waits for its real prompt.
