import { getSupabase } from '@/lib/supabase/client';
export type AdminRole = 'super_admin' | 'provider_admin' | 'reviewer' | 'read_only_admin';
/** UX helper only. The authoritative check is server-side (middleware, API routes, RLS). Role comes from the admin_users table. */
export async function getAdminRole(): Promise<{ email: string; role: AdminRole } | null> {
  const sb = getSupabase(); if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser(); if (!user) return null;
  const { data } = await sb.from('admin_users').select('role,active').eq('user_id', user.id).maybeSingle();
  return data?.active ? { email: user.email ?? '', role: data.role as AdminRole } : null;
}
/** Returns an error message or null. */
export async function adminSignIn(email: string, password: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return 'Admin sign-in requires Supabase to be configured (see README).';
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return error.message === 'Invalid login credentials' ? 'Incorrect admin email or password.' : error.message;
  if (!(await getAdminRole())) { await sb.auth.signOut(); return 'This account does not have admin access.'; }
  return null;
}
export const validateEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.');
export const validatePassword = (v: string) =>
  v.length < 8 ? 'Use at least 8 characters.' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Include at least one letter and one number.' : '';
