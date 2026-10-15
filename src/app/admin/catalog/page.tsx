'use client';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
type Item = { id: string; name: string; active: boolean };
function Catalog({ kind, title }: { kind: 'specialty' | 'service'; title: string }) {
  const [items, setItems] = useState<Item[]>([]), [name, setName] = useState(''), [err, setErr] = useState('');
  const load = useCallback(async () => { const r = await fetch(`/api/admin/catalog/${kind}`), j = await r.json(); if (!r.ok) setErr(j.error?.message ?? 'Failed to load'); else setItems(j.data); }, [kind]);
  useEffect(() => { load(); }, [load]);
  async function add(e: React.FormEvent) { e.preventDefault(); setErr(''); const r = await fetch(`/api/admin/catalog/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }); const j = await r.json().catch(() => null); if (!r.ok) setErr(j?.error?.message ?? 'Could not add'); else { setName(''); load(); } }
  async function toggle(i: Item) { const r = await fetch(`/api/admin/catalog/${kind}?id=${i.id}&active=${!i.active}`, { method: 'PATCH' }); if (!r.ok) setErr((await r.json().catch(() => null))?.error?.message ?? 'Could not update'); load(); }
  return (
    <section className="card p-5">
      <h2 className="font-semibold text-deep">{title}</h2>
      {err && <p role="alert" className="mt-2 rounded-xl bg-coralbg px-3 py-2 text-sm text-[#C2453A]">{err}</p>}
      <form onSubmit={add} className="mt-3 flex gap-2"><input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={`New ${kind}`} aria-label={`New ${kind}`} className="flex-1 rounded-xl border border-line px-3 py-2 text-sm" /><button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">Add</button></form>
      <ul className="mt-3 divide-y divide-line text-sm">{items.map((i) => <li key={i.id} className="flex items-center justify-between py-2"><span className={i.active ? '' : 'text-muted line-through'}>{i.name}</span><button onClick={() => toggle(i)} className="text-xs font-semibold text-primary underline">{i.active ? 'Deactivate' : 'Reactivate'}</button></li>)}{!items.length && <li className="py-2 text-muted">None yet.</li>}</ul>
    </section>
  );
}
export default function CatalogPage() {
  return (<><PageHeader title="Specialties & services" subtitle="Controlled lists used by the provider form. Items are deactivated, never deleted." /><div className="grid gap-5 md:grid-cols-2"><Catalog kind="specialty" title="Specialties" /><Catalog kind="service" title="Services" /></div></>);
}
