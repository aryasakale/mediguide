'use client';
import { useEffect, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import HealthcareMap from '@/components/maps/HealthcareMap';
import HospitalCard from '@/components/healthcare/HospitalCard';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';
import { useHospitals } from '@/hooks/useProviders';
import { requestUserLoc } from '@/lib/providers';
import { useSaved } from '@/hooks/useSaved';
import { applyFilters, defaultFilters } from '@/lib/utils';

export default function MapPage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string>();
  const [loc, setLoc] = useState('');
  const { ids, toggle } = useSaved();
  const { hospitals } = useHospitals();
  useEffect(() => { setSelected(new URLSearchParams(window.location.search).get('id') ?? undefined); }, []);
  const list = applyFilters(hospitals, { ...defaultFilters, q });
  const sel = hospitals.find((h) => h.id === selected);
  const locate = async () => setLoc((await requestUserLoc()) ?? 'Location saved. Distances are now shown on provider cards.');
  return (
    <AppShell>
      <PageHeader title="Map & Directions" subtitle="Live map of published providers. Directions open in Google Maps." action={<Button variant="secondary" onClick={locate}><LocateFixed size={16} />Use my location</Button>} />
      <SearchBar value={q} onChange={setQ} className="mb-4 max-w-xl" />
      {loc && <p role="status" className="mb-4 rounded-xl bg-softmint px-4 py-2 text-sm text-primary">{loc}</p>}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <HealthcareMap hospitals={list} selectedId={selected} onSelect={setSelected} />
        <div>{sel ? <HospitalCard hospital={sel} saved={ids.includes(sel.id)} onToggleSave={toggle} /> : <p className="card p-6 text-sm text-muted">Select a marker to see provider details and directions.</p>}</div>
      </div>
    </AppShell>
  );
}
