'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, PlusCircle, LogOut, ExternalLink, ShieldCheck, ClipboardCheck, Users, ScrollText } from 'lucide-react';
import BrandLogo from '../branding/BrandLogo';
import { useAdmin } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', I: LayoutDashboard, roles: null },
  { href: '/admin/providers', label: 'Hospitals & Clinics', I: Building2, roles: null },
  { href: '/admin/providers/new', label: 'Add provider', I: PlusCircle, roles: ['super_admin', 'provider_admin'] },
  { href: '/admin/verification', label: 'Verification', I: ClipboardCheck, roles: null },
  { href: '/admin/catalog', label: 'Specialties & services', I: ClipboardCheck, roles: ['super_admin', 'provider_admin'] },
  { href: '/admin/users', label: 'Users & roles', I: Users, roles: ['super_admin'] },
  { href: '/admin/activity-logs', label: 'Activity logs', I: ScrollText, roles: ['super_admin'] },
];

/** Protected admin frame. The login page renders bare. Real enforcement: middleware + Supabase RLS; this is the UX guard. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(), router = useRouter();
  const { admin, loading, signOut } = useAdmin();
  const isLogin = path === '/admin/login';
  useEffect(() => { if (!isLogin && !loading && !admin) router.replace('/admin/login'); }, [isLogin, loading, admin, router]);
  if (isLogin) return <>{children}</>;
  if (!admin) return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Checking admin access…</div>;
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-3 lg:block lg:py-6">
          <BrandLogo href="/admin/dashboard" size={36} tagline={false} />
          <span className="badge lg:mt-3"><ShieldCheck size={12} />Admin panel</span>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4">
          {nav.filter((n) => !n.roles || n.roles.includes(admin.role)).map(({ href, label, I }) => {
            const on = path === href || (href === '/admin/providers' && path.startsWith('/admin/providers') && path !== '/admin/providers/new');
            return <Link key={href} href={href} className={cn('flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold', on ? 'bg-primary text-white' : 'text-ink hover:bg-softmint')}><I size={18} aria-hidden />{label}</Link>;
          })}
          <Link href="/find-care" target="_blank" className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-softmint"><ExternalLink size={18} aria-hidden />View user site</Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-line bg-white px-5 py-2.5">
          <span className="truncate text-sm text-muted">{admin.email} · {admin.role.replace('_', ' ')}</span>
          <button onClick={signOut} className="flex min-h-[40px] items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-deep hover:bg-softmint"><LogOut size={16} />Logout</button>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
