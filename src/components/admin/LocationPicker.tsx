'use client';
import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import LeafletMap from '../maps/LeafletMap';
import Button from '../ui/Button';

type Pt = { lat: number; lng: number };
/** 3 ways to set a location: address search (OpenStreetMap Nominatim), click/drag on the map, or type coordinates. */
export default function LocationPicker({ value, onChange, query, error }: { value: Pt | null; onChange: (p: Pt) => void; query: string; error?: string }) {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [raw, setRaw] = useState<{ lat?: string; lng?: string }>({});

  async function search() {
    if (query.trim().length < 3) { setMsg('Fill in the address and city first.'); return; }
    setBusy(true); setMsg(''); setResults([]);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`);
      const d = await r.json(); setResults(d); if (!d.length) setMsg('No match found. Click the map or enter coordinates instead.');
    } catch { setMsg('Address search failed. Click the map or enter coordinates instead.'); }
    setBusy(false);
  }
  const num = (k: 'lat' | 'lng', v: string) => {
    setRaw((r) => ({ ...r, [k]: v })); const n = Number(v);
    const lim = k === 'lat' ? 90 : 180;
    if (v.trim() !== '' && Number.isFinite(n) && Math.abs(n) <= lim) onChange({ lat: k === 'lat' ? n : value?.lat ?? 0, lng: k === 'lng' ? n : value?.lng ?? 0 });
  };
  const show = (k: 'lat' | 'lng') => raw[k] ?? (value ? String(value[k]) : '');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={search} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}Find address on map</Button>
        <span className="text-xs text-muted">or click the map / drag the pin / type coordinates</span>
      </div>
      {msg && <p role="status" className="text-xs text-muted">{msg}</p>}
      {results.length > 0 && <ul className="divide-y divide-line rounded-xl border border-line bg-white text-sm">{results.map((r) => (
        <li key={r.lat + r.lon}><button type="button" className="w-full px-3 py-2 text-left hover:bg-softmint" onClick={() => { onChange({ lat: +(+r.lat).toFixed(6), lng: +(+r.lon).toFixed(6) }); setRaw({}); setResults([]); }}>{r.display_name}</button></li>))}</ul>}
      <LeafletMap pins={[]} className="h-72" picker={{ value, onChange: (p) => { setRaw({}); onChange(p); } }} />
      <div className="grid grid-cols-2 gap-3">
        {(['lat', 'lng'] as const).map((k) => (
          <label key={k} className="block text-sm font-semibold text-deep">{k === 'lat' ? 'Latitude *' : 'Longitude *'}
            <input inputMode="decimal" className="field mt-1.5 font-normal" value={show(k)} onChange={(e) => num(k, e.target.value)} placeholder={k === 'lat' ? 'e.g. 18.5204' : 'e.g. 73.8567'} /></label>))}
      </div>
      {error && <p role="alert" className="text-xs text-[#C2453A]">{error}</p>}
    </div>
  );
}
