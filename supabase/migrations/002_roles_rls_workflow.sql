-- 002: roles, profiles, verification workflow, saved providers, audit log, RLS, storage. Run after 001.
-- Credentials stay in auth.users; nothing here stores passwords. Admin role lives ONLY in admin_users (never JWT/profile fields).

-- ---------- admin roles ----------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','provider_admin','reviewer','read_only_admin')),
  active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Role of the caller (null if not an active admin). SECURITY DEFINER avoids RLS recursion; search_path pinned.
create or replace function public.admin_role() returns text language sql stable security definer set search_path = public as $$
  select role from public.admin_users where user_id = auth.uid() and active $$;

-- Permission matrix (mirrored in src/lib/server/permissions.ts).
create or replace function public.has_perm(p text) returns boolean language sql stable security definer set search_path = public as $$
  select case public.admin_role()
    when 'super_admin' then true
    when 'provider_admin' then p in ('dashboard:read','providers:read','providers:write')
    when 'reviewer' then p in ('dashboard:read','providers:read','verification:review')
    when 'read_only_admin' then p in ('dashboard:read','providers:read')
    else false end $$;
revoke all on function public.admin_role(), public.has_perm(text) from public, anon;
grant execute on function public.admin_role(), public.has_perm(text) to authenticated;

-- ---------- profiles (auto-created, idempotent) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text check (char_length(full_name) <= 120), phone text check (char_length(phone) <= 30),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data ->> 'full_name') on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles (id, email) select id, email from auth.users on conflict (id) do nothing;

-- ---------- provider workflow columns ----------
alter table public.healthcare_providers
  add column if not exists verification_status text not null default 'pending' check (verification_status in ('pending','under_review','verified','rejected')),
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text,
  add column if not exists updated_by uuid references auth.users(id);
-- Nothing was ever verified by a real process before this migration: reset, and keep legacy boolean as a derived value.
update public.healthcare_providers set verification_status = 'pending';
alter table public.healthcare_providers alter column verified set default false;
create index if not exists hp_verif_idx on public.healthcare_providers (verification_status) where submitted_at is not null;
create index if not exists hp_name_idx on public.healthcare_providers (lower(name));
create index if not exists hp_city_idx on public.healthcare_providers (lower(city));

create table if not exists public.provider_verifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.healthcare_providers(id) on delete cascade,
  status text not null check (status in ('under_review','verified','rejected')),
  notes text check (char_length(notes) <= 2000),
  reviewer_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists pv_provider_idx on public.provider_verifications (provider_id, created_at desc);

create table if not exists public.saved_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  provider_id uuid not null references public.healthcare_providers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, provider_id)
);

create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid, action text not null, entity_type text not null, entity_id text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists aal_created_idx on public.admin_activity_logs (created_at desc);

-- ---------- triggers ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['admin_users','profiles'] loop
    execute format('drop trigger if exists trg_touch on public.%I; create trigger trg_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop; end $$;

-- Enforces the workflow no matter which client writes. auth.uid() is null for service-role/SQL editor => trusted, bypassed.
create or replace function public.guard_provider() returns trigger language plpgsql security definer set search_path = public as $$
declare r text := public.admin_role(); uid uuid := auth.uid();
begin
  if uid is null then new.verified := (new.verification_status = 'verified'); return new; end if;
  if tg_op = 'INSERT' then
    new.created_by := uid; new.verification_status := 'pending'; new.reviewed_by := null; new.reviewed_at := null; new.review_notes := null;
    if new.publication_status <> 'draft' then raise exception 'New providers must start as draft' using errcode = '42501'; end if;
  else
    if new.created_by is distinct from old.created_by then raise exception 'created_by is immutable' using errcode = '42501'; end if;
    -- verification fields: only via review_provider() (which sets app.in_review) or super_admin
    if (new.verification_status, new.reviewed_by, new.reviewed_at, new.review_notes) is distinct from (old.verification_status, old.reviewed_by, old.reviewed_at, old.review_notes)
       and coalesce(current_setting('app.in_review', true), '') <> '1' then
      raise exception 'Verification can only be changed through the review workflow' using errcode = '42501';
    end if;
    if new.publication_status is distinct from old.publication_status then
      if new.publication_status = 'published' and (r is distinct from 'super_admin') then raise exception 'Only super_admin can publish' using errcode = '42501'; end if;
      if new.publication_status = 'published' and new.verification_status <> 'verified' then raise exception 'Provider must be verified before publishing' using errcode = '23514'; end if;
      if new.publication_status = 'archived' and r is distinct from 'super_admin' then raise exception 'Only super_admin can archive' using errcode = '42501'; end if;
      if old.publication_status = 'archived' and r is distinct from 'super_admin' then raise exception 'Only super_admin can restore' using errcode = '42501'; end if;
    end if;
    -- editing core data of a verified provider sends it back to pending review (and cannot stay published unverified)
    if new.verification_status = 'verified' and coalesce(current_setting('app.in_review', true), '') <> '1'
       and (new.name, new.address, new.city, new.latitude, new.longitude, new.category) is distinct from (old.name, old.address, old.city, old.latitude, old.longitude, old.category) then
      new.verification_status := 'pending'; new.submitted_at := null;
      if new.publication_status = 'published' then new.publication_status := 'draft'; end if;
    end if;
  end if;
  new.updated_by := uid; new.verified := (new.verification_status = 'verified');
  return new;
end $$;
drop trigger if exists trg_guard on public.healthcare_providers;
create trigger trg_guard before insert or update on public.healthcare_providers for each row execute function public.guard_provider();

-- Review decision: atomic (status + history). Reviewers/super_admin only; nobody reviews a record they created.
create or replace function public.review_provider(p_id uuid, p_status text, p_notes text default null) returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); prov public.healthcare_providers;
begin
  if not public.has_perm('verification:review') then raise exception 'Not allowed' using errcode = '42501'; end if;
  if p_status not in ('under_review','verified','rejected') then raise exception 'Invalid status' using errcode = '22023'; end if;
  if p_status = 'rejected' and coalesce(btrim(p_notes), '') = '' then raise exception 'A reason is required to reject' using errcode = '22023'; end if;
  select * into prov from public.healthcare_providers where id = p_id for update;
  if not found then raise exception 'Provider not found' using errcode = 'P0002'; end if;
  if prov.created_by = uid and public.admin_role() <> 'super_admin' then raise exception 'You cannot review a record you created' using errcode = '42501'; end if;
  if prov.submitted_at is null then raise exception 'Provider has not been submitted for verification' using errcode = '23514'; end if;
  perform set_config('app.in_review', '1', true);
  update public.healthcare_providers set verification_status = p_status, reviewed_by = uid, reviewed_at = now(), review_notes = p_notes where id = p_id;
  insert into public.provider_verifications (provider_id, status, notes, reviewer_id) values (p_id, p_status, p_notes, uid);
end $$;
revoke all on function public.review_provider(uuid, text, text) from public, anon;
grant execute on function public.review_provider(uuid, text, text) to authenticated;

-- Submit for verification (provider writers).
create or replace function public.submit_provider(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_perm('providers:write') then raise exception 'Not allowed' using errcode = '42501'; end if;
  perform set_config('app.in_review', '1', true);
  update public.healthcare_providers set submitted_at = now(), verification_status = 'pending', reviewed_by = null, reviewed_at = null, review_notes = null where id = p_id;
  if not found then raise exception 'Provider not found' using errcode = 'P0002'; end if;
end $$;
revoke all on function public.submit_provider(uuid) from public, anon;
grant execute on function public.submit_provider(uuid) to authenticated;

-- Role-table protection: no self-change, never remove the last active super_admin.
create or replace function public.guard_admin_users() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  if tg_op in ('UPDATE','DELETE') and old.user_id = auth.uid() then raise exception 'You cannot change your own admin role' using errcode = '42501'; end if;
  if tg_op in ('UPDATE','DELETE') and old.role = 'super_admin' and old.active
     and not exists (select 1 from public.admin_users where role = 'super_admin' and active and user_id <> old.user_id) then
    raise exception 'Cannot remove the last active super_admin' using errcode = '23514'; end if;
  return coalesce(new, old);
end $$;
drop trigger if exists trg_guard_admin on public.admin_users;
create trigger trg_guard_admin before insert or update or delete on public.admin_users for each row execute function public.guard_admin_users();

-- Audit: written by DB triggers only; no client write policies exist.
create or replace function public.audit() returns trigger language plpgsql security definer set search_path = public as $$
declare a text; m jsonb := '{}'::jsonb; eid text;
begin
  if tg_table_name = 'healthcare_providers' then
    eid := new.id::text;
    if tg_op = 'INSERT' then a := 'provider.create'; m := jsonb_build_object('name', new.name);
    elsif new.publication_status is distinct from old.publication_status then a := 'provider.' || case new.publication_status when 'published' then 'publish' when 'archived' then 'archive' else 'unpublish' end; m := jsonb_build_object('from', old.publication_status, 'to', new.publication_status);
    elsif new.verification_status is distinct from old.verification_status then a := 'provider.verification.' || new.verification_status; m := jsonb_build_object('from', old.verification_status);
    else a := 'provider.update'; m := jsonb_build_object('name', new.name); end if;
  elsif tg_table_name = 'admin_users' then
    eid := coalesce(new.user_id, old.user_id)::text;
    a := case tg_op when 'INSERT' then 'admin.grant' when 'DELETE' then 'admin.revoke' else 'admin.update' end;
    m := jsonb_build_object('role', coalesce(new.role, old.role), 'active', coalesce(new.active, old.active));
  end if;
  insert into public.admin_activity_logs (actor_id, action, entity_type, entity_id, metadata) values (auth.uid(), a, tg_table_name, eid, m);
  return coalesce(new, old);
end $$;
drop trigger if exists trg_audit on public.healthcare_providers; create trigger trg_audit after insert or update on public.healthcare_providers for each row execute function public.audit();
drop trigger if exists trg_audit on public.admin_users; create trigger trg_audit after insert or update or delete on public.admin_users for each row execute function public.audit();

-- ---------- RLS ----------
alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.healthcare_providers enable row level security;
alter table public.provider_verifications enable row level security;
alter table public.saved_providers enable row level security;
alter table public.admin_activity_logs enable row level security;

drop policy if exists "read published or admin" on public.healthcare_providers;
drop policy if exists "admin insert" on public.healthcare_providers;
drop policy if exists "admin update" on public.healthcare_providers;
drop policy if exists "admin delete" on public.healthcare_providers;
drop function if exists public.is_admin();
create policy hp_select on public.healthcare_providers for select using (publication_status = 'published' or public.has_perm('providers:read'));
create policy hp_insert on public.healthcare_providers for insert with check (public.has_perm('providers:write'));
create policy hp_update on public.healthcare_providers for update using (public.has_perm('providers:write')) with check (public.has_perm('providers:write'));
-- Archive instead of delete: no DELETE policy (only service role can hard-delete).

create policy au_select on public.admin_users for select using (user_id = auth.uid() or public.admin_role() = 'super_admin');
create policy au_write on public.admin_users for all using (public.admin_role() = 'super_admin') with check (public.admin_role() = 'super_admin');

create policy pr_select on public.profiles for select using (id = auth.uid() or public.admin_role() = 'super_admin');
create policy pr_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone, preferences) on public.profiles to authenticated;   -- email/id immutable by users

create policy pv_select on public.provider_verifications for select using (public.has_perm('providers:read'));
create policy sp_select on public.saved_providers for select using (user_id = auth.uid());
create policy sp_insert on public.saved_providers for insert with check (user_id = auth.uid() and exists (select 1 from public.healthcare_providers p where p.id = provider_id and p.publication_status = 'published'));
create policy sp_delete on public.saved_providers for delete using (user_id = auth.uid());
create policy aal_select on public.admin_activity_logs for select using (public.admin_role() = 'super_admin');

revoke all on public.admin_activity_logs, public.provider_verifications from anon, authenticated;
grant select on public.admin_activity_logs, public.provider_verifications to authenticated;
revoke all on public.admin_users from anon; revoke all on public.profiles, public.saved_providers from anon;

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('provider-media', 'provider-media', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('provider-docs', 'provider-docs', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists media_write on storage.objects; drop policy if exists media_delete on storage.objects;
drop policy if exists docs_read on storage.objects; drop policy if exists docs_write on storage.objects; drop policy if exists docs_delete on storage.objects;
create policy media_write on storage.objects for insert with check (bucket_id = 'provider-media' and public.has_perm('providers:write'));
create policy media_delete on storage.objects for delete using (bucket_id = 'provider-media' and public.has_perm('providers:write'));
create policy docs_read on storage.objects for select using (bucket_id = 'provider-docs' and (public.has_perm('verification:review') or public.has_perm('providers:write')));
create policy docs_write on storage.objects for insert with check (bucket_id = 'provider-docs' and public.has_perm('providers:write'));
create policy docs_delete on storage.objects for delete using (bucket_id = 'provider-docs' and public.has_perm('providers:write'));
