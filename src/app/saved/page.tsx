'use client';
import { Bookmark } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import HospitalCard from '@/components/healthcare/HospitalCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useHospitals } from '@/hooks/useProviders';
import { useSaved } from '@/hooks/useSaved';

export default function SavedPage() {
  const { ids, toggle } = useSaved();
  const { hospitals } = useHospitals();
  const list = hospitals.filter((h) => ids.includes(h.id));
  return (
    <AppShell protect>
      <PageHeader title="Saved Hospitals" subtitle="Providers you saved for quick access." />
      {list.length === 0
        ? <EmptyState icon={<Bookmark />} title="Nothing saved yet" text="Tap the bookmark on any provider to keep it here." action={<Button href="/find-care">Find healthcare</Button>} />
        : <div className="grid gap-4 md:grid-cols-2">{list.map((h) => <HospitalCard key={h.id} hospital={h} saved onToggleSave={toggle} />)}</div>}
    </AppShell>
  );
}
