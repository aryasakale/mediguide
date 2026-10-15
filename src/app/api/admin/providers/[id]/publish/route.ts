import { ok, requireAdmin, toResponse, uuid } from '@/lib/server/http';
// DB trigger re-checks: super_admin only, and verification_status must be 'verified'.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:publish');
    const { data, error } = await sb.from('healthcare_providers').update({ publication_status: 'published' }).eq('id', uuid(params.id)).select('id,publication_status').single();
    if (error) throw error;
    return ok(data);
  } catch (e) { return toResponse(e); }
}
