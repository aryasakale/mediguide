'use client';
import { useEffect, useMemo, useState } from 'react';
import { List, LocateFixed, Map as MapIcon, SearchX } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import HospitalFilters from '@/components/healthcare/HospitalFilters';
import HospitalCard from '@/components/healthcare/HospitalCard';
import HealthcareMap from '@/components/maps/HealthcareMap';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useHospitals } from '@/hooks/useProviders';
import { requestUserLoc } from '@/lib/providers';
import { useSaved } from '@/hooks/useSaved';
import { applyFilters, defaultFilters } from '@/lib/utils';

export default function FindCarePage() {
  const { hospitals: all, loading, error, reload, hasLoc } = useHospitals();
  const status = loading ? 'loading' : error ? 'error' : 'ready';
  const [filters, setFilters] = useState(defaultFilters);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState<string>();
  const { ids, toggle } = useSaved();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setFilters((f) => ({ ...f, q: p.get('q') ?? '', category: p.get('category') ?? '', specialty: p.get('specialty') ?? '' }));
  }, []);

  const results = useMemo(() => applyFilters(all, filters), [all, filters]);
  const tab = (v: 'list' | 'map', I: typeof List, t: string) => (
    <button onClick={() => setView(v)} aria-pressed={view === v} className={`flex min-h-[40px] items-center gap-2 rounded-full px-4 text-sm font-semibold ${view === v ? 'bg-primary text-white' : 'text-ink hover:bg-softmint'}`}><I size={16} />{t}</button>
  );
  return (
    <AppShell>
      <PageHeader title="Find Healthcare" subtitle="Search and filter providers. Results update live when new places are added." action={<div className="flex gap-1 rounded-full border border-line bg-white p-1">{tab('list', List, 'List')}{tab('map', MapIcon, 'Map')}</div>} />
      <HospitalFilters filters={filters} onChange={setFilters} hospitals={all} />
      {!hasLoc && <button onClick={() => requestUserLoc()} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><LocateFixed size={15} />Use my location to see distances</button>}
      <p className="mb-3 mt-5 text-sm text-muted" aria-live="polite">{status === 'ready' ? `${results.length} result${results.length === 1 ? '' : 's'}` : ' '}</p>
      {status === 'loading' && <LoadingState label="Finding providers…" />}
      {status === 'error' && <ErrorState message="We couldn't load providers. Check your connection and try again." onRetry={reload} />}
      {status === 'ready' && results.length === 0 && <EmptyState icon={<SearchX />} title="No providers match" text="Try a wider distance or remove a filter." action={<Button variant="secondary" onClick={() => setFilters(defaultFilters)}>Reset filters</Button>} />}
      {status === 'ready' && results.length > 0 && (view === 'list'
        ? <div className="grid gap-4 md:grid-cols-2">{results.map((h) => <HospitalCard key={h.id} hospital={h} saved={ids.includes(h.id)} onToggleSave={toggle} />)}</div>
        : <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"><HealthcareMap hospitals={results} selectedId={selected} onSelect={setSelected} />
            <div className="space-y-3">{(selected ? results.filter((h) => h.id === selected) : results.slice(0, 2)).map((h) => <HospitalCard key={h.id} hospital={h} saved={ids.includes(h.id)} onToggleSave={toggle} />)}</div></div>)}
    </AppShell>
  );
}
