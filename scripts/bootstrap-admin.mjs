// One-time, server-side super_admin provisioning. Run locally/CI with the service-role key:
//   ADMIN_BOOTSTRAP_PASSWORD='...' node --env-file=.env.local scripts/bootstrap-admin.mjs
// Idempotent: never resets an existing user's password; refuses to run once a super_admin exists (unless --force-link).
import { createClient } from '@supabase/supabase-js';
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, ADMIN_BOOTSTRAP_PASSWORD: pw } = process.env;
const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@mediguide.ai').toLowerCase();
if (!url || !key) { console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'); process.exit(1); }
if (process.env.ADMIN_BOOTSTRAP_DISABLED === 'true') { console.error('Bootstrap disabled.'); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const { count } = await sb.from('admin_users').select('user_id', { count: 'exact', head: true }).eq('role', 'super_admin').eq('active', true);
if (count && !process.argv.includes('--force-link')) { console.log('A super_admin already exists. Nothing to do.'); process.exit(0); }
let id;
for (let page = 1; !id && page < 50; page++) {   // find existing auth user by email
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 }); if (error) throw error;
  id = data.users.find((u) => u.email?.toLowerCase() === email)?.id; if (data.users.length < 200) break;
}
if (!id) {
  if (!pw || pw.length < 12) { console.error('ADMIN_BOOTSTRAP_PASSWORD (min 12 chars) is required to create the account.'); process.exit(1); }
  const { data, error } = await sb.auth.admin.createUser({ email, password: pw, email_confirm: true }); if (error) throw error; id = data.user.id;
  console.log('Created auth user', email);
} else console.log('Linking existing auth user (password untouched):', email);
const { error } = await sb.from('admin_users').upsert({ user_id: id, role: 'super_admin', active: true }, { onConflict: 'user_id' });
if (error) throw error;
console.log('super_admin ready. Remove ADMIN_BOOTSTRAP_PASSWORD and the service-role key from your environment now.');
