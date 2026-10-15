'use client';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import HospitalDetails from '@/components/healthcare/HospitalDetails';
import Button from '@/components/ui/Button';
import { useHospitals } from '@/hooks/useProviders';

export default function HospitalPage() {
  const { id } = useParams<{ id: string }>();
  const { hospitals, loading } = useHospitals();
  const h = hospitals.find((x) => x.id === id);
  return (
    <AppShell>
      {loading ? <p className="text-sm text-muted">Loading…</p>
        : h ? <HospitalDetails hospital={h} />
        : <div className="card p-8 text-center"><h1 className="text-xl font-bold text-deep">This provider is no longer listed</h1><p className="mt-2 text-sm text-muted">It may have been updated or removed.</p><Button href="/find-care" className="mt-5">Find healthcare</Button></div>}
    </AppShell>
  );
}
