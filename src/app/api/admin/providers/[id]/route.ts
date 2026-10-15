import { ok, parse, requireAdmin, toResponse, uuid, HttpError } from '@/lib/server/http';
import { ProviderPatch } from '@/lib/server/schemas';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:read');
    const { data, error } = await sb.from('healthcare_providers').select('*').eq('id', uuid(params.id)).maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Not found');
    return ok(data);
  } catch (e) { return toResponse(e); }
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:write');
    const body = await parse(ProviderPatch, req);
    if (!Object.keys(body).length) throw new HttpError(400, 'Nothing to update');
    const { data, error } = await sb.from('healthcare_providers').update(body).eq('id', uuid(params.id)).select('*').maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Not found');
    return ok(data);
  } catch (e) { return toResponse(e); }
}
