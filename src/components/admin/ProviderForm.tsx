'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LocationPicker from './LocationPicker';
import { saveProvider } from '@/lib/providers';
import type { Category, Provider, Status } from '@/types/healthcare';

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
const CATS: Category[] = ['Hospital', 'Clinic', 'Doctor', 'Pharmacy'];

export default function ProviderForm({ initial }: { initial?: Provider }) {
  const router = useRouter();
  const [f, setF] = useState({
    category: (initial?.category ?? 'Hospital') as Category, name: initial?.name ?? '', address: initial?.address ?? '', city: initial?.city ?? '', state: initial?.state ?? '',
    postalCode: initial?.postalCode ?? '', phone: initial?.phone ?? '', services: initial?.services.join(', ') ?? '', specialties: initial?.specialties.join(', ') ?? '',
    languages: initial?.languages.join(', ') ?? 'English', hours: initial?.hours ?? '', open24h: initial?.open24h ?? false, emergency: initial?.emergency ?? false,
    rating: initial?.rating != null ? String(initial.rating) : '',
  });
  const [pt, setPt] = useState<{ lat: number; lng: number } | null>(initial ? { lat: initial.lat, lng: initial.lng } : null);
  const [status, setStatus] = useState<Status>(initial?.status ?? 'draft');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function submit(target: Status) {
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = 'Enter the facility name.';
    if (f.address.trim().length < 3) v.address = 'Enter the street address.';
    if (!f.city.trim()) v.city = 'Enter the city.';
    if (!f.state.trim()) v.state = 'Enter the state.';
    if (f.postalCode && !/^\d{6}$/.test(f.postalCode.trim())) v.postalCode = 'PIN code must be 6 digits.';
    if (f.phone && !/^[+\d][\d\s()-]{5,17}$/.test(f.phone.trim())) v.phone = 'Enter a valid phone number.';
    if (f.rating && !(Number(f.rating) >= 0 && Number(f.rating) <= 5)) v.rating = 'Rating must be between 0 and 5.';
    if (!pt || (pt.lat === 0 && pt.lng === 0)) v.loc = 'Choose the exact location on the map or enter valid coordinates.';
    setErrs(v); setError('');
    if (Object.keys(v).length) return;
    setBusy(true);
    const { error: err } = await saveProvider({
      id: initial?.id, category: f.category, name: f.name.trim(), address: f.address.trim(), city: f.city.trim(), state: f.state.trim(), postalCode: f.postalCode.trim() || undefined,
      phone: f.phone.trim() || undefined, services: list(f.services), specialties: list(f.specialties), languages: list(f.languages), hours: f.hours.trim() || 'Hours not provided',
      open24h: f.open24h, emergency: f.emergency, rating: f.rating ? Number(f.rating) : undefined, lat: pt!.lat, lng: pt!.lng, status: target,
    });
    setBusy(false);
    if (err) { setError(err); return; }
    router.push('/admin/providers');
  }

  const Check = ({ k, label }: { k: 'open24h' | 'emergency'; label: string }) => (
    <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-deep"><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-[#126B63]" />{label}</label>);

  return (
    <div className="space-y-6">
      <section className="card space-y-4 p-6">
        <div role="radiogroup" aria-label="Facility type" className="flex flex-wrap gap-2">
          {CATS.map((c) => <button key={c} type="button" role="radio" aria-checked={f.category === c} onClick={() => set('category', c)}
            className={`min-h-[40px] rounded-full px-5 text-sm font-semibold ${f.category === c ? 'bg-primary text-white' : 'border border-line bg-white text-ink hover:bg-softmint'}`}>{c}</button>)}
        </div>
        <Input label="Facility name *" value={f.name} onChange={(e) => set('name', e.target.value)} error={errs.name} />
        <Input label="Street address *" value={f.address} onChange={(e) => set('address', e.target.value)} error={errs.address} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="City *" value={f.city} onChange={(e) => set('city', e.target.value)} error={errs.city} />
          <Input label="State *" value={f.state} onChange={(e) => set('state', e.target.value)} error={errs.state} />
          <Input label="PIN code" inputMode="numeric" maxLength={6} value={f.postalCode} onChange={(e) => set('postalCode', e.target.value)} error={errs.postalCode} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Contact number" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} error={errs.phone} />
          <Input label="Operating hours" placeholder="e.g. 09:00 - 18:00" value={f.hours} onChange={(e) => set('hours', e.target.value)} />
        </div>
        <Input label="Specialties" hint="Comma separated, e.g. Cardiology, Pediatrics" value={f.specialties} onChange={(e) => set('specialties', e.target.value)} />
        <Input label="Services" hint="Comma separated, e.g. Ambulance, ICU, Pharmacy" value={f.services} onChange={(e) => set('services', e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Languages" hint="Comma separated" value={f.languages} onChange={(e) => set('languages', e.target.value)} />
          <Input label="Rating (optional, 0-5)" inputMode="decimal" value={f.rating} onChange={(e) => set('rating', e.target.value)} error={errs.rating} />
        </div>
        <div className="flex flex-wrap gap-x-6"><Check k="open24h" label="Open 24 hours" /><Check k="emergency" label="Emergency care available" /></div>
      </section>
      <section className="card p-6">
        <h2 className="mb-1 font-bold text-deep">Exact map location</h2>
        <p className="mb-4 text-xs text-muted">Coordinates are stored with the record and used for the user map and distance filters.</p>
        <LocationPicker value={pt} onChange={setPt} query={[f.name, f.address, f.city, f.state, f.postalCode].filter(Boolean).join(', ')} error={errs.loc} />
      </section>
      {error && <p role="alert" className="rounded-xl bg-coralbg px-4 py-3 text-sm text-[#C2453A]">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {status !== 'published' || !initial
          ? <><Button type="button" variant="secondary" disabled={busy} onClick={() => submit(initial && status === 'archived' ? 'archived' : 'draft')}>{busy && <Loader2 size={16} className="animate-spin" />}Save as draft</Button>
              <Button type="button" disabled={busy} onClick={() => submit('published')}>Publish to user search</Button></>
          : <><Button type="button" disabled={busy} onClick={() => submit('published')}>{busy && <Loader2 size={16} className="animate-spin" />}Save changes</Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => submit('draft')}>Unpublish (draft)</Button></>}
        <Button type="button" variant="ghost" href="/admin/providers">Cancel</Button>
      </div>
    </div>
  );
}
