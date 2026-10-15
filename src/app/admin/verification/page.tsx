'use client';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useAdmin } from '@/hooks/useAdmin';

type Item = { id: string; name: string; category: string; address: string; city: string; state: string; phone?: string; latitude: number; longitude: number; verification_status: string; submitted_at: string };
export default function Verification() {
  const { admin } = useAdmin(), canReview = admin?.role === 'super_admin' || admin?.role === 'reviewer';
  const [items, setItems] = useState<Item[]>([]), [notes, setNotes] = useState<Record<string, string>>({}), [msg, setMsg] = useState(''), [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const r = await fetch('/api/admin/verification'), j = await r.json(); if (!r.ok) setMsg(j.error?.message ?? 'Could not load.'); else setItems(j.data); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  async function decide(id: string, status: string) {
    if (status !== 'under_review' && !confirm(`Mark this provider as ${status.replace('_', ' ')}?`)) return;
    const r = await fetch(`/api/admin/verification/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, notes: notes[id] }) });
    setMsg(r.ok ? 'Decision saved. (Publishing is a separate step.)' : (await r.json()).error?.message ?? 'Failed.'); load();
  }
  return (
    <>
      <PageHeader title="Verification queue" subtitle="Approving verifies a record; it does not publish it." />
      {msg && <p role="status" className="mb-4 rounded-xl bg-softmint px-4 py-3 text-sm text-deep">{msg}</p>}
      {loading ? <p className="text-sm text-muted">Loading…</p> : items.length === 0 ? <p className="card p-6 text-sm text-muted">Nothing waiting for review.</p> :
        <ul className="space-y-4">{items.map((p) => (
          <li key={p.id} className="card p-5">
            <p className="font-bold text-deep">{p.name} <span className="text-xs font-normal text-muted">{p.category} · {p.verification_status.replace('_', ' ')}</span></p>
            <p className="mt-1 text-sm text-muted">{[p.address, p.city, p.state].join(', ')} · {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}{p.phone ? ` · ${p.phone}` : ''}</p>
            {canReview && <div className="mt-3 flex flex-wrap items-center gap-2">
              <input value={notes[p.id] ?? ''} onChange={(e) => setNotes({ ...notes, [p.id]: e.target.value })} placeholder="Review notes (required to reject)" maxLength={2000} className="min-h-[44px] min-w-[220px] flex-1 rounded-xl border border-line px-3 text-sm" aria-label="Review notes" />
              {p.verification_status === 'pending' && <Button variant="secondary" onClick={() => decide(p.id, 'under_review')}>Start review</Button>}
              <Button onClick={() => decide(p.id, 'verified')}>Approve</Button><Button variant="emergency" onClick={() => decide(p.id, 'rejected')}>Reject</Button>
            </div>}
          </li>))}</ul>}
    </>
  );
}
