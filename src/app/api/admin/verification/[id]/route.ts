import { z } from 'zod';
import { ok, parse, requireAdmin, toResponse, uuid } from '@/lib/server/http';
const Body = z.object({ status: z.enum(['under_review', 'verified', 'rejected']), notes: z.string().trim().max(2000).optional() });
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('verification:review');
    const b = await parse(Body, req);
    const { error } = await sb.rpc('review_provider', { p_id: uuid(params.id), p_status: b.status, p_notes: b.notes ?? null }); // atomic, role-checked in SQL; never publishes
    if (error) throw error;
    return ok({ id: params.id, verification_status: b.status });
  } catch (e) { return toResponse(e); }
}
