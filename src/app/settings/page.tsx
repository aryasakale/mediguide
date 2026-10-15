'use client';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { useAuth } from '@/hooks/useAuth';

const prefs = [['notify_email', 'Email updates', 'Tips and product news.'], ['notify_alerts', 'Safety alerts', 'Important notices about your saved providers.']] as const;
export default function SettingsPage() {
  const { user, loading, updateMeta, signOut } = useAuth();
  return (
    <AppShell protect>
      <PageHeader title="Settings" subtitle="Notifications and account." />
      {loading || !user ? <LoadingState /> : (
        <div className="max-w-2xl space-y-6">
          <section className="card divide-y divide-line p-2">
            {prefs.map(([k, t, d]) => { const on = user.meta[k] !== false; return (
              <div key={k} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold text-deep">{t}</p><p className="text-sm text-muted">{d}</p></div>
                <button role="switch" aria-checked={on} aria-label={t} onClick={() => updateMeta({ [k]: !on })} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-primary' : 'bg-line'}`}><span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button></div>); })}
          </section>
          <section className="card p-6"><h2 className="font-bold text-deep">Account</h2><p className="mt-1 text-sm text-muted">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-3"><Button href="/forgot-password" variant="secondary">Change password</Button><Link href="/profile" className="inline-flex min-h-[44px] items-center px-2 text-sm font-semibold text-primary">Edit profile</Link>{!user.demo && <Button variant="emergency" onClick={signOut}>Logout</Button>}</div></section>
        </div>
      )}
    </AppShell>
  );
}
