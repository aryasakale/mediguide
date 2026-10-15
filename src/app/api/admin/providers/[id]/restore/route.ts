import { ok, requireAdmin, toResponse, uuid, HttpError } from '@/lib/server/http';
// Moves an archived or published record to DRAFT (restore / unpublish; never straight to published). DB trigger: super_admin only.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:publish');
    const { data, error } = await sb.from('healthcare_providers').update({ publication_status: 'draft' }).eq('id', uuid(params.id)).in('publication_status', ['archived', 'published']).select('id,publication_status').maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Archived provider not found');
    return ok(data);
  } catch (e) { return toResponse(e); }
}
