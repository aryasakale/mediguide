import { z } from 'zod';
import { ok, parse, requireUser, toResponse } from '@/lib/server/http';
export async function GET() {
  try { const { sb, user } = await requireUser(); const { data, error } = await sb.from('profiles').select('id,email,full_name,phone,preferences').eq('id', user.id).single(); if (error) throw error; return ok(data); }
  catch (e) { return toResponse(e); }
}
const Body = z.object({ full_name: z.string().trim().max(120).optional(), phone: z.string().trim().max(30).optional(), preferences: z.record(z.string(), z.unknown()).optional() }).strict();
export async function PATCH(req: Request) {
  try {
    const { sb, user } = await requireUser(); const b = await parse(Body, req);
    const { data, error } = await sb.from('profiles').update(b).eq('id', user.id).select('id,email,full_name,phone,preferences').single(); // column grants block email/id changes
    if (error) throw error; return ok(data);
  } catch (e) { return toResponse(e); }
}
