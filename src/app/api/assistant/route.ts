import { z } from 'zod';
import { ok, fail, parse, rateLimit, toResponse } from '@/lib/server/http';
import { userClient } from '@/lib/server/supabase';
export const dynamic = 'force-dynamic';
const Body = z.object({ message: z.string().trim().min(1).max(1000), history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) })).max(8).default([]) });
const URGENT = ['chest pain', "can't breathe", 'cannot breathe', 'severe bleeding', 'unconscious', 'stroke', 'seizure', 'overdose', 'suicid'];
const SPEC: Record<string, string[]> = { Cardiology: ['heart', 'palpitation'], Dental: ['tooth', 'teeth', 'dental', 'gum'], Dermatology: ['skin', 'rash', 'itch'], Pediatrics: ['child', 'baby', 'kid', 'infant'], Orthopedics: ['bone', 'fracture', 'sprain', 'joint'], Ophthalmology: ['eye', 'vision'], 'General Medicine': ['fever', 'cold', 'cough', 'headache', 'stomach', 'vomit', 'sore throat'] };
const SYSTEM = 'You are MediGuide\'s assistant. Give brief, general health information and help the user choose a type of care. You are NOT a doctor: never diagnose or prescribe. If symptoms could be an emergency, tell them to contact local emergency services. Only mention healthcare providers that appear in the PROVIDERS list; never invent names, addresses, hours, or availability. If the list is empty, say none were found in MediGuide.';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon';
    rateLimit(`ai:${ip}`, 15, 60_000);
    const { message, history } = await parse(Body, req);
    const t = message.toLowerCase();
    if (URGENT.some((k) => t.includes(k)))   // deterministic safety path: never delegated to a model
      return ok({ urgent: true, reply: 'Your symptoms may need urgent attention. Please contact your local emergency services now or go to the nearest emergency department.' });
    const key = process.env.AI_PROVIDER_API_KEY;
    if (!key) return fail(503, 'The AI assistant is not configured on this server.');
    const specialty = Object.entries(SPEC).find(([, ws]) => ws.some((w) => t.includes(w)))?.[0];
    let q = userClient().from('healthcare_providers').select('name,category,address,city,specialties,phone,verified').limit(5);   // RLS: published only
    if (specialty) q = q.contains('specialties', [specialty]);
    const { data: provs } = await q;
    const ctx = 'PROVIDERS:\n' + ((provs ?? []).map((p) => `- ${p.name} (${p.category}, ${p.city}; ${p.address}; ${p.verified ? 'verified' : 'unverified'})`).join('\n') || '(none)');
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20_000);
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-haiku-5-5', max_tokens: 500, system: `${SYSTEM}\n\n${ctx}`, messages: [...history, { role: 'user', content: message }] }),
      });
      if (!r.ok) return fail(502, 'The assistant is temporarily unavailable. Please try again.');
      const d = await r.json();
      const reply = (d.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n').trim();
      return ok({ reply: reply || 'Sorry, I could not produce an answer.', specialty, urgent: false });
    } catch { return fail(504, 'The assistant took too long to respond. Please try again.'); } finally { clearTimeout(timer); }
  } catch (e) { return toResponse(e); }
}
