'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserLoc, listProviders, onUserLoc, subscribe, toHospital } from '@/lib/providers';
import type { Hospital, Provider } from '@/types/healthcare';

/** Admin view: all records, live. */
export function useProviders(admin = false) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(() => listProviders(admin).then((d) => { setProviders(d); setError(''); }).catch((e) => setError(e.message)).finally(() => setLoading(false)), [admin]);
  useEffect(() => { reload(); return subscribe(reload); }, [reload]);
  return { providers, loading, error, reload };
}

/** User view: published records only, live, with distance when the user shared their location. */
export function useHospitals() {
  const { providers, loading, error, reload } = useProviders(false);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => { const u = () => setLoc(getUserLoc()); u(); return onUserLoc(u); }, []);
  const hospitals: Hospital[] = useMemo(() => providers.map((p) => toHospital(p, loc)), [providers, loc]);
  return { hospitals, loading, error, reload, hasLoc: !!loc };
}
