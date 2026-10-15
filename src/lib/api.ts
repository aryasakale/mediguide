import type { ChatMessage } from '@/types/healthcare';

const API = process.env.NEXT_PUBLIC_API_URL;

const URGENT = ['chest pain', "can't breathe", 'cannot breathe', 'severe bleeding', 'unconscious', 'stroke', 'seizure', 'overdose', 'suicid'];
const SPECIALTY: Record<string, string[]> = {
  'Cardiology': ['heart', 'palpitation'], 'Dental': ['tooth', 'teeth', 'dental', 'gum'], 'Dermatology': ['skin', 'rash', 'itch'],
  'Pediatrics': ['child', 'baby', 'kid', 'infant'], 'Obstetrics': ['pregnan'], 'Orthopedics': ['bone', 'fracture', 'sprain', 'joint'],
  'Ophthalmology': ['eye', 'vision'], 'General Medicine': ['fever', 'cold', 'cough', 'headache', 'stomach', 'vomit', 'sore throat', 'pain'],
};
const DISCLAIMER = ' This is general information, not a diagnosis. A licensed professional can assess you properly.';

/** Local demo assistant (used only when NEXT_PUBLIC_API_URL is not set). Mirrors backend/main.py. */
function demoReply(text: string): ChatMessage {
  const t = text.toLowerCase();
  if (URGENT.some((k) => t.includes(k)))
    return { role: 'assistant', urgent: true, demo: true, content: 'Your symptoms may need urgent attention. Please contact local emergency services now or go to the nearest emergency department. Open Emergency Help for options.' };
  const specialty = Object.entries(SPECIALTY).find(([, ws]) => ws.some((w) => t.includes(w)))?.[0];
  return specialty
    ? { role: 'assistant', specialty, demo: true, content: `For concerns like this, a ${specialty} provider is usually a good starting point. Rest, hydration and tracking your symptoms can help while you arrange care; seek urgent care if things get worse.${DISCLAIMER}` }
    : { role: 'assistant', demo: true, content: `Could you tell me more - what symptoms do you have, for how long, and what type of provider (hospital, clinic, pharmacy) are you looking for?${DISCLAIMER}` };
}

export async function askAssistant(message: string, history: ChatMessage[]): Promise<ChatMessage> {
  const url = API ? `${API}/chat` : '/api/assistant';
  let r: Response;
  try { r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history: history.slice(-8).map(({ role, content }) => ({ role, content })) }) }); }
  catch { return demoReply(message); }                       // network failure: clearly flagged offline demo reply
  if (r.status === 503 && !API) return demoReply(message);   // AI not configured: flagged demo reply (msg.demo === true)
  if (!r.ok) throw new Error('The assistant service returned an error. Please try again.');
  const j = await r.json(), d = j.data ?? j;
  return { role: 'assistant', content: d.reply, specialty: d.specialty ?? undefined, urgent: !!d.urgent };
}
