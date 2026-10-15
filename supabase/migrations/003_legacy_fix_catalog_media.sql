-- 003: demote legacy published-but-unverified rows; add catalogs (specialties, services) and media/documents metadata.
-- Does not edit 001/002. Idempotent.
update public.healthcare_providers set publication_status = 'draft'
 where publication_status = 'published' and verification_status <> 'verified';

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('specialty','service')),
  name text not null check (length(trim(name)) between 2 and 80),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, name)
);
create table if not exists public.provider_media (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.healthcare_providers(id) on delete cascade,
  bucket text not null check (bucket in ('provider-media','provider-docs')),
  path text not null check (path like provider_id::text || '/%'),
  kind text not null check (kind in ('image','document')),
  label text, created_by uuid references auth.users(id), created_at timestamptz not null default now(),
  unique (bucket, path),
  check ((kind = 'image' and bucket = 'provider-media') or (kind = 'document' and bucket = 'provider-docs'))
);
create index if not exists pm_provider_idx on public.provider_media (provider_id);

alter table public.catalog_items enable row level security;
alter table public.provider_media enable row level security;
drop policy if exists ci_select on public.catalog_items; drop policy if exists ci_write on public.catalog_items;
drop policy if exists pm_select on public.provider_media; drop policy if exists pm_write on public.provider_media; drop policy if exists pm_delete on public.provider_media;
create policy ci_select on public.catalog_items for select using (active or public.has_perm('providers:read'));
create policy ci_write on public.catalog_items for all using (public.has_perm('providers:write')) with check (public.has_perm('providers:write'));
-- images follow provider visibility; documents are admin-only
create policy pm_select on public.provider_media for select using (
  public.has_perm('providers:read') or (kind = 'image' and exists (select 1 from public.healthcare_providers p where p.id = provider_id and p.publication_status = 'published')));
create policy pm_write on public.provider_media for insert with check (public.has_perm('providers:write'));
create policy pm_delete on public.provider_media for delete using (public.has_perm('providers:write'));

-- seed catalogs from existing provider arrays so the lists are never empty/fake
insert into public.catalog_items (kind, name)
  select 'specialty', trim(s) from public.healthcare_providers, unnest(specialties) s where length(trim(s)) >= 2 on conflict do nothing;
insert into public.catalog_items (kind, name)
  select 'service', trim(s) from public.healthcare_providers, unnest(services) s where length(trim(s)) >= 2 on conflict do nothing;
