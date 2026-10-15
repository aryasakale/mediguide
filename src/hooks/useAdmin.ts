'use client';
import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { getAdminRole, type AdminRole } from '@/lib/adminAuth';

export function useAdmin() {
  const [admin, setAdmin] = useState<{ email: string; role: AdminRole } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAdminRole().then((a) => { setAdmin(a); setLoading(false); }); }, []);
  const signOut = useCallback(async () => { await getSupabase()?.auth.signOut(); window.location.assign('/admin/login'); }, []);
  return { admin, loading, signOut };
}
