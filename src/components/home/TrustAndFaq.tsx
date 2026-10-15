import { Lock, ShieldCheck, UserCheck } from 'lucide-react';
export function TrustSection() {
  const t = [[ShieldCheck, 'Honest about data', 'Sample records are always labelled as demo - never presented as verified.'], [Lock, 'Private by design', 'Your saved places and profile are visible only to you.'], [UserCheck, 'Guidance, not diagnosis', 'MediGuide supports your decisions and points you to professionals.']] as const;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16"><h2 className="text-3xl font-extrabold text-deep">Built on trust and safety</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{t.map(([I, h, d]) => <div key={h} className="card p-6"><I className="text-primary" aria-hidden /><h3 className="mt-3 font-bold text-deep">{h}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>)}</div></section>
  );
}
export function FAQ() {
  const q = [['Does MediGuide diagnose conditions?', 'No. It gives general information and helps you find professional care.'], ['Is the provider data verified?', 'Records are labelled. Anything marked Demo is sample data until a verified dataset is connected.'], ['Do I need an account?', 'You can explore Find Care without one. An account lets you save hospitals and manage your profile.'], ['What if it is an emergency?', 'Use Emergency Help to open your phone\u2019s dialer for local emergency services right away.'], ['Does MediGuide call or share my location automatically?', 'Never. Calls and location sharing only happen when you choose them.']];
  return (
    <section className="mx-auto max-w-3xl px-5 pb-16"><h2 className="text-3xl font-extrabold text-deep">Frequently asked questions</h2>
      <div className="mt-6 space-y-3">{q.map(([a, b]) => <details key={a} className="card group p-5"><summary className="cursor-pointer font-semibold text-deep">{a}</summary><p className="mt-2 text-sm text-muted">{b}</p></details>)}</div></section>
  );
}
