-- Restore revisions carry no note (spec 09 review). The note was English
-- text written by the database; the history screen (#14) builds the label
-- from source = 'restore' and created_at through the message files, so it
-- reads in the user's language. Same signature, so callers don't change.

create or replace function public.restore_cv_revision(
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
    null
  )
  returning id into new_revision_id;

  return new_revision_id;
end;
$$;

-- create or replace keeps the existing grants; restated so the file stands
-- on its own.
revoke execute on function public.restore_cv_revision(uuid, jsonb, int) from public, anon;
grant execute on function public.restore_cv_revision(uuid, jsonb, int) to authenticated;
