'use client';
import { Bookmark, BookmarkCheck, Clock, Globe, MapPin, Navigation, Phone, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';
import RatingDisplay from '../ui/RatingDisplay';
import HospitalServices from './HospitalServices';
import { useSaved } from '@/hooks/useSaved';
import { directionsUrl } from '@/lib/utils';
import type { Hospital } from '@/types/healthcare';

export default function HospitalDetails({ hospital: h }: { hospital: Hospital }) {
  const { ids, toggle } = useSaved();
  const saved = ids.includes(h.id);
  return (
    <div className="space-y-6">
      <div className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-softmint text-primary" role="img" aria-label="No verified photo available">
        <div className="text-center"><Stethoscope size={44} className="mx-auto" aria-hidden /><p className="mt-2 text-xs">No verified photo available</p></div>
      </div>
      <div className="card p-6">
        <div className="flex flex-wrap gap-2"><span className="badge">{h.category}</span>{!h.verified && <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Demo data - not a real, verified provider</span>}</div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3"><h1 className="text-2xl font-extrabold text-deep sm:text-3xl">{h.name}</h1><RatingDisplay rating={h.rating} /></div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} />{h.address}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {h.phone ? <Button href={`tel:${h.phone}`}><Phone size={16} />Call Hospital</Button> : <Button disabled title="No verified phone number"><Phone size={16} />Call Hospital</Button>}
          <Button href={directionsUrl(h)} external variant="secondary"><Navigation size={16} />Get Directions</Button>
          <Button variant="secondary" onClick={() => toggle(h.id)} aria-pressed={saved}>{saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{saved ? 'Saved' : 'Save Hospital'}</Button>
          <Button href={`/map?id=${h.id}`} variant="ghost"><MapPin size={16} />View on Map</Button>
        </div>
        {!h.phone && <p className="mt-3 text-xs text-muted">Contact details are not verified for this record, so calling is disabled.</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-6"><h2 className="font-bold text-deep">Medical specialties</h2><div className="mt-3 flex flex-wrap gap-2">{h.specialties.map((s) => <span key={s} className="badge">{s}</span>)}</div>
          <h2 className="mt-6 flex items-center gap-2 font-bold text-deep"><Globe size={16} />Languages</h2><p className="mt-2 text-sm text-muted">{h.languages.join(', ')}</p></section>
        <section className="card p-6"><h2 className="flex items-center gap-2 font-bold text-deep"><Clock size={16} />Operating hours</h2><p className="mt-2 text-sm text-muted">{h.hours}{!h.verified && ' - unverified sample'}</p>
          <h2 className="mt-6 font-bold text-deep">Appointments</h2><p className="mt-2 text-sm text-muted">Online appointment requests are not available yet. Please contact the provider directly.</p></section>
      </div>
      <section className="card p-6"><h2 className="mb-3 font-bold text-deep">Services and facilities</h2><HospitalServices services={h.services} /></section>
      <Link href="/find-care" className="inline-block text-sm font-semibold text-primary hover:underline">← Back to search</Link>
    </div>
  );
}
