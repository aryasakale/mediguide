import Link from 'next/link';
import { Building2, Pill, Siren, Stethoscope, Smile, Hospital } from 'lucide-react';

function HealthcareCategoryCard({ href, icon: Icon, title, text }: { href: string; icon: typeof Hospital; title: string; text: string }) {
  return (
    <Link href={href} className="card group p-6 transition hover:border-mint">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softmint text-primary"><Icon size={22} aria-hidden /></span>
      <h3 className="mt-4 font-bold text-deep">{title}</h3><p className="mt-1 text-sm text-muted">{text}</p>
    </Link>
  );
}
export default function HealthcareCategories() {
  const items = [
    { href: '/find-care?category=Hospital', icon: Hospital, title: 'Hospitals', text: 'Full-service care and emergency departments.' },
    { href: '/find-care?category=Clinic', icon: Building2, title: 'Clinics', text: 'Walk-in and specialist clinics nearby.' },
    { href: '/find-care?category=Doctor', icon: Stethoscope, title: 'Doctors', text: 'General physicians and specialists.' },
    { href: '/find-care?category=Pharmacy', icon: Pill, title: 'Pharmacies', text: 'Medicines, including late-night options.' },
    { href: '/find-care?specialty=Dental', icon: Smile, title: 'Dental care', text: 'Check-ups and urgent dental help.' },
    { href: '/emergency', icon: Siren, title: 'Emergency', text: 'Urgent options when minutes matter.' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <h2 className="text-3xl font-extrabold text-deep">Find the right kind of care</h2>
      <p className="mt-2 max-w-xl text-muted">Start with what you need - MediGuide narrows the options for you.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((i) => <HealthcareCategoryCard key={i.title} {...i} />)}</div>
    </section>
  );
}
