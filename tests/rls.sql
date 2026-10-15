-- RLS/role boundary tests. Run against a scratch Postgres/Supabase DB with migrations 001-003 applied:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/rls.sql
-- Everything runs in one transaction and is rolled back.
begin;
create or replace function pg_temp.as_user(u uuid) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', u::text, true); end $$;
create or replace function pg_temp.expect_fail(q text, label text) returns void language plpgsql as $$
begin begin execute q; raise exception 'EXPECTED FAILURE DID NOT HAPPEN: %', label; exception when raise_exception then raise; when others then raise notice 'ok (blocked): %', label; end; end $$;
create or replace function pg_temp.expect_zero_rows(q text, label text) returns void language plpgsql as $$ declare n int; begin execute q; get diagnostics n = row_count; if n <> 0 then raise exception 'EXPECTED 0 ROWS, got %: %', n, label; end if; raise notice 'ok (0 rows, hidden by RLS): %', label; end $$;
insert into auth.users(id,email) values ('00000000-0000-0000-0000-000000000001','sa@t'),('00000000-0000-0000-0000-000000000002','pa@t'),('00000000-0000-0000-0000-000000000003','rv@t'),('00000000-0000-0000-0000-000000000004','u@t');
insert into public.admin_users(user_id,role,active) values ('00000000-0000-0000-0000-000000000001','super_admin',true),('00000000-0000-0000-0000-000000000002','provider_admin',true),('00000000-0000-0000-0000-000000000003','reviewer',true);
set local role authenticated;
-- provider_admin creates a draft
select pg_temp.as_user('00000000-0000-0000-0000-000000000002');
insert into public.healthcare_providers(id,name,category,address,city,state,latitude,longitude) values ('10000000-0000-0000-0000-000000000001','T','Clinic','a','c','s',18.5,73.8);
select pg_temp.expect_fail($$update public.healthcare_providers set publication_status='published' where id='10000000-0000-0000-0000-000000000001'$$, 'provider_admin cannot publish');
select pg_temp.expect_fail($$update public.healthcare_providers set verification_status='verified' where id='10000000-0000-0000-0000-000000000001'$$, 'provider_admin cannot self-verify');
select pg_temp.expect_fail($$insert into public.admin_users(user_id,role,active) values ('00000000-0000-0000-0000-000000000004','super_admin',true)$$, 'provider_admin cannot grant roles');
-- plain user / anon see nothing unpublished
select pg_temp.as_user('00000000-0000-0000-0000-000000000004');
do $$ begin if (select count(*) from public.healthcare_providers) <> 0 then raise exception 'user sees draft'; end if; end $$;
select pg_temp.expect_fail($$insert into public.healthcare_providers(name,category,address,city,state,latitude,longitude) values ('x','Clinic','a','c','s',1,1)$$, 'plain user cannot insert provider');
select pg_temp.expect_fail($$select * from public.admin_activity_logs where false; insert into public.admin_activity_logs(action,entity_type) values ('x','y')$$, 'user cannot write audit log');
-- unverified cannot be published even by super_admin
select pg_temp.as_user('00000000-0000-0000-0000-000000000001');
select pg_temp.expect_fail($$update public.healthcare_providers set publication_status='published' where id='10000000-0000-0000-0000-000000000001'$$, 'cannot publish unverified');
select pg_temp.expect_fail($$update public.admin_users set active=false where user_id='00000000-0000-0000-0000-000000000001'$$, 'last super_admin cannot be removed');
-- (RLS makes disallowed UPDATEs affect 0 rows rather than raise)
-- reviewer cannot edit providers, can review
select pg_temp.as_user('00000000-0000-0000-0000-000000000003');
select pg_temp.expect_zero_rows($$update public.healthcare_providers set name='hack' where id='10000000-0000-0000-0000-000000000001'$$, 'reviewer cannot edit');
select pg_temp.as_user('00000000-0000-0000-0000-000000000002');
select pg_temp.expect_fail($$select 1/0$$, 'sanity: expect_fail catches errors');
rollback;
