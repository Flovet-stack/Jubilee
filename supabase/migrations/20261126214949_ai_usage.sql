-- One row per AI call (decision 0036, spec 25): which task, which model,
-- tokens and cost. Never the text sent or received. Users read their own
-- rows; rows are written only through log_ai_usage, which pins user_id to
-- the caller, so the client can't write rows for anyone else.

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task text not null check (char_length(task) between 1 and 40),
  provider text not null check (char_length(provider) between 1 and 40),
  model text not null check (char_length(model) between 1 and 80),
  input_tokens int not null default 0 check (input_tokens >= 0),
  output_tokens int not null default 0 check (output_tokens >= 0),
  cost_usd numeric(12, 6) not null default 0 check (cost_usd >= 0),
  ok boolean not null,
  error_reason text check (char_length(error_reason) <= 200),
  created_at timestamptz not null default now()
);

comment on table public.ai_usage is 'One row per AI call: task, model, tokens, cost. No content (decision 0036).';

create index ai_usage_user_id_created_at_idx on public.ai_usage (user_id, created_at);

alter table public.ai_usage enable row level security;

create policy "Users read their own AI usage"
  on public.ai_usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert, update or delete policy: writes go through the function below.

create function public.log_ai_usage(
  p_task text,
  p_provider text,
  p_model text,
  p_input_tokens int,
  p_output_tokens int,
  p_cost_usd numeric,
  p_ok boolean,
  p_error_reason text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.ai_usage
    (user_id, task, provider, model, input_tokens, output_tokens, cost_usd, ok, error_reason)
  select auth.uid(), p_task, p_provider, p_model, p_input_tokens, p_output_tokens, p_cost_usd, p_ok, p_error_reason
  where auth.uid() is not null;
$$;

revoke execute on function public.log_ai_usage(text, text, text, int, int, numeric, boolean, text) from public, anon;
grant execute on function public.log_ai_usage(text, text, text, int, int, numeric, boolean, text) to authenticated;
