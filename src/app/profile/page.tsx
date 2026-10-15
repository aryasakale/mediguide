'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, LogOut } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import FilterDropdown from '@/components/ui/FilterDropdown';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, loading, updateMeta, signOut } = useAuth();
  const [name, setName] = useState('');
  const [lang, setLang] = useState('English');
  const [msg, setMsg] = useState('');
  useEffect(() => { if (user) { setName(String(user.meta.full_name ?? '')); setLang(String(user.meta.language ?? 'English')); } }, [user]);
  const save = async (e: React.FormEvent) => { e.preventDefault(); const err = await updateMeta({ full_name: name.trim(), language: lang }); setMsg(err ?? 'Profile saved.'); };
  return (
    <AppShell protect>
      <PageHeader title="Profile" subtitle={user?.demo ? 'Demo profile - stored only in this browser.' : user?.email} />
      {loading ? <LoadingState /> : (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <form onSubmit={save} className="card space-y-4 p-6">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <Input label="Email" value={user?.email ?? ''} readOnly disabled hint="Email changes are managed in Settings." />
            <FilterDropdown label="Preferred language" value={lang} onChange={setLang} options={['English', 'Hindi', 'Marathi', 'Spanish', 'French']} />
            <div className="flex items-center gap-3"><Button type="submit">Save changes</Button>{msg && <span role="status" className="text-sm text-muted">{msg}</span>}</div>
          </form>
          <div className="space-y-4">
            <Link href="/saved" className="card flex items-center gap-3 p-5 font-semibold text-deep hover:border-mint"><Bookmark className="text-primary" size={20} />Saved Hospitals</Link>
            <Link href="/settings" className="card block p-5 font-semibold text-deep hover:border-mint">Notification &amp; account settings</Link>
            <Button variant="secondary" onClick={signOut} className="w-full"><LogOut size={16} />Logout</Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
