import { z } from 'zod';
import { ok, parse, requireAdmin, toResponse, uuid, HttpError } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
const Reg = z.object({ kind: z.enum(['image', 'document']), path: z.string().min(3).max(300), label: z.string().trim().max(120).optional() }).strict();
const IMG = ['image/jpeg', 'image/png', 'image/webp'], DOC = ['application/pdf', 'image/jpeg', 'image/png'];
/** List media; documents come back as short-lived signed URLs (private bucket). */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:read');
    const { data, error } = await sb.from('provider_media').select('*').eq('provider_id', uuid(params.id)).order('created_at');
    if (error) throw error;
    const items = await Promise.all((data ?? []).map(async (m) => {
      if (m.kind === 'document') { const s = await sb.storage.from(m.bucket).createSignedUrl(m.path, 300); return { ...m, url: s.data?.signedUrl ?? null }; }
      return { ...m, url: sb.storage.from(m.bucket).getPublicUrl(m.path).data.publicUrl };
    }));
    return ok(items);
  } catch (e) { return toResponse(e); }
}
/** Register a file the browser already uploaded to storage (storage RLS gates the upload itself). Verifies the object exists. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sb, user } = await requireAdmin('providers:write');
    const id = uuid(params.id), b = await parse(Reg, req), bucket = b.kind === 'image' ? 'provider-media' : 'provider-docs';
    if (!b.path.startsWith(`${id}/`) || b.path.includes('..')) throw new HttpError(400, 'Invalid path');
    const dir = b.path.split('/').slice(0, -1).join('/'), file = b.path.split('/').pop()!;
    const { data: found } = await sb.storage.from(bucket).list(dir, { search: file });
    const obj = found?.find((f) => f.name === file);
    if (!obj) throw new HttpError(400, 'File was not uploaded');
    const mime = (obj.metadata as { mimetype?: string } | null)?.mimetype ?? '';
    if (!(b.kind === 'image' ? IMG : DOC).includes(mime)) throw new HttpError(415, 'Unsupported file type');
    const { data, error } = await sb.from('provider_media').insert({ provider_id: id, bucket, path: b.path, kind: b.kind, label: b.label ?? null, created_by: user.id }).select('*').single();
    if (error) throw error;
    return ok(data, 201);
  } catch (e) { return toResponse(e); }
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sb } = await requireAdmin('providers:write');
    const mid = uuid(new URL(req.url).searchParams.get('mediaId') ?? '');
    const { data: m } = await sb.from('provider_media').select('bucket,path').eq('id', mid).eq('provider_id', uuid(params.id)).maybeSingle();
    if (!m) throw new HttpError(404, 'Not found');
    await sb.storage.from(m.bucket).remove([m.path]);
    const { error } = await sb.from('provider_media').delete().eq('id', mid);
    if (error) throw error;
    return ok({ id: mid });
  } catch (e) { return toResponse(e); }
}
