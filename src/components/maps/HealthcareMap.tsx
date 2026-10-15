'use client';
import { useMemo } from 'react';
import type { Hospital } from '@/types/healthcare';
import LeafletMap from './LeafletMap';

/** User-facing map: real OpenStreetMap with published providers (same data as the admin panel). */
export default function HealthcareMap({ hospitals, selectedId, onSelect, compact }: { hospitals: Hospital[]; selectedId?: string; onSelect?: (id: string) => void; compact?: boolean }) {
  const pins = useMemo(() => hospitals.filter((h) => h.lat != null && h.lng != null).map((h) => ({ id: h.id, lat: h.lat!, lng: h.lng!, label: h.name, emergency: h.emergency })), [hospitals]);
  return <LeafletMap pins={pins} selectedId={selectedId} onSelect={onSelect} className={compact ? 'h-56' : 'h-[420px]'} />;
}
