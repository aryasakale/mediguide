'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import BrandLogo from '../branding/BrandLogo';
import Button from '../ui/Button';
import EmergencyButton from '../ui/EmergencyButton';

const links = [{ href: '/find-care', label: 'Find Care' }, { href: '/#how-it-works', label: 'How It Works' }, { href: '/ai-assistant', label: 'AI Assistant' }];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <BrandLogo />
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => <Link key={l.href} href={l.href} className="text-sm font-semibold text-ink hover:text-primary">{l.label}</Link>)}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <EmergencyButton className="px-4" />
          <Link href="/login" className="px-2 text-sm font-semibold text-deep hover:text-primary">Login</Link>
          <Button href="/register">Get Started</Button>
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-line lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="space-y-1 border-t border-line bg-white px-5 pb-5 pt-3 lg:hidden">
          {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-softmint">{l.label}</Link>)}
          <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-softmint">Login</Link>
          <div className="flex flex-col gap-2 pt-2"><Button href="/register">Get Started</Button><EmergencyButton /></div>
        </div>
      )}
    </header>
  );
}
