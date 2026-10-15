import { Bot } from 'lucide-react';
import Button from '../ui/Button';
export default function AISection() {
  return (
    <section id="ai" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-extrabold text-deep">An assistant that points you to the right care</h2>
        <p className="mt-3 text-muted">Describe what you&apos;re feeling in plain language. MediGuide AI explains which kind of provider usually helps and shows suitable options. It never diagnoses - it guides you toward professional care.</p>
        <Button href="/ai-assistant" className="mt-6"><Bot size={16} />Ask MediGuide AI</Button>
      </div>
      <div className="card space-y-3 p-6" aria-hidden>
        <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-white">I have a fever and I&apos;m in a new city.</p>
        <p className="max-w-[88%] rounded-2xl rounded-bl-sm bg-pale px-4 py-3 text-sm">A general medicine clinic is a good start. I can show clinics nearby, open now. Seek urgent care if symptoms worsen.</p>
      </div>
    </section>
  );
}
