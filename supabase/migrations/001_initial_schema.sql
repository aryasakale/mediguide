-- MediGuide: run once in Supabase -> SQL Editor.
create table if not exists public.healthcare_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Hospital','Clinic','Doctor','Pharmacy')),
  address text not null, city text not null, state text not null, postal_code text, phone text,
  services text[] not null default '{}', specialties text[] not null default '{}', languages text[] not null default '{English}',
  hours text not null default 'Hours not provided',
  open24h boolean not null default false, emergency boolean not null default false,
  rating numeric(2,1) check (rating between 0 and 5),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  publication_status text not null default 'draft' check (publication_status in ('draft','published','archived')),
  verified boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists healthcare_providers_location_idx on public.healthcare_providers (latitude, longitude);
create index if not exists healthcare_providers_status_idx on public.healthcare_providers (publication_status);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_touch on public.healthcare_providers;
create trigger trg_touch before update on public.healthcare_providers for each row execute function public.touch_updated_at();

-- Admin = app_metadata.role = 'admin'. app_metadata can only be changed server-side, never by a user signing up.
create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' $$;

alter table public.healthcare_providers enable row level security;
drop policy if exists "read published or admin" on public.healthcare_providers;
drop policy if exists "admin insert" on public.healthcare_providers;
drop policy if exists "admin update" on public.healthcare_providers;
drop policy if exists "admin delete" on public.healthcare_providers;
create policy "read published or admin" on public.healthcare_providers for select using (publication_status = 'published' or public.is_admin());
create policy "admin insert" on public.healthcare_providers for insert with check (public.is_admin());
create policy "admin update" on public.healthcare_providers for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.healthcare_providers for delete using (public.is_admin());

-- Real-time updates to the user site
alter publication supabase_realtime add table public.healthcare_providers;

-- CREATE YOUR ADMIN: first add the user in Authentication -> Users (use a DIFFERENT email than your normal user account), then:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}' where email = 'your-admin@example.com';
