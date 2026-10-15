import { ok, toResponse, uuid, HttpError } from '@/lib/server/http';
import { userClient } from '@/lib/server/supabase';
export const dynamic = 'force-dynamic';
/** Public detail. RLS only returns published rows to non-admins. */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const sb = userClient(), id = uuid(params.id);
    const { data, error } = await sb.from('healthcare_providers').select('id,name,category,address,city,state,postal_code,phone,specialties,services,languages,hours,open24h,emergency,latitude,longitude,verified').eq('id', id).eq('publication_status', 'published').maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Not found');
    const { data: media } = await sb.from('provider_media').select('path,label').eq('provider_id', id).eq('kind', 'image');
    return ok({ ...data, images: (media ?? []).map((m) => ({ url: sb.storage.from('provider-media').getPublicUrl(m.path).data.publicUrl, label: m.label })) });
  } catch (e) { return toResponse(e); }
}
