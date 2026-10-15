'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Loader2, Send, Trash2 } from 'lucide-react';
import HospitalCard from '../healthcare/HospitalCard';
import ErrorState from '../ui/ErrorState';
import { askAssistant } from '@/lib/api';
import { useHospitals } from '@/hooks/useProviders';
import type { ChatMessage } from '@/types/healthcare';

const WELCOME: ChatMessage = { role: 'assistant', content: 'Hi, I\u2019m MediGuide AI. Tell me how you\u2019re feeling or what kind of care you need, and I\u2019ll help you understand your options. I can\u2019t diagnose conditions - for that, you\u2019ll need a licensed professional.' };
const PROMPTS = ['I have a fever and a sore throat', 'I need a dentist nearby', 'Where can I find a 24-hour pharmacy?', 'My child has a skin rash'];

export default function ChatInterface() {
  const { hospitals } = useHospitals();
  const [msgs, setMsgs] = useState<ChatMessage[]>([WELCOME]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { try { const s = JSON.parse(localStorage.getItem('mg_chat') || 'null'); if (Array.isArray(s) && s.length) setMsgs(s); } catch { /* ignore */ } }, []);
  useEffect(() => { localStorage.setItem('mg_chat', JSON.stringify(msgs)); end.current?.scrollIntoView({ block: 'end' }); }, [msgs]);

  async function send(q: string) {
    const content = q.trim(); if (!content || busy) return;
    setError(''); setText(''); setBusy(true);
    const next = [...msgs, { role: 'user' as const, content }]; setMsgs(next);
    try { const reply = await askAssistant(content, next); setMsgs([...next, reply]); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not reach the assistant.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="card flex h-[calc(100vh-15rem)] min-h-[460px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-deep"><Bot size={18} className="text-primary" />MediGuide AI</p>
        <button onClick={() => { setMsgs([WELCOME]); setError(''); }} className="flex items-center gap-1 text-xs text-muted hover:text-primary"><Trash2 size={14} />Clear history</button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
        {msgs.map((m, i) => {
          const picks = m.role === 'assistant' && (m.urgent ? hospitals.filter((h) => h.emergency) : m.specialty ? hospitals.filter((h) => h.specialties.includes(m.specialty!)) : []).slice(0, 2);
          return (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
              <div className={m.role === 'user' ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-white' : `max-w-[92%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm ${m.urgent ? 'border border-coral bg-coralbg text-[#8F3027]' : 'bg-pale text-ink'}`}>
                {m.content}
                {m.urgent && <Link href="/emergency" className="mt-2 block font-semibold underline">Open Emergency Help</Link>}
                {m.demo && <span className="mt-2 block text-[11px] opacity-70">Demo assistant - connect the FastAPI backend for live answers.</span>}
              </div>
              {picks && picks.length > 0 && <div className="mt-3 grid gap-3 md:grid-cols-2">{picks.map((h) => <HospitalCard key={h.id} hospital={h} />)}</div>}
            </div>
          );
        })}
        {busy && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="animate-spin" size={16} />Thinking…</p>}
        {error && <ErrorState message={error} />}
        <div ref={end} />
      </div>
      <div className="border-t border-line p-4">
        <div className="mb-3 flex flex-wrap gap-2">{PROMPTS.map((p) => <button key={p} onClick={() => send(p)} disabled={busy} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink hover:bg-softmint disabled:opacity-50">{p}</button>)}</div>
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
          <input aria-label="Your question" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about symptoms, providers or what to do next" className="field rounded-full" />
          <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-deep disabled:opacity-50"><Send size={18} /></button>
        </form>
        <p className="mt-2 text-[11px] text-muted">General information only, not a diagnosis. In an emergency, contact local emergency services.</p>
      </div>
    </div>
  );
}
