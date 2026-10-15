import { z } from 'zod';
import { ok, parse, requireAdmin, toResponse } from '@/lib/server/http';
import { ProviderInput } from '@/lib/server/schemas';
export const dynamic = 'force-dynamic';
const Q = z.object({ q: z.string().trim().max(80).optional(), status: z.enum(['draft', 'published', 'archived']).optional(), verification: z.enum(['pending', 'under_review', 'verified', 'rejected']).optional(), page: z.coerce.number().int().min(1).default(1), size: z.coerce.number().int().min(1).max(100).default(25) });
export async function GET(req: Request) {
  try {
    const { sb } = await requireAdmin('providers:read');
    const p = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
    let q = sb.from('healthcare_providers').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (p.q) q = q.or(`name.ilike.%${p.q.replace(/[%,()]/g, ' ')}%,city.ilike.%${p.q.replace(/[%,()]/g, ' ')}%`);
    if (p.status) q = q.eq('publication_status', p.status);
    if (p.verification) q = q.eq('verification_status', p.verification);
    const { data, count, error } = await q.range((p.page - 1) * p.size, p.page * p.size - 1);
    if (error) throw error;
    return ok({ items: data, total: count ?? 0, page: p.page, size: p.size });
  } catch (e) { return toResponse(e); }
}
/** Creates a DRAFT, pending-verification record (DB trigger enforces this too). */
export async function POST(req: Request) {
  try {
    const { sb, user } = await requireAdmin('providers:write');
    const body = await parse(ProviderInput, req);
    const { data, error } = await sb.from('healthcare_providers').insert({ ...body, publication_status: 'draft', created_by: user.id }).select('*').single();
    if (error) throw error;
    return ok(data, 201);
  } catch (e) { return toResponse(e); }
}
