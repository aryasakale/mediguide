'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Bookmark, Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
const items = [{ href: '/dashboard', label: 'Home', icon: Home }, { href: '/find-care', label: 'Find', icon: Search }, { href: '/ai-assistant', label: 'AI', icon: Bot }, { href: '/saved', label: 'Saved', icon: Bookmark }, { href: '/profile', label: 'Profile', icon: User }];
export default function MobileNavigation() {
  const path = usePathname();
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold', active ? 'text-primary' : 'text-muted')}><Icon size={20} aria-hidden />{label}</Link>;
      })}
    </nav>
  );
}
