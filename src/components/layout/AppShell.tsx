'use client';
import BrandLogo from '../branding/BrandLogo';
import EmergencyButton from '../ui/EmergencyButton';
import DashboardSidebar from './DashboardSidebar';
import MobileNavigation from './MobileNavigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/** Authenticated application shell (sidebar on desktop, bottom nav on mobile). */
export default function AppShell({ children, protect }: { children: React.ReactNode; protect?: boolean }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  useEffect(() => { if (protect && !loading && !user) router.replace('/login'); }, [protect, loading, user, router]);
  if (protect && !user) return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Checking your session…</div>;
  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar user={user} onLogout={signOut} />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-2.5 lg:hidden">
          <BrandLogo size={34} tagline={false} /><EmergencyButton label="Emergency" className="min-h-[40px] px-4" />
        </header>
        {user?.demo && <p className="bg-softmint px-5 py-2 text-center text-xs font-semibold text-primary">Signed in with the demo account (UI preview, Supabase not configured). Sample data is shown throughout.</p>}
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      </div>
      <MobileNavigation />
    </div>
  );
}
