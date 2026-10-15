import { z } from 'zod';
import { ok, parse, requireAdmin, toResponse, uuid, HttpError } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
const kind = (k: string) => { if (k !== 'specialty' && k !== 'service') throw new HttpError(404, 'Unknown catalog'); return k; };
const Body = z.object({ name: z.string().trim().min(2).max(80) }).strict();
export async function GET(_: Request, { params }: { params: { kind: string } }) {
  try {
    const { sb } = await requireAdmin('providers:read');
    const { data, error } = await sb.from('catalog_items').select('*').eq('kind', kind(params.kind)).order('name');
    if (error) throw error;
    return ok(data);
  } catch (e) { return toResponse(e); }
}
export async function POST(req: Request, { params }: { params: { kind: string } }) {
  try {
    const { sb } = await requireAdmin('providers:write');
    const { name } = await parse(Body, req);
    const { data, error } = await sb.from('catalog_items').insert({ kind: kind(params.kind), name }).select('*').single();
    if (error) throw error;
    return ok(data, 201);
  } catch (e) { return toResponse(e); }
}
/** Deactivate/reactivate (never hard-delete; providers may still reference the name). ?id=...&active=true|false */
export async function PATCH(req: Request, { params }: { params: { kind: string } }) {
  try {
    const { sb } = await requireAdmin('providers:write');
    const u = new URL(req.url), id = uuid(u.searchParams.get('id') ?? ''), active = u.searchParams.get('active') === 'true';
    const { data, error } = await sb.from('catalog_items').update({ active }).eq('id', id).eq('kind', kind(params.kind)).select('*').maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Not found');
    return ok(data);
  } catch (e) { return toResponse(e); }
}
