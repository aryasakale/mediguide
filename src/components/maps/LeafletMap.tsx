'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as Lf from 'leaflet';

export type Pin = { id: string; lat: number; lng: number; label: string; emergency?: boolean };
type Props = { pins: Pin[]; selectedId?: string; onSelect?: (id: string) => void; className?: string;
  /** picker mode: click map / drag marker to choose a point */ picker?: { value: { lat: number; lng: number } | null; onChange: (p: { lat: number; lng: number }) => void } };

const icon = (L: typeof Lf, color: string, size: number) => L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>` });

/** Real OpenStreetMap map (Leaflet loaded on demand). Used for user results and the admin location picker. */
export default function LeafletMap({ pins, selectedId, onSelect, className = 'h-[420px]', picker }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const st = useRef<{ L: typeof Lf; map: Lf.Map; layer: Lf.LayerGroup; pick?: Lf.Marker; sig: string } | null>(null);
  const cb = useRef({ onSelect, picker }); cb.current = { onSelect, picker };

  useEffect(() => {
    let dead = false;
    import('leaflet').then((L) => {
      if (dead || !el.current) return;
      const map = L.map(el.current, { scrollWheelZoom: !!picker }).setView([20.59, 78.96], 5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      st.current = { L, map, layer: L.layerGroup().addTo(map), sig: '' };
      if (picker) map.on('click', (e) => cb.current.picker?.onChange({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }));
      sync();
    });
    return () => { dead = true; st.current?.map.remove(); st.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    const s = st.current; if (!s) return;
    const { L, map, layer } = s;
    layer.clearLayers();
    pins.forEach((p) => L.marker([p.lat, p.lng], { icon: icon(L, p.emergency ? '#FF7969' : '#126B63', selectedId === p.id ? 30 : 22), title: p.label })
      .on('click', () => cb.current.onSelect?.(p.id)).addTo(layer));
    const sig = pins.map((p) => p.id).join('|');
    if (!picker && sig !== s.sig && pins.length) { map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40], maxZoom: 15 }); }
    s.sig = sig;
    const sel = pins.find((p) => p.id === selectedId); if (sel) map.panTo([sel.lat, sel.lng]);
    const v = picker?.value;
    if (picker && v) {
      if (!s.pick) { s.pick = L.marker([v.lat, v.lng], { draggable: true }).addTo(map); s.pick.on('dragend', () => { const q = s.pick!.getLatLng(); cb.current.picker?.onChange({ lat: +q.lat.toFixed(6), lng: +q.lng.toFixed(6) }); }); }
      else s.pick.setLatLng([v.lat, v.lng]);
      map.setView([v.lat, v.lng], Math.max(map.getZoom(), 15));
    } else if (s.pick) { s.pick.remove(); s.pick = undefined; }
  }
  useEffect(sync, [pins, selectedId, picker?.value?.lat, picker?.value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={`relative z-0 overflow-hidden rounded-2xl border border-line ${className}`} role="group" aria-label="Map" />;
}
