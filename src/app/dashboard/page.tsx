'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Bot, Building2, Clock, Hospital, Pill, Siren, Stethoscope } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import HospitalCard from '@/components/healthcare/HospitalCard';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSaved } from '@/hooks/useSaved';
import { useHospitals } from '@/hooks/useProviders';

const actions = [
  { href: '/find-care?category=Hospital', icon: Hospital, label: 'Find Hospitals' }, { href: '/find-care?category=Clinic', icon: Building2, label: 'Nearby Clinics' },
  { href: '/find-care?category=Doctor', icon: Stethoscope, label: 'Doctors' }, { href: '/find-care?category=Pharmacy', icon: Pill, label: 'Pharmacies' },
  { href: '/emergency', icon: Siren, label: 'Emergency Help', em: true }, { href: '/saved', icon: Bookmark, label: 'Saved Hospitals' },
];

export default function DashboardPage() {
  const { hospitals } = useHospitals();
  const router = useRouter();
  const { user } = useAuth();
  const { ids, toggle } = useSaved();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem('mg_recent') || '[]')); } catch { /* ignore */ } }, []);
  const search = () => {
    const v = q.trim(); if (!v) return;
    localStorage.setItem('mg_recent', JSON.stringify([v, ...recent.filter((r) => r !== v)].slice(0, 5)));
    router.push(`/find-care?q=${encodeURIComponent(v)}`);
  };
  const name = String(user?.meta.full_name ?? '').split(' ')[0];
  return (
    <AppShell protect>
      <PageHeader title={`Hello${name ? `, ${name}` : ''}`} subtitle="How can MediGuide help you today?" />
      <SearchBar value={q} onChange={setQ} onSubmit={search} className="max-w-2xl" />
      {recent.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><Clock size={14} className="text-muted" aria-hidden /><span className="text-muted">Recent:</span>{recent.map((r) => <Link key={r} href={`/find-care?q=${encodeURIComponent(r)}`} className="badge hover:bg-mint">{r}</Link>)}</div>}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {actions.map(({ href, icon: I, label, em }) => (
          <Link key={label} href={href} className={`card flex items-center gap-3 p-5 font-semibold transition hover:border-mint ${em ? 'border-coral bg-coralbg text-[#C2453A]' : 'text-deep'}`}><I size={22} className={em ? '' : 'text-primary'} aria-hidden />{label}</Link>
        ))}
      </div>
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-softmint to-white p-6">
        <div><h2 className="flex items-center gap-2 font-bold text-deep"><Bot size={18} className="text-primary" />Not sure what kind of care you need?</h2><p className="mt-1 text-sm text-muted">Describe how you feel and MediGuide AI will point you to suitable options.</p></div>
        <Button href="/ai-assistant">Ask MediGuide AI</Button>
      </div>
      <h2 className="mb-1 mt-10 text-xl font-bold text-deep">Nearby providers</h2><p className="mb-4 text-xs text-muted">Sample data for demonstration.</p>
      <div className="grid gap-4 md:grid-cols-2">{hospitals.slice(0, 2).map((h) => <HospitalCard key={h.id} hospital={h} saved={ids.includes(h.id)} onToggleSave={toggle} />)}</div>
    </AppShell>
  );
}
