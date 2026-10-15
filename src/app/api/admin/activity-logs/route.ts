import { z } from 'zod';
import { ok, requireAdmin, toResponse } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const { sb } = await requireAdmin('logs:read');
    const { page, size } = z.object({ page: z.coerce.number().int().min(1).default(1), size: z.coerce.number().int().min(1).max(100).default(30) }).parse(Object.fromEntries(new URL(req.url).searchParams));
    const { data, count, error } = await sb.from('admin_activity_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * size, page * size - 1);
    if (error) throw error;
    return ok({ items: data, total: count ?? 0, page, size });
  } catch (e) { return toResponse(e); }
}
