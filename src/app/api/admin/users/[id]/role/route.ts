import { z } from 'zod';
import { ok, parse, requireAdmin, toResponse, uuid, HttpError } from '@/lib/server/http';
import { ROLES } from '@/lib/server/permissions';
const Body = z.object({ role: z.enum(ROLES as [string, ...string[]]).nullable(), active: z.boolean().optional() });
/** role=null revokes admin access. RLS + trigger enforce super_admin-only and no self-change / last-super_admin removal. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sb, user } = await requireAdmin('roles:manage');
    const id = uuid(params.id), b = await parse(Body, req);
    if (id === user.id) throw new HttpError(403, 'You cannot change your own role');
    if (b.role === null) { const { error } = await sb.from('admin_users').delete().eq('user_id', id); if (error) throw error; return ok({ id, role: null }); }
    const { error } = await sb.from('admin_users').upsert({ user_id: id, role: b.role, active: b.active ?? true, created_by: user.id }, { onConflict: 'user_id' });
    if (error) throw error;
    return ok({ id, role: b.role });
  } catch (e) { return toResponse(e); }
}
