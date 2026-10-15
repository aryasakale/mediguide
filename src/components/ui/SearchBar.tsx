'use client';
import { Search } from 'lucide-react';
export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search hospitals, clinics, doctors or specialties', className = '' }:
  { value: string; onChange: (v: string) => void; onSubmit?: () => void; placeholder?: string; className?: string }) {
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className={`relative ${className}`}>
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input aria-label="Search healthcare" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field rounded-full pl-11" />
    </form>
  );
}
