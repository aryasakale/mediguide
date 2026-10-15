import Link from 'next/link';
import { Bookmark, BookmarkCheck, Clock, MapPin, Navigation } from 'lucide-react';
import RatingDisplay from '../ui/RatingDisplay';
import Button from '../ui/Button';
import { directionsUrl } from '@/lib/utils';
import type { Hospital } from '@/types/healthcare';

export default function HospitalCard({ hospital: h, saved, onToggleSave }: { hospital: Hospital; saved?: boolean; onToggleSave?: (id: string) => void }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2"><span className="badge">{h.category}</span>{h.emergency && <span className="rounded-full bg-coralbg px-3 py-1 text-xs font-semibold text-[#C2453A]">Emergency</span>}{!h.verified && <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Demo data</span>}</div>
          <h3 className="mt-3 text-lg font-bold text-deep">{h.name}</h3>
        </div>
        <RatingDisplay rating={h.rating} />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} aria-hidden />{h.address}{h.distanceKm != null && ` · ${h.distanceKm} km`}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Clock size={14} aria-hidden />{h.hours}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{h.specialties.map((s) => <span key={s} className="rounded-full bg-pale px-2.5 py-1 text-xs text-ink">{s}</span>)}</div>
      <div className="mt-5 flex flex-wrap gap-2 pt-1">
        <Link href={`/hospitals/${h.id}`} className="inline-flex min-h-[40px] items-center rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-deep">View Details</Link>
        <Button href={directionsUrl(h)} external variant="secondary" className="min-h-[40px] px-4"><Navigation size={14} aria-hidden />Get Directions</Button>
        {onToggleSave && <button onClick={() => onToggleSave(h.id)} aria-pressed={saved} aria-label={saved ? `Remove ${h.name} from saved` : `Save ${h.name}`} className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-line text-primary hover:bg-softmint">{saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button>}
      </div>
    </article>
  );
}
