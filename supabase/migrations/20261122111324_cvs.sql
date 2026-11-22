-- CVs, tailored versions and their history (decision 0016, spec 09).
-- Content is one jsonb document validated by the Zod schema in
-- src/features/cv/schemas.ts before every write; the database caps its size
-- and checks ownership. Every table carries user_id, so no policy needs a
-- join, and deleting the profile deletes everything here.

-- ── cvs: the master CVs a user builds ──────────────────────────────────

create table public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  language text not null check (language in ('en', 'fr')),
  market text not null check (market in ('FR', 'US')),
  -- Set by the CV templates decision; null means the default template.
  template text check (char_length(template) <= 40),
  content jsonb not null,
  schema_version int not null check (schema_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cvs_content_is_object check (jsonb_typeof(content) = 'object'),
  constraint cvs_content_size check (pg_column_size(content) <= 262144),
  -- Lets versions and revisions point at (id, user_id), so a row can only
  -- reference a CV of the same user.
  constraint cvs_id_user_id_key unique (id, user_id)
);

comment on table public.cvs is 'Master CVs. Owner-only (decision 0016).';

create index cvs_user_id_idx on public.cvs (user_id);

-- ── cv_versions: a CV tailored to one job ──────────────────────────────

create table public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  -- The master it came from. Deleting the master keeps the version.
  cv_id uuid,
  -- The job it was tailored for; a foreign key comes with the jobs tables.
  job_id uuid,
  title text not null check (char_length(title) between 1 and 120),
  language text not null check (language in ('en', 'fr')),
  market text not null check (market in ('FR', 'US')),
  template text check (char_length(template) <= 40),
  content jsonb not null,
  schema_version int not null check (schema_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cv_versions_content_is_object check (jsonb_typeof(content) = 'object'),
  constraint cv_versions_content_size check (pg_column_size(content) <= 262144),
  constraint cv_versions_id_user_id_key unique (id, user_id),
  constraint cv_versions_cv_fkey foreign key (cv_id, user_id)
    references public.cvs (id, user_id) on delete set null (cv_id)
);

comment on table public.cv_versions is 'CVs tailored to one job. Owner-only (decision 0016).';

create index cv_versions_user_id_idx on public.cv_versions (user_id);
create index cv_versions_cv_id_idx on public.cv_versions (cv_id, user_id);

-- ── cv_revisions: append-only history of a CV or a version ─────────────

create table public.cv_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  cv_id uuid,
  cv_version_id uuid,
  content jsonb not null,
  schema_version int not null check (schema_version >= 1),
  source text not null check (source in ('user', 'ai', 'import', 'restore')),
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now(),
  constraint cv_revisions_one_parent check (num_nonnulls(cv_id, cv_version_id) = 1),
  constraint cv_revisions_content_is_object check (jsonb_typeof(content) = 'object'),
  constraint cv_revisions_content_size check (pg_column_size(content) <= 262144),
  constraint cv_revisions_cv_fkey foreign key (cv_id, user_id)
    references public.cvs (id, user_id) on delete cascade,
  constraint cv_revisions_version_fkey foreign key (cv_version_id, user_id)
    references public.cv_versions (id, user_id) on delete cascade
);

comment on table public.cv_revisions is 'Append-only history of a CV or version. Owner-only, no updates or deletes (decision 0016).';

create index cv_revisions_user_id_idx on public.cv_revisions (user_id);
create index cv_revisions_cv_idx on public.cv_revisions (cv_id, user_id, created_at desc);
create index cv_revisions_version_idx on public.cv_revisions (cv_version_id, user_id, created_at desc);

-- ── Least privilege ────────────────────────────────────────────────────
-- No anon access. Signed-in users insert, read and delete their rows and
-- update only the editable columns; user_id and parents never change.
-- Revisions can only be added and read.

alter table public.cvs enable row level security;
alter table public.cv_versions enable row level security;
alter table public.cv_revisions enable row level security;

revoke all on table public.cvs, public.cv_versions, public.cv_revisions from anon, authenticated;

grant select, insert, delete on table public.cvs, public.cv_versions to authenticated;
grant update (title, language, market, template, content, schema_version)
  on table public.cvs to authenticated;
grant update (title, language, market, template, content, schema_version, job_id)
  on table public.cv_versions to authenticated;
grant select, insert on table public.cv_revisions to authenticated;

create policy "cvs: owner can read" on public.cvs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cvs: owner can insert" on public.cvs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cvs: owner can update" on public.cvs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "cvs: owner can delete" on public.cvs
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "cv_versions: owner can read" on public.cv_versions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cv_versions: owner can insert" on public.cv_versions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cv_versions: owner can update" on public.cv_versions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "cv_versions: owner can delete" on public.cv_versions
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "cv_revisions: owner can read" on public.cv_revisions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cv_revisions: owner can insert" on public.cv_revisions
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Keep updated_at current (function from the profiles migration).
create trigger cvs_set_updated_at
  before update on public.cvs
  for each row execute function public.set_updated_at();

create trigger cv_versions_set_updated_at
  before update on public.cv_versions
  for each row execute function public.set_updated_at();

-- ── Restore in one transaction ─────────────────────────────────────────
-- Writes the restored content to the CV or version the revision belongs to
-- and appends a 'restore' revision, so a failure leaves neither. The app
-- passes the content after migrating it to the current schema version
-- (migrateContent in src/features/cv/logic.ts). Runs as the caller, so RLS
-- applies: another user's revision is "not found".
create function public.restore_cv_revision(
  revision_id uuid,
  restored_content jsonb,
  restored_schema_version int
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source_revision public.cv_revisions;
  new_revision_id uuid;
begin
  select * into source_revision from public.cv_revisions where id = revision_id;
  if not found then
    raise exception 'revision not found' using errcode = 'P0002';
  end if;

  if source_revision.cv_id is not null then
    update public.cvs
      set content = restored_content, schema_version = restored_schema_version
      where id = source_revision.cv_id;
  else
    update public.cv_versions
      set content = restored_content, schema_version = restored_schema_version
      where id = source_revision.cv_version_id;
  end if;
  if not found then
    raise exception 'revision parent not found' using errcode = 'P0002';
  end if;

  insert into public.cv_revisions
    (cv_id, cv_version_id, content, schema_version, source, note)
  values (
    source_revision.cv_id,
    source_revision.cv_version_id,
    restored_content,
    restored_schema_version,
    'restore',
    'Restored the version of ' || to_char(source_revision.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC'
  )
  returning id into new_revision_id;

  return new_revision_id;
end;
$$;

revoke execute on function public.restore_cv_revision(uuid, jsonb, int) from public, anon;
grant execute on function public.restore_cv_revision(uuid, jsonb, int) to authenticated;
