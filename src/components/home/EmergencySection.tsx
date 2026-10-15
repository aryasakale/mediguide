import { Siren } from 'lucide-react';
import Button from '../ui/Button';
export default function EmergencySection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-coral bg-coralbg p-8 md:flex-row md:items-center">
        <div className="flex gap-4"><Siren className="mt-1 shrink-0 text-coral" /><div><h2 className="text-2xl font-extrabold text-deep">In an emergency, act first</h2><p className="mt-1 max-w-xl text-sm text-ink">Open Emergency Help to call local emergency services from your phone, see emergency-capable hospitals, and share your location when you choose to.</p></div></div>
        <Button href="/emergency" variant="emergency" className="shrink-0 bg-white">Emergency Help</Button>
      </div>
    </section>
  );
}
