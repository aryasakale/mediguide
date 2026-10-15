// Run: npm test  (Node >= 22.6). Pure logic only: RLS/SQL tests need a real Supabase DB (see README-ADMIN.md).
import test from 'node:test'; import assert from 'node:assert/strict';
import { can, ROLES } from '../src/lib/server/permissions.ts';
test('only super_admin can publish or manage roles', () => {
  for (const r of ROLES) { assert.equal(can(r, 'providers:publish'), r === 'super_admin'); assert.equal(can(r, 'roles:manage'), r === 'super_admin'); }
});
test('reviewer reviews but cannot write; provider_admin writes but cannot review', () => {
  assert.ok(can('reviewer', 'verification:review')); assert.ok(!can('reviewer', 'providers:write'));
  assert.ok(can('provider_admin', 'providers:write')); assert.ok(!can('provider_admin', 'verification:review'));
});
test('read_only_admin is read-only; null/undefined role has nothing', () => {
  assert.ok(can('read_only_admin', 'providers:read')); assert.ok(!can('read_only_admin', 'providers:write'));
  assert.ok(!can(null, 'dashboard:read')); assert.ok(!can(undefined, 'dashboard:read'));
});
