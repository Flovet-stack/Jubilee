-- Spec 09, criterion 8: RLS, ownership and cascades for cvs, cv_versions
-- and cv_revisions. Runs in one transaction and rolls back, so it leaves no
-- data behind. Any failed check raises an exception and aborts the run.
-- Run against a database where the cvs migration has been applied.

begin;

-- Two users; the profiles trigger creates their profiles.
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('00000000-0000-4000-a000-0000000000a1', 'cv-a@test.invalid', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-0000000000b1', 'cv-b@test.invalid', '{}', 'authenticated', 'authenticated');

-- ── User A: every allowed action on their own rows ─────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-0000000000a1", "role": "authenticated"}', true);

do $$
declare
  n int;
  restored uuid;
begin
  -- user_id defaults to auth.uid()
  insert into public.cvs (id, title, language, market, content, schema_version)
  values ('00000000-0000-4000-c000-0000000000a1', 'A master', 'en', 'US', '{"basics": {}}', 1);
  select count(*) into n from public.cvs where user_id = '00000000-0000-4000-a000-0000000000a1';
  if n <> 1 then raise exception 'FAIL A insert cv: %', n; end if;

  insert into public.cv_versions (id, cv_id, title, language, market, content, schema_version)
  values ('00000000-0000-4000-d000-0000000000a1', '00000000-0000-4000-c000-0000000000a1', 'A for job', 'en', 'US', '{"basics": {}}', 1);

  insert into public.cv_revisions (id, cv_id, content, schema_version, source, note)
  values ('00000000-0000-4000-e000-0000000000a1', '00000000-0000-4000-c000-0000000000a1', '{"basics": {"v": 1}}', 1, 'ai', 'Tailored summary');
  insert into public.cv_revisions (cv_version_id, content, schema_version, source)
  values ('00000000-0000-4000-d000-0000000000a1', '{"basics": {}}', 1, 'user');

  update public.cvs set title = 'A renamed', content = '{"basics": {"v": 2}}' where id = '00000000-0000-4000-c000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL A update own cv'; end if;

  update public.cv_versions set title = 'A for job, edited', job_id = gen_random_uuid() where id = '00000000-0000-4000-d000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL A update own version'; end if;

  -- A deletes their own CV and version (throwaway rows), signed in.
  insert into public.cvs (id, title, language, market, content, schema_version)
  values ('00000000-0000-4000-c000-0000000000a2', 'Throwaway', 'fr', 'FR', '{}', 1);
  insert into public.cv_versions (id, cv_id, title, language, market, content, schema_version)
  values ('00000000-0000-4000-d000-0000000000a2', '00000000-0000-4000-c000-0000000000a2', 'Throwaway version', 'fr', 'FR', '{}', 1);
  delete from public.cv_versions where id = '00000000-0000-4000-d000-0000000000a2';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL A delete own version'; end if;
  delete from public.cvs where id = '00000000-0000-4000-c000-0000000000a2';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL A delete own cv'; end if;

  -- Restore: content goes back and a 'restore' revision is appended.
  select public.restore_cv_revision('00000000-0000-4000-e000-0000000000a1', '{"basics": {"v": 1}}', 1) into restored;
  if (select content from public.cvs where id = '00000000-0000-4000-c000-0000000000a1') <> '{"basics": {"v": 1}}'::jsonb then
    raise exception 'FAIL restore did not write content';
  end if;
  if (select source from public.cv_revisions where id = restored) <> 'restore' then
    raise exception 'FAIL restore revision missing';
  end if;
  -- The UI labels restores in the user's language; the database writes no text.
  if (select note from public.cv_revisions where id = restored) is not null then
    raise exception 'FAIL restore revision should have no note';
  end if;

  select count(*) into n from public.cv_revisions;
  if n <> 3 then raise exception 'FAIL A should see 3 revisions, saw %', n; end if;

  -- Can't move a row to another user, or change its parents.
  begin
    update public.cvs set user_id = '00000000-0000-4000-a000-0000000000b1' where id = '00000000-0000-4000-c000-0000000000a1';
    raise exception 'FAIL A could change user_id';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.cv_versions set cv_id = null where id = '00000000-0000-4000-d000-0000000000a1';
    raise exception 'FAIL A could change a version''s cv_id';
  exception when insufficient_privilege then null;
  end;

  -- Can't insert a row for someone else.
  begin
    insert into public.cvs (user_id, title, language, market, content, schema_version)
    values ('00000000-0000-4000-a000-0000000000b1', 'Forged', 'en', 'US', '{}', 1);
    raise exception 'FAIL A inserted a cv for B';
  exception when insufficient_privilege then null;
  end;

  -- Revisions are append-only.
  begin
    update public.cv_revisions set note = 'edited' where id = '00000000-0000-4000-e000-0000000000a1';
    raise exception 'FAIL A could update a revision';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.cv_revisions where id = '00000000-0000-4000-e000-0000000000a1';
    raise exception 'FAIL A could delete a revision';
  exception when insufficient_privilege then null;
  end;

  -- Database checks.
  begin
    insert into public.cvs (title, language, market, content, schema_version)
    values ('Bad', 'de', 'US', '{}', 1);
    raise exception 'FAIL language check';
  exception when check_violation then null;
  end;
  begin
    insert into public.cvs (title, language, market, content, schema_version)
    values ('Big', 'en', 'US', jsonb_build_object('x', (select string_agg(md5(i::text), '') from generate_series(1, 9000) i)), 1);
    raise exception 'FAIL content size cap';
  exception when check_violation then null;
  end;
  begin
    insert into public.cv_revisions (cv_id, cv_version_id, content, schema_version, source)
    values ('00000000-0000-4000-c000-0000000000a1', '00000000-0000-4000-d000-0000000000a1', '{}', 1, 'user');
    raise exception 'FAIL a revision with two parents';
  exception when check_violation then null;
  end;

  raise notice 'PASS user A: insert, update, restore; no user_id or parent change, no forged rows, append-only revisions, checks';
end $$;

-- B's own CV, made as B, for the cross-user checks below.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-0000000000b1", "role": "authenticated"}', true);
insert into public.cvs (id, title, language, market, content, schema_version)
values ('00000000-0000-4000-c000-0000000000b1', 'B master', 'fr', 'FR', '{}', 1);

-- ── User B: zero rows of A's, no writes to them ────────────────────────
do $$
declare
  n int;
begin
  select (select count(*) from public.cvs where user_id <> '00000000-0000-4000-a000-0000000000b1')
       + (select count(*) from public.cv_versions)
       + (select count(*) from public.cv_revisions)
    into n;
  if n <> 0 then raise exception 'FAIL user B sees % of A''s rows', n; end if;

  update public.cvs set title = 'Hacked' where id = '00000000-0000-4000-c000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B updated A''s cv'; end if;

  delete from public.cv_versions where id = '00000000-0000-4000-d000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B deleted A''s version'; end if;

  update public.cv_versions set title = 'Hacked' where id = '00000000-0000-4000-d000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B updated A''s version'; end if;

  delete from public.cvs where id = '00000000-0000-4000-c000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B deleted A''s cv'; end if;

  -- A version or revision can't point at another user's CV.
  begin
    insert into public.cv_versions (cv_id, title, language, market, content, schema_version)
    values ('00000000-0000-4000-c000-0000000000a1', 'Stolen', 'en', 'US', '{}', 1);
    raise exception 'FAIL B made a version of A''s cv';
  exception when foreign_key_violation then null;
  end;
  begin
    insert into public.cv_revisions (cv_id, content, schema_version, source)
    values ('00000000-0000-4000-c000-0000000000a1', '{}', 1, 'user');
    raise exception 'FAIL B added a revision to A''s cv';
  exception when foreign_key_violation then null;
  end;
  begin
    insert into public.cv_revisions (cv_version_id, content, schema_version, source)
    values ('00000000-0000-4000-d000-0000000000a1', '{}', 1, 'user');
    raise exception 'FAIL B added a revision to A''s version';
  exception when foreign_key_violation then null;
  end;

  -- Restoring A's revision finds nothing.
  begin
    perform public.restore_cv_revision('00000000-0000-4000-e000-0000000000a1', '{}', 1);
    raise exception 'FAIL B restored A''s revision';
  exception when no_data_found then null;
  end;

  raise notice 'PASS user B reads zero of A''s rows and can''t write, link to or restore them';
end $$;

-- ── anon: nothing ──────────────────────────────────────────────────────
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

do $$
begin
  begin
    perform 1 from public.cvs;
    raise exception 'FAIL anon can read cvs';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.cv_versions;
    raise exception 'FAIL anon can read versions';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.cv_revisions;
    raise exception 'FAIL anon can read revisions';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.cvs (user_id, title, language, market, content, schema_version)
    values ('00000000-0000-4000-a000-0000000000a1', 'Anon', 'en', 'US', '{}', 1);
    raise exception 'FAIL anon can insert a cv';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.cv_versions set title = 'Anon' where id = '00000000-0000-4000-d000-0000000000a1';
    raise exception 'FAIL anon can update a version';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.cvs where id = '00000000-0000-4000-c000-0000000000a1';
    raise exception 'FAIL anon can delete a cv';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.restore_cv_revision('00000000-0000-4000-e000-0000000000a1', '{}', 1);
    raise exception 'FAIL anon can call restore';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS anon has no access';
end $$;

-- ── Cascades (as the table owner) ──────────────────────────────────────
reset role;

do $$
declare
  n int;
begin
  -- Deleting a CV keeps its version, with cv_id null; the CV's revisions go.
  delete from public.cvs where id = '00000000-0000-4000-c000-0000000000a1';
  select count(*) into n from public.cv_versions
    where id = '00000000-0000-4000-d000-0000000000a1' and cv_id is null;
  if n <> 1 then raise exception 'FAIL deleting a cv should keep its version with cv_id null'; end if;
  select count(*) into n from public.cv_revisions where cv_id = '00000000-0000-4000-c000-0000000000a1';
  if n <> 0 then raise exception 'FAIL the cv''s revisions should be deleted'; end if;

  -- Deleting the auth user deletes everything of theirs.
  delete from auth.users where id = '00000000-0000-4000-a000-0000000000a1';
  select (select count(*) from public.cvs where user_id = '00000000-0000-4000-a000-0000000000a1')
       + (select count(*) from public.cv_versions where user_id = '00000000-0000-4000-a000-0000000000a1')
       + (select count(*) from public.cv_revisions where user_id = '00000000-0000-4000-a000-0000000000a1')
    into n;
  if n <> 0 then raise exception 'FAIL deleting the user left % rows', n; end if;

  -- B's data is untouched.
  select count(*) into n from public.cvs where user_id = '00000000-0000-4000-a000-0000000000b1';
  if n <> 1 then raise exception 'FAIL B''s cv was affected'; end if;

  raise notice 'PASS cascades: cv delete keeps versions, user delete removes all';
end $$;

select 'all checks passed' as result;

rollback;
