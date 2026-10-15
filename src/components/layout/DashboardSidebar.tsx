'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Bookmark, Home, LogIn, LogOut, Map, Search, Settings, Siren, User } from 'lucide-react';
import BrandLogo from '../branding/BrandLogo';
import type { AppUser } from '@/types/auth';
import { cn } from '@/lib/utils';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home }, { href: '/find-care', label: 'Find Healthcare', icon: Search },
  { href: '/map', label: 'Map', icon: Map }, { href: '/saved', label: 'Saved Hospitals', icon: Bookmark },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot }, { href: '/emergency', label: 'Emergency Help', icon: Siren },
  { href: '/profile', label: 'Profile', icon: User }, { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar({ user, onLogout }: { user: AppUser | null; onLogout: () => void }) {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white p-5 lg:flex">
      <BrandLogo size={38} tagline={false} />
      <nav aria-label="Application" className="mt-8 flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href));
          const em = href === '/emergency';
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', active ? (em ? 'bg-coralbg text-[#C2453A]' : 'bg-softmint text-primary') : em ? 'text-[#C2453A] hover:bg-coralbg' : 'text-ink hover:bg-pale')}>
              <Icon size={18} aria-hidden />{label}
            </Link>
          );
        })}
      </nav>
      {user ? (
        <button onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-pale"><LogOut size={18} />Logout</button>
      ) : (
        <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-pale"><LogIn size={18} />Login</Link>
      )}
    </aside>
  );
}
