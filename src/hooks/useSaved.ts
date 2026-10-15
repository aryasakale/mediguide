'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

/** Saved hospitals: Supabase table `saved_providers` (RLS) when signed in, localStorage in demo mode. */
export function useSaved() {
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const useDb = configured && !!user && !user.demo;

  useEffect(() => {
    if (loading) return;
    const sb = getSupabase();
    if (useDb && sb) {
      sb.from('saved_providers').select('provider_id').then(({ data }) => setIds((data ?? []).map((r: { provider_id: string }) => r.provider_id)));
    } else if (!configured) {
      try { setIds(JSON.parse(localStorage.getItem('mg_saved') || '[]')); } catch { setIds([]); }
    } else setIds([]);
  }, [loading, useDb, configured]);

  const toggle = useCallback(async (id: string) => {
    if (configured && !user) { router.push('/login?next=/saved'); return; }
    const has = ids.includes(id), next = has ? ids.filter((i) => i !== id) : [...ids, id];
    const sb = getSupabase();
    if (useDb && sb && user) {
      const { error } = has
        ? await sb.from('saved_providers').delete().eq('provider_id', id).eq('user_id', user.id)
        : await sb.from('saved_providers').insert({ user_id: user.id, provider_id: id });
      if (error) return;
    } else localStorage.setItem('mg_saved', JSON.stringify(next));
    setIds(next);
  }, [ids, user, configured, useDb, router]);

  return { ids, toggle, loading };
}
