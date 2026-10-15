// Creates (or links) the admin logins listed below. Nothing else in the project is changed.
// Run once, locally, with the service-role key in .env.local:
//   node --env-file=.env.local scripts/add-admins.mjs
// Existing accounts keep their current password unless you pass --reset-password.
import { createClient } from '@supabase/supabase-js';

// Edit this list to change the admin emails / passwords / roles.
// roles: super_admin | provider_admin (create/edit/submit) | reviewer | read_only_admin
const ADMINS = [
  { email: 'aryasakale976@gmail.com',  password: 'arya092006',    role: 'provider_admin' },
  { email: 'yashgavali621@gmail.com',  password: 'yash212007',    role: 'provider_admin' },
  { email: 'manishgavali2018@gmail.com', password: 'yashgavali2007', role: 'provider_admin' }, // was typed "gmailcom" - corrected
];

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
if (!url || !key) { console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.'); process.exit(1); }
const reset = process.argv.includes('--reset-password');
const sb = createClient(url, key, { auth: { persistSession: false } });

async function findUser(email) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 }); if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === email); if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
}

for (const a of ADMINS) {
  const email = a.email.trim().toLowerCase();
  try {
    let user = await findUser(email);
    if (!user) {
      const { data, error } = await sb.auth.admin.createUser({ email, password: a.password, email_confirm: true }); if (error) throw error;
      user = data.user; console.log('Created   ', email);
    } else if (reset) {
      const { error } = await sb.auth.admin.updateUserById(user.id, { password: a.password }); if (error) throw error;
      console.log('Password reset', email);
    } else console.log('Exists    ', email, '(password untouched)');
    const { error } = await sb.from('admin_users').upsert({ user_id: user.id, role: a.role, active: true }, { onConflict: 'user_id' });
    if (error) throw error;
    console.log('  -> role', a.role);
  } catch (e) { console.error('FAILED    ', email, e.message); }
}
