import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new ConfigError('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  return { url, anon };
}
export class ConfigError extends Error {}

/** Per-request client acting as the signed-in user (RLS applies). */
export function userClient() {
  const { url, anon } = env(); const store = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (c: { name: string; value: string; options: CookieOptions }[]) => { try { c.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* read-only context */ } },
    },
  });
}
/** Service-role client. Server-only; used by the bootstrap script, never by request handlers. */
export function serviceClient() {
  const { url } = env(), key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new ConfigError('SUPABASE_SERVICE_ROLE_KEY is not set.');
  return createClient(url, key, { auth: { persistSession: false } });
}
