import { createBrowserClient } from '@supabase/ssr';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
/** Local-only demo mode (localStorage data, demo login). Never active in production builds. */
export const demoAllowed = process.env.NODE_ENV !== 'production';
export const supabaseConfigured = Boolean(url && key);
let client: ReturnType<typeof createBrowserClient> | null = null;
export function getSupabase() {
  if (!url || !key) return null;
  return (client ??= createBrowserClient(url, key));
}
