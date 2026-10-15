'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';

type D = { total: number; publishedHospitals: number; publishedClinics: number; draft: number; pendingVerification: number; verified: number; rejected: number; recent: { id: string; name: string; category: string; city: string; publication_status: string; verification_status: string }[]; recentActions: { id: number; action: string; created_at: string }[] };

export default function AdminDashboard() {
  const [d, setD] = useState<D | null>(null), [error, setError] = useState('');
  useEffect(() => { fetch('/api/admin/dashboard').then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error?.message); setD(j.data); }).catch((e) => setError(e.message || 'Could not load dashboard.')); }, []);
  const stats: [string, number | undefined][] = [['Total providers', d?.total], ['Published hospitals', d?.publishedHospitals], ['Published clinics', d?.publishedClinics], ['Drafts', d?.draft], ['Pending verification', d?.pendingVerification], ['Verified', d?.verified], ['Rejected', d?.rejected]];
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Live figures from the database." action={<Button href="/admin/providers/new"><Plus size={16} />Add hospital / clinic</Button>} />
      {error && <p role="alert" className="mb-4 rounded-xl bg-coralbg px-4 py-3 text-sm text-[#C2453A]">{error}</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([l, v]) => <div key={l} className="card p-5"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-3xl font-extrabold text-deep">{v ?? '–'}</p></div>)}</div>
      <section className="card mt-6 p-6">
        <div className="flex items-center justify-between"><h2 className="font-bold text-deep">Recently updated</h2><Link href="/admin/providers" className="text-sm font-semibold text-primary hover:underline">Manage all</Link></div>
        <ul className="mt-3 divide-y divide-line">{(d?.recent ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span><b className="text-deep">{p.name}</b><span className="ml-2 text-muted">{p.category} · {p.city}</span></span>
            <span className="flex items-center gap-3"><span className="text-xs text-muted">{p.publication_status} · {p.verification_status.replace('_', ' ')}</span><Link href={`/admin/providers/${p.id}/edit`} className="font-semibold text-primary hover:underline">Edit</Link></span></li>))}</ul>
        {d && d.recent.length === 0 && <p className="mt-3 text-sm text-muted">No records yet.</p>}
      </section>
      {!!d?.recentActions.length && <section className="card mt-6 p-6"><h2 className="font-bold text-deep">Recent admin actions</h2><ul className="mt-3 divide-y divide-line text-sm">{d.recentActions.map((a) => <li key={a.id} className="flex justify-between py-2"><span>{a.action}</span><span className="text-muted">{new Date(a.created_at).toLocaleString()}</span></li>)}</ul></section>}
    </>
  );
}
