import type { Filters, Hospital } from '@/types/healthcare';
export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
export const defaultFilters: Filters = { q: '', location: '', distance: 50, specialty: '', category: '', language: '', availability: '' };
export const directionsUrl = (h: Hospital) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${h.name} ${h.address}`)}`;
export function applyFilters(list: Hospital[], f: Filters) {
  const q = f.q.trim().toLowerCase(), loc = f.location.trim().toLowerCase();
  return list.filter((h) =>
    (!q || [h.name, h.category, h.address, ...h.specialties, ...h.services].some((s) => s.toLowerCase().includes(q))) &&
    (!loc || h.address.toLowerCase().includes(loc)) &&
    (h.distanceKm == null || h.distanceKm <= f.distance) &&
    (!f.specialty || h.specialties.includes(f.specialty)) &&
    (!f.category || h.category === f.category) &&
    (!f.language || h.languages.includes(f.language)) &&
    (!f.availability || (f.availability === 'open24h' ? h.open24h : h.emergency))
  ).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || a.name.localeCompare(b.name));
}
