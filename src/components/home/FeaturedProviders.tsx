'use client';
import HospitalCard from '../healthcare/HospitalCard';
import { useHospitals } from '@/hooks/useProviders';
export default function FeaturedProviders() {
  const { hospitals, loading } = useHospitals();
  if (!loading && hospitals.length === 0) return <p className="mt-8 text-sm text-muted">No providers published yet.</p>;
  return <div className="mt-8 grid gap-4 md:grid-cols-3">{hospitals.slice(0, 3).map((h) => <HospitalCard key={h.id} hospital={h} />)}</div>;
}
