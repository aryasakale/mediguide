'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, Eye, EyeOff, MapPin, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useProviders } from '@/hooks/useProviders';
import { deleteProvider, setStatus, submitForVerification } from '@/lib/providers';
import type { Status } from '@/types/healthcare';

const tone: Record<Status, string> = { published: 'bg-softmint text-primary', draft: 'bg-[#FFF6DD] text-[#8A6A00]', archived: 'bg-line text-muted' };

export default function ProvidersPage() {
  const { providers, loading, error, reload } = useProviders(true);
  const [q, setQ] = useState(''), [st, setSt] = useState<'' | Status>(''), [msg, setMsg] = useState('');
  const rows = useMemo(() => providers.filter((p) => (!st || p.status === st) &&
    (!q.trim() || [p.name, p.city, p.category, p.state].some((s) => s.toLowerCase().includes(q.trim().toLowerCase())))), [providers, q, st]);

  async function change(id: string, s: Status) { const r = await setStatus(id, s); setMsg(r.error ?? ''); reload(); }
  async function remove(id: string, name: string) { if (!confirm(`Permanently delete "${name}"? This cannot be undone. (Use Archive to keep a record.)`)) return; setMsg((await deleteProvider(id)) ?? ''); reload(); }
  const ib = 'flex h-9 w-9 items-center justify-center rounded-full border border-line text-primary hover:bg-softmint';

  return (
    <>
      <PageHeader title="Hospitals & Clinics" subtitle="Everything here is live: published records show on the user site right away." action={<Button href="/admin/providers/new"><Plus size={16} />Add provider</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <input aria-label="Search" placeholder="Search by name, city or category" value={q} onChange={(e) => setQ(e.target.value)} className="field max-w-sm rounded-full" />
        <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value as '' | Status)} className="field w-auto rounded-full">
          <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
      </div>
      {(error || msg) && <p role="alert" className="mb-4 rounded-xl bg-coralbg px-4 py-3 text-sm text-[#C2453A]">{error || msg}</p>}
      {loading ? <p className="text-sm text-muted">Loading…</p> : rows.length === 0 ? <p className="card p-6 text-sm text-muted">No providers match.</p> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted"><tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">City</th><th className="p-3">Coordinates</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">{rows.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-semibold text-deep">{p.name}<span className="ml-2 text-xs font-normal text-muted">{p.verificationStatus ? (p.submittedAt || p.verified ? p.verificationStatus.replace('_', ' ') : 'not submitted') : ''}</span></td>
                <td className="p-3">{p.category}</td><td className="p-3">{p.city}</td>
                <td className="p-3"><a className="inline-flex items-center gap-1 text-primary hover:underline" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=16/${p.lat}/${p.lng}`}><MapPin size={13} />{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</a></td>
                <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[p.status]}`}>{p.status}</span></td>
                <td className="p-3"><div className="flex justify-end gap-1.5">
                  {!p.verified && !p.submittedAt && <button onClick={async () => { setMsg((await submitForVerification(p.id)) ?? 'Submitted for verification.'); reload(); }} aria-label={`Submit ${p.name} for verification`} title="Submit for verification" className={ib}><Send size={15} /></button>}
                  <Link href={`/admin/providers/${p.id}/edit`} aria-label={`Edit ${p.name}`} title="Edit" className={ib}><Pencil size={15} /></Link>
                  {p.status === 'published'
                    ? <button onClick={() => change(p.id, 'draft')} aria-label={`Unpublish ${p.name}`} title="Unpublish" className={ib}><EyeOff size={15} /></button>
                    : <button onClick={() => change(p.id, 'published')} aria-label={`Publish ${p.name}`} title="Publish" className={ib}><Eye size={15} /></button>}
                  {p.status === 'archived'
                    ? <button onClick={() => change(p.id, 'draft')} aria-label={`Restore ${p.name}`} title="Restore as draft" className={ib}><ArchiveRestore size={15} /></button>
                    : <button onClick={() => change(p.id, 'archived')} aria-label={`Archive ${p.name}`} title="Archive" className={ib}><Archive size={15} /></button>}
                  <button onClick={() => remove(p.id, p.name)} aria-label={`Archive ${p.name}`} title="Archive" className={`${ib} text-[#C2453A]`}><Trash2 size={15} /></button>
                </div></td>
              </tr>))}</tbody>
          </table>
        </div>)}
    </>
  );
}
