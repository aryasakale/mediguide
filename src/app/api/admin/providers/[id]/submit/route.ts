import { ok, requireAdmin, toResponse, uuid } from '@/lib/server/http';
export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:write');
    const { error } = await sb.rpc('submit_provider', { p_id: uuid(params.id) });
    if (error) throw error;
    return ok({ id: params.id, submitted: true });
  } catch (e) { return toResponse(e); }
}
