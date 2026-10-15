'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase, supabaseConfigured, demoAllowed } from '@/lib/supabase/client';
import type { AppUser } from '@/types/auth';
import { DEMO_EMAIL, DEMO_FLAG } from '@/lib/auth';

const DEMO_KEY = 'mg_demo_meta';
type SbUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };
const toUser = (u: SbUser | null | undefined): AppUser | null => (u ? { id: u.id, email: u.email ?? '', meta: u.user_metadata ?? {} } : null);

/** Real Supabase session when configured; otherwise a clearly flagged demo user (user.demo === true). */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      let meta = {}; try { meta = JSON.parse(localStorage.getItem(DEMO_KEY) || '{}'); } catch { /* ignore */ }
      if (demoAllowed && localStorage.getItem(DEMO_FLAG)) setUser({ id: 'demo', email: DEMO_EMAIL, meta: { full_name: 'Demo User', ...meta }, demo: true });
      setLoading(false); return;
    }
    sb.auth.getUser().then(({ data }) => { setUser(toUser(data.user)); setLoading(false); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUser(toUser(s?.user)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const updateMeta = useCallback(async (patch: Record<string, unknown>) => {
    const sb = getSupabase();
    if (!sb) {
      const meta = { ...(user?.meta ?? {}), ...patch }; localStorage.setItem(DEMO_KEY, JSON.stringify(meta));
      setUser((u) => (u ? { ...u, meta } : u)); return null;
    }
    const { data, error } = await sb.auth.updateUser({ data: patch });
    if (!error) setUser(toUser(data.user));
    return error?.message ?? null;
  }, [user]);

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_FLAG);
    await getSupabase()?.auth.signOut();
    router.push('/login'); router.refresh();
  }, [router]);

  return { user, loading, updateMeta, signOut, configured: supabaseConfigured };
}
