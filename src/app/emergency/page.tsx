'use client';
import { useState } from 'react';
import { MapPinned, Phone, Siren } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import HospitalCard from '@/components/healthcare/HospitalCard';
import Button from '@/components/ui/Button';
import { useHospitals } from '@/hooks/useProviders';

const NUMBER = process.env.NEXT_PUBLIC_EMERGENCY_NUMBER || '112';
export default function EmergencyPage() {
  const { hospitals } = useHospitals();
  const [msg, setMsg] = useState('');
  const [link, setLink] = useState('');
  const share = () => {
    if (!navigator.geolocation) { setMsg('Your browser does not support location.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setLink(`https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}`); setMsg('Location found. Nothing has been sent - copy or share the link below yourself.'); },
      () => setMsg('Location permission was not granted. Nothing was shared.'));
  };
  const send = async () => { if (navigator.share) await navigator.share({ title: 'My location', url: link }).catch(() => {}); else { await navigator.clipboard.writeText(link); setMsg('Link copied. Paste it into a message to share it.'); } };
  return (
    <AppShell>
      <PageHeader title="Emergency Help" subtitle="If someone is in immediate danger, call emergency services now." />
      <section className="rounded-3xl border border-coral bg-coralbg p-6 sm:p-8">
        <div className="flex items-start gap-4"><Siren className="mt-1 shrink-0 text-coral" size={28} aria-hidden />
          <div><h2 className="text-xl font-extrabold text-deep">Need urgent medical help?</h2><p className="mt-1 text-sm text-ink">The button opens your phone&apos;s dialer with {NUMBER}. MediGuide does not place the call. Emergency numbers differ by country - check the number is right for where you are.</p></div></div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={`tel:${NUMBER}`} className="bg-coral text-white shadow-none hover:bg-[#E5604F]"><Phone size={16} />Call {NUMBER}</Button>
          <Button variant="secondary" onClick={share}><MapPinned size={16} />Find my location</Button>
        </div>
        {msg && <p role="status" className="mt-4 text-sm text-ink">{msg}</p>}
        {link && <Button variant="secondary" className="mt-3" onClick={send}>Share location link</Button>}
      </section>
      <h2 className="mb-1 mt-10 text-xl font-bold text-deep">Emergency-capable hospitals</h2>
      <p className="mb-4 text-xs text-muted">Sample data - verify before relying on it. Ambulance availability is not confirmed.</p>
      <div className="grid gap-4 md:grid-cols-2">{hospitals.filter((h) => h.emergency).map((h) => <HospitalCard key={h.id} hospital={h} />)}</div>
    </AppShell>
  );
}
