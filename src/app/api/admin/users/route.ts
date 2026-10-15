import { z } from 'zod';
import { ok, parse, requireAdmin, toResponse, HttpError } from '@/lib/server/http';
import { ROLES } from '@/lib/server/permissions';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const { sb } = await requireAdmin('roles:manage');
    const sp = new URL(req.url).searchParams;
    const { page, size } = z.object({ page: z.coerce.number().int().min(1).default(1), size: z.coerce.number().int().min(1).max(50).default(20) }).parse(Object.fromEntries(sp));
    const { data, count, error } = await sb.from('profiles').select('id,email,full_name,created_at', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * size, page * size - 1);
    if (error) throw error;
    const { data: roles } = await sb.from('admin_users').select('user_id,role,active');
    const map = new Map((roles ?? []).map((r) => [r.user_id, r]));
    return ok({ items: (data ?? []).map((u) => ({ ...u, role: map.get(u.id)?.role ?? null, active: map.get(u.id)?.active ?? false })), total: count ?? 0, page, size });
  } catch (e) { return toResponse(e); }
}
