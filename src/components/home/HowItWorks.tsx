export default function HowItWorks() {
  const steps = [['Tell us what you need', 'Search by symptom, specialty, provider type or language.'], ['Compare your options', 'Filter by distance, availability and category.'], ['Check the details', 'Review services, hours and contact information.'], ['Get there with confidence', 'Open directions, save providers or ask the AI assistant.']];
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-16">
      <div className="mx-auto max-w-7xl px-5">
        <h2 className="text-3xl font-extrabold text-deep">How MediGuide works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="rounded-2xl bg-pale p-6"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span><h3 className="mt-4 font-bold text-deep">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
