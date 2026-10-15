import { z } from 'zod';
import { ok, parse, requireUser, toResponse, uuid } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { sb, user } = await requireUser();
    const { data, error } = await sb.from('saved_providers').select('provider_id, created_at, healthcare_providers(id,name,category,city,address)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (e) { return toResponse(e); }
}
export async function POST(req: Request) {
  try {
    const { sb, user } = await requireUser();
    const { providerId } = await parse(z.object({ providerId: z.string() }).strict(), req);
    const { error } = await sb.from('saved_providers').upsert({ user_id: user.id, provider_id: uuid(providerId) }, { onConflict: 'user_id,provider_id', ignoreDuplicates: true });
    if (error) throw error;
    return ok({ providerId }, 201);
  } catch (e) { return toResponse(e); }
}
export async function DELETE(req: Request) {
  try {
    const { sb, user } = await requireUser();
    const id = uuid(new URL(req.url).searchParams.get('providerId') ?? '');
    const { error } = await sb.from('saved_providers').delete().eq('user_id', user.id).eq('provider_id', id);
    if (error) throw error;
    return ok({ providerId: id });
  } catch (e) { return toResponse(e); }
}
