'use client';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

const ROLES = ['super_admin', 'provider_admin', 'reviewer', 'read_only_admin'];
type U = { id: string; email: string; full_name?: string; role: string | null };
export default function UsersPage() {
  const [users, setUsers] = useState<U[]>([]), [msg, setMsg] = useState(''), [page, setPage] = useState(1), [total, setTotal] = useState(0);
  const load = useCallback(async () => { const r = await fetch(`/api/admin/users?page=${page}`), j = await r.json(); if (!r.ok) setMsg(j.error?.message ?? 'Could not load.'); else { setUsers(j.data.items); setTotal(j.data.total); } }, [page]);
  useEffect(() => { load(); }, [load]);
  async function setRole(id: string, role: string) {
    if (!confirm(role ? `Set role to ${role}?` : 'Revoke admin access?')) return;
    const r = await fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: role || null }) });
    setMsg(r.ok ? 'Role updated.' : (await r.json()).error?.message ?? 'Failed.'); load();
  }
  return (
    <>
      <PageHeader title="Users & roles" subtitle="Only super admins can grant or revoke admin roles. Changes are audited." />
      {msg && <p role="status" className="mb-4 rounded-xl bg-softmint px-4 py-3 text-sm text-deep">{msg}</p>}
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-muted"><tr><th className="p-3">Email</th><th className="p-3">Name</th><th className="p-3">Admin role</th></tr></thead>
        <tbody className="divide-y divide-line">{users.map((u) => <tr key={u.id}><td className="p-3">{u.email}</td><td className="p-3">{u.full_name ?? '—'}</td>
          <td className="p-3"><select aria-label={`Role for ${u.email}`} value={u.role ?? ''} onChange={(e) => setRole(u.id, e.target.value)} className="min-h-[40px] rounded-xl border border-line px-2"><option value="">None (regular user)</option>{ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}</select></td></tr>)}</tbody></table></div>
      <div className="mt-4 flex items-center gap-3 text-sm"><button disabled={page < 2} onClick={() => setPage(page - 1)} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Previous</button><span className="text-muted">Page {page} · {total} users</span><button disabled={page * 20 >= total} onClick={() => setPage(page + 1)} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Next</button></div>
    </>
  );
}
