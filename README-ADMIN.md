# MediGuide AI: backend setup

## Setup
1. `npm install`; copy `.env.example` to `.env.local` and fill the Supabase URL + anon key.
2. Supabase SQL Editor: run `supabase/migrations/001_initial_schema.sql`, then `002_roles_rls_workflow.sql`.
3. Auth -> URL Configuration: Site URL = your app URL; add redirect URLs `/reset-password` and `/login`. Keep "Confirm email" ON.
4. Create the first admin (server-side, one time): set `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_BOOTSTRAP_PASSWORD` (12+ chars) in your shell, then
   `node --env-file=.env.local scripts/bootstrap-admin.mjs`. It never resets an existing password and does nothing once a super_admin exists. Afterwards remove both secrets from the environment.
5. `npm run dev` -> users `/login`, admins `/admin/login`.
6. Optional AI: set `AI_PROVIDER_API_KEY` (server-side only). Without it the chat shows a flagged demo reply.

**Admin recovery:** reset the password in Supabase Auth, or re-run the script with `--force-link` (links/creates the super_admin without touching an existing password).

## Security model
- Admin role exists ONLY in `admin_users` (not JWT, profile, or client state). Checked in middleware, in every `/api/admin/*` handler (`requireAdmin`), and again by RLS + triggers.
- Permission matrix: `public.has_perm()` (SQL) mirrors `src/lib/server/permissions.ts`.
  super_admin: all. provider_admin: create/edit/submit, cannot publish/archive/verify. reviewer: review only. read_only_admin: read.
- Publishing requires `super_admin` AND `verification_status = 'verified'` (trigger `guard_provider`). Verification changes only via `review_provider()` (atomic, writes history, never publishes). Non-super-admins cannot review records they created. Editing a verified record's name/address/location resets it to pending.
- Role changes: super_admin only; no self-change; last active super_admin cannot be removed.
- No DELETE policy on providers (archive instead). Audit log is written by DB triggers; no client write policy.
- Profiles: users may update only full_name/phone/preferences (column grants). Saved providers: own rows only, unique per provider.
- Storage: `provider-media` public images (5 MB); `provider-docs` private (10 MB), readable only by admin roles.

## API
Public: `GET /api/providers` (q, city, category, specialty, verified, sort, page, size). `POST /api/assistant`.
User: `GET|PATCH /api/user/profile`. (Saved providers use the browser client under RLS.)
Admin: `GET /api/admin/dashboard|verification|users|activity-logs`, `PATCH /api/admin/verification/[id]`, `PATCH /api/admin/users/[id]/role`, `POST /api/admin/providers/[id]/publish|archive|submit`.

## Not done / not verified (be aware)
- SQL migrations and RLS were NOT executed against a live Supabase instance (none available here). Run them on a staging project and test each role before production.
- No automated tests were written or run. Only `tsc --noEmit` and `next build` were run (both pass).
- Not implemented: normalized provider tables (addresses, fees, insurance, media, documents), specialties/services management pages, file-upload UI (buckets + policies exist), `/admin/roles|settings|locations` pages, admin provider list API (admin pages use the browser client under RLS), saved-providers API routes, reviews, appointments, emergency-number data source, server-side distance search. The existing Leaflet location picker is retained as-is.
- Demo mode (no Supabase) still works for user pages using sample data flagged as unverified; admin now requires Supabase. Rate limiting is in-memory (per instance).

## Update: migration 003, new APIs, tests

- Apply `supabase/migrations/003_legacy_fix_catalog_media.sql` after 001/002. It demotes legacy published-but-unverified rows to draft, and adds `catalog_items` (specialties/services) and `provider_media` (image/document metadata; documents are admin-only, served by 5-minute signed URLs).
- Demo mode (localStorage data, demo login) now works only when `NODE_ENV !== 'production'`. A production build without Supabase keys shows "not configured" and no data; it never fakes success.
- Admin provider create/edit/status changes go through server APIs (`/api/admin/providers`, `/[id]`, `/publish`, `/archive`, `/restore`, `/media`). `publication_status` and verification can't be set through create/edit.
- Public: `GET /api/providers`, `GET /api/providers/[id]`. User: `GET/POST/DELETE /api/saved`. Admin catalog: `/api/admin/catalog/[kind]` and page `/admin/catalog`.
- Tests: `npm test` (permission matrix, no DB needed). `psql "$DB_URL" -f tests/rls.sql` checks RLS/role boundaries on a scratch DB with 001-003 applied (all pass on local Postgres 16 with Supabase stubs).

## Still not done
Normalized address/contact/hours/fee/insurance tables; image/document upload UI (API and storage policies exist); /admin/locations, /roles, /settings pages; distance/price/facility search; regional emergency data; ESLint config; shared-store rate limiting; Nominatim proxy; appointments; end-to-end browser tests.
