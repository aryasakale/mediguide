'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
type L = { id: number; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Record<string, unknown>; created_at: string };
export default function Logs() {
  const [rows, setRows] = useState<L[]>([]), [err, setErr] = useState(''), [page, setPage] = useState(1);
  useEffect(() => { fetch(`/api/admin/activity-logs?page=${page}`).then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error?.message); setRows(j.data.items); }).catch((e) => setErr(e.message)); }, [page]);
  return (
    <>
      <PageHeader title="Activity logs" subtitle="Written by database triggers; cannot be edited from the app." />
      {err && <p role="alert" className="mb-4 rounded-xl bg-coralbg px-4 py-3 text-sm text-[#C2453A]">{err}</p>}
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-muted"><tr><th className="p-3">When</th><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Details</th></tr></thead>
        <tbody className="divide-y divide-line">{rows.map((l) => <tr key={l.id}><td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td><td className="p-3 font-semibold">{l.action}</td><td className="p-3">{l.entity_type}</td><td className="p-3 text-muted">{JSON.stringify(l.metadata)}</td></tr>)}</tbody></table></div>
      <div className="mt-4 flex gap-3 text-sm"><button disabled={page < 2} onClick={() => setPage(page - 1)} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Previous</button><button disabled={rows.length < 30} onClick={() => setPage(page + 1)} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Next</button></div>
    </>
  );
}
