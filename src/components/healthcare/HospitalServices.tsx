import { CheckCircle2 } from 'lucide-react';
export default function HospitalServices({ services }: { services: string[] }) {
  return <ul className="grid gap-2 sm:grid-cols-2">{services.map((s) => <li key={s} className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-success" aria-hidden />{s}</li>)}</ul>;
}
