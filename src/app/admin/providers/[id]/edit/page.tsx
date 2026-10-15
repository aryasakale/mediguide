'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import ProviderForm from '@/components/admin/ProviderForm';
import { getProvider } from '@/lib/providers';
import type { Provider } from '@/types/healthcare';

export default function EditProvider() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Provider | null | undefined>();
  useEffect(() => { getProvider(id).then(setP).catch(() => setP(null)); }, [id]);
  if (p === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (!p) return <p className="text-sm text-muted">Record not found.</p>;
  return <><PageHeader title={`Edit ${p.name}`} subtitle="Changes appear on the user site immediately if the record is published." /><ProviderForm initial={p} /></>;
}
