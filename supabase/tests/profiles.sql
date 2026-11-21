-- Spec 02, criterion 5: trigger and RLS checks for public.profiles.
-- Runs in one transaction and rolls back, so it leaves no data behind.
-- Any failed check raises an exception and aborts the run.
-- Run against a database where the profiles migration has been applied.

begin;

-- Three users: Google-shaped, LinkedIn-shaped and email-only metadata.
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('00000000-0000-4000-a000-00000000000a', 'a@test.invalid',
    '{"full_name": "Ada Google", "avatar_url": "https://example.test/a.png"}', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-00000000000b', 'b@test.invalid',
    '{"name": "Bea LinkedIn", "picture": "https://example.test/b.png"}', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-00000000000c', 'c@test.invalid',
    '{}', 'authenticated', 'authenticated');

do $$
declare
  n int;
  r record;
begin
  -- 1. One profile per new user, filled from provider metadata.
  select count(*) into n from public.profiles
  where id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b', '00000000-0000-4000-a000-00000000000c');
  if n <> 3 then raise exception 'FAIL trigger: expected 3 profiles, got %', n; end if;

  select * into r from public.profiles where id = '00000000-0000-4000-a000-00000000000a';
  if r.full_name is distinct from 'Ada Google' or r.avatar_url is distinct from 'https://example.test/a.png' then
    raise exception 'FAIL Google metadata: %', row_to_json(r);
  end if;

  select * into r from public.profiles where id = '00000000-0000-4000-a000-00000000000b';
  if r.full_name is distinct from 'Bea LinkedIn' or r.avatar_url is distinct from 'https://example.test/b.png' then
    raise exception 'FAIL LinkedIn metadata: %', row_to_json(r);
  end if;

  select * into r from public.profiles where id = '00000000-0000-4000-a000-00000000000c';
  if r.full_name is not null or r.avatar_url is not null then
    raise exception 'FAIL email-only user should have null name and avatar: %', row_to_json(r);
  end if;
  raise notice 'PASS trigger creates profiles from Google, LinkedIn and empty metadata';
end $$;

-- 2. User A sees and edits only their own row.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-00000000000a", "role": "authenticated"}', true);

do $$
declare
  n int;
begin
  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'FAIL user A should see 1 row, saw %', n; end if;

  update public.profiles set full_name = 'Ada Edited' where id = '00000000-0000-4000-a000-00000000000a';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL user A could not update own row'; end if;

  update public.profiles set full_name = 'Hacked' where id = '00000000-0000-4000-a000-00000000000b';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL user A updated user B'; end if;

  begin
    update public.profiles set id = '00000000-0000-4000-a000-00000000000b' where id = '00000000-0000-4000-a000-00000000000a';
    raise exception 'FAIL user A could change id';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.profiles (id) values ('00000000-0000-4000-a000-0000000000ff');
    raise exception 'FAIL user A could insert a profile';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.profiles where id = '00000000-0000-4000-a000-00000000000a';
    raise exception 'FAIL user A could delete a profile';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS user A reads and edits only own row; no id change, insert or delete';
end $$;

-- 3. User B reads zero rows of user A.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-00000000000b", "role": "authenticated"}', true);

do $$
declare
  n int;
begin
  select count(*) into n from public.profiles where id = '00000000-0000-4000-a000-00000000000a';
  if n <> 0 then raise exception 'FAIL user B can see user A'; end if;
  raise notice 'PASS user B reads zero rows of user A';
end $$;

-- 4. anon has no access at all.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

do $$
begin
  begin
    perform 1 from public.profiles;
    raise exception 'FAIL anon can read profiles';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS anon has no access';
end $$;

-- 5. User A's edit was saved, and deleting the auth user deletes the profile.
reset role;

do $$
declare
  n int;
  r record;
begin
  select * into r from public.profiles where id = '00000000-0000-4000-a000-00000000000a';
  if r.full_name is distinct from 'Ada Edited' then raise exception 'FAIL edit by user A not saved'; end if;

  delete from auth.users where id = '00000000-0000-4000-a000-00000000000a';
  select count(*) into n from public.profiles where id = '00000000-0000-4000-a000-00000000000a';
  if n <> 0 then raise exception 'FAIL profile survived auth user deletion'; end if;
  raise notice 'PASS deleting the auth user deletes the profile';
end $$;

select 'ALL PROFILE CHECKS PASSED' as result;

rollback;
