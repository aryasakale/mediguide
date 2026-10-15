import { demoHospitals } from '@/data/demo-hospitals';
import { getSupabase, demoAllowed } from '@/lib/supabase/client';
import type { Hospital, Provider, Status } from '@/types/healthcare';

/**
 * Single data layer for hospitals/clinics, used by BOTH the admin panel and the user site.
 * - Supabase configured: table public.healthcare_providers (RLS enforces admin-only writes) + Realtime.
 * - Not configured: browser localStorage seeded with the demo data (cross-tab live updates via the storage event).
 */
const LS = 'mg_providers_v1', EVT = 'mg:providers';
const T = 'healthcare_providers';
const PUNE = { lat: 18.5204, lng: 73.8567 };

// ---------- mapping ----------
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const fromRow = (r: Row): Provider => ({
  id: r.id, name: r.name, category: (r.category as Provider['category']), address: r.address, city: r.city, state: r.state,
  postalCode: r.postal_code ?? undefined, phone: r.phone ?? undefined, services: r.services ?? [], specialties: r.specialties ?? [],
  languages: r.languages ?? [], hours: r.hours ?? '', open24h: !!r.open24h, emergency: !!r.emergency, rating: r.rating ?? undefined,
  lat: r.latitude, lng: r.longitude, status: r.publication_status, verified: r.verification_status === 'verified', verificationStatus: r.verification_status, submittedAt: r.submitted_at ?? null, createdAt: r.created_at, updatedAt: r.updated_at,
});
const toRow = (p: Partial<Provider>): Row => ({
  name: p.name, category: p.category, address: p.address, city: p.city, state: p.state, postal_code: p.postalCode || null, phone: p.phone || null,
  services: p.services, specialties: p.specialties, languages: p.languages, hours: p.hours, open24h: p.open24h, emergency: p.emergency,
  rating: p.rating ?? null, latitude: p.lat, longitude: p.lng, publication_status: p.status,
});

export const fullAddress = (p: Provider) => [p.address, p.city, p.state, p.postalCode].filter(Boolean).join(', ');
export const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = (d: number) => (d * Math.PI) / 180, dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
export function toHospital(p: Provider, from?: { lat: number; lng: number } | null): Hospital {
  return {
    id: p.id, name: p.name, category: p.category, specialties: p.specialties, languages: p.languages, address: fullAddress(p),
    distanceKm: from ? Math.round(haversineKm(from, p) * 10) / 10 : undefined, rating: p.rating, open24h: p.open24h, emergency: p.emergency,
    phone: p.phone, hours: p.hours, services: p.services, lat: p.lat, lng: p.lng, verified: p.verified,
  };
}

// ---------- local fallback ----------
function seed(): Provider[] {
  const now = new Date().toISOString();
  return demoHospitals.map((h) => ({
    id: h.id, name: h.name, category: h.category, address: 'Sample address (demo record)', city: 'Pune', state: 'Maharashtra',
    services: h.services, specialties: h.specialties, languages: h.languages, hours: h.hours, open24h: h.open24h, emergency: h.emergency,
    rating: h.rating, phone: h.phone, lat: PUNE.lat + (50 - (h.y ?? 50)) * 0.0009, lng: PUNE.lng + ((h.x ?? 50) - 50) * 0.0011,
    status: 'published' as Status, verified: false, createdAt: now, updatedAt: now,
  }));
}
function readLocal(): Provider[] {
  if (!demoAllowed) return [];
  try { const s = localStorage.getItem(LS); if (s) return JSON.parse(s); } catch { /* ignore */ }
  const d = seed(); localStorage.setItem(LS, JSON.stringify(d)); return d;
}
function writeLocal(list: Provider[]) { localStorage.setItem(LS, JSON.stringify(list)); window.dispatchEvent(new Event(EVT)); }

// ---------- public API ----------
/** admin=true returns every record (drafts/archived too); otherwise published only. */
export async function listProviders(admin = false): Promise<Provider[]> {
  const sb = getSupabase();
  if (!sb) return readLocal().filter((p) => admin || p.status === 'published').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  let q = sb.from(T).select('*').order('created_at', { ascending: false });
  if (!admin) q = q.eq('publication_status', 'published');
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}
export async function getProvider(id: string): Promise<Provider | null> {
  const sb = getSupabase();
  if (!sb) return readLocal().find((p) => p.id === id) ?? null;
  const { data } = await sb.from(T).select('*').eq('id', id).maybeSingle();
  return data ? fromRow(data) : null;
}
/** Insert (no id) or update (id). Returns an error message or null. */
export async function saveProvider(p: Partial<Provider>): Promise<{ error: string | null; id?: string }> {
  const sb = getSupabase();
  if (!sb) {
    const list = readLocal(), now = new Date().toISOString();
    if (p.id) { const i = list.findIndex((x) => x.id === p.id); if (i < 0) return { error: 'Record not found.' }; list[i] = { ...list[i], ...p, updatedAt: now } as Provider; writeLocal(list); return { error: null, id: p.id }; }
    const id = `local-${Date.now().toString(36)}`;
    list.unshift({ ...(p as Provider), id, verified: true, createdAt: now, updatedAt: now }); writeLocal(list); return { error: null, id };
  }
  const { publication_status: _ps, ...body } = toRow(p); // publication/verification are never writable through create/edit
  const clean = Object.fromEntries(Object.entries(body).filter(([k, v]) => v !== undefined && k !== 'rating'));
  const r = await fetch(p.id ? `/api/admin/providers/${p.id}` : '/api/admin/providers', { method: p.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clean) });
  const j = await r.json().catch(() => null);
  return r.ok ? { error: null, id: j?.data?.id ?? p.id } : { error: j?.error?.message ?? 'Could not save.' };
}
export async function setStatus(id: string, status: Status): Promise<{ error: string | null }> {
  if (!getSupabase()) return saveProvider({ id, status });
  const path = status === 'published' ? 'publish' : status === 'archived' ? 'archive' : 'restore';
  const r = await fetch(`/api/admin/providers/${id}/${path}`, { method: 'POST' });
  return { error: r.ok ? null : (await r.json().catch(() => null))?.error?.message ?? 'Action failed.' };
}
export async function deleteProvider(id: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) { writeLocal(readLocal().filter((p) => p.id !== id)); return null; }
  return (await setStatus(id, 'archived')).error; // archive, never hard-delete
}
/** Submit for verification (server-side RPC; role checked in SQL). */
export async function submitForVerification(id: string): Promise<string | null> {
  const r = await fetch(`/api/admin/providers/${id}/submit`, { method: 'POST' }); if (r.ok) return null;
  return (await r.json().catch(() => null))?.error?.message ?? 'Could not submit.';
}
export function resetLocalData() { localStorage.removeItem(LS); window.dispatchEvent(new Event(EVT)); }

/** Live updates. Supabase Realtime + a slow poll (Realtime cannot notify non-admins when a row becomes hidden by RLS, e.g. unpublish). */
export function subscribe(onChange: () => void): () => void {
  const sb = getSupabase();
  if (!sb) {
    const h = (e: Event) => { if (e.type === EVT || (e as StorageEvent).key === LS) onChange(); };
    window.addEventListener(EVT, h); window.addEventListener('storage', h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('storage', h); };
  }
  const ch = sb.channel(`providers-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: T }, onChange).subscribe();
  const vis = () => { if (document.visibilityState === 'visible') onChange(); };
  document.addEventListener('visibilitychange', vis);
  const poll = setInterval(vis, 45000);
  return () => { sb.removeChannel(ch); document.removeEventListener('visibilitychange', vis); clearInterval(poll); };
}

// ---------- user location (only when the user asks) ----------
const LOC = 'mg_user_loc', LOC_EVT = 'mg:loc';
export const getUserLoc = (): { lat: number; lng: number } | null => { try { return JSON.parse(localStorage.getItem(LOC) || 'null'); } catch { return null; } };
export function requestUserLoc(): Promise<string | null> {
  return new Promise((res) => {
    if (!navigator.geolocation) return res('Your browser does not support location.');
    navigator.geolocation.getCurrentPosition(
      (p) => { localStorage.setItem(LOC, JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude })); window.dispatchEvent(new Event(LOC_EVT)); res(null); },
      () => res('Location permission was not granted.'));
  });
}
export const onUserLoc = (cb: () => void) => { window.addEventListener(LOC_EVT, cb); return () => window.removeEventListener(LOC_EVT, cb); };
