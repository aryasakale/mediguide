import { NextResponse } from 'next/server';
import { ZodError, type ZodTypeAny, type z } from 'zod';
import { userClient, ConfigError } from './supabase';
import { can, type AdminRole, type Perm } from './permissions';

export const ok = (data: unknown, status = 200) => NextResponse.json({ data }, { status });
export const fail = (status: number, message: string, details?: unknown) => NextResponse.json({ error: { message, details } }, { status });
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

/** Maps Postgres/RLS errors to safe HTTP responses (no SQL internals leaked). */
export function toResponse(e: unknown) {
  if (e instanceof HttpError) return fail(e.status, e.message);
  if (e instanceof ZodError) return fail(400, 'Invalid input', e.flatten().fieldErrors);
  if (e instanceof ConfigError) return fail(503, e.message);
  const c = (e as { code?: string })?.code, m = (e as { message?: string })?.message ?? '';
  if (c === '42501') return fail(403, m.includes('row-level') ? 'Not permitted' : m);
  if (c === '23514' || c === '22023') return fail(409, m);
  if (c === '23505') return fail(409, 'Already exists');
  if (c === 'P0002' || c === 'PGRST116') return fail(404, 'Not found');
  console.error('[api]', c, m);
  return fail(500, 'Something went wrong. Please try again.');
}
export async function parse<T extends ZodTypeAny>(schema: T, req: Request): Promise<z.infer<T>> {
  const text = await req.text();
  if (text.length > 20_000) throw new HttpError(413, 'Request too large');
  let body: unknown; try { body = text ? JSON.parse(text) : {}; } catch { throw new HttpError(400, 'Invalid JSON'); }
  return schema.parse(body);
}
/** Verifies the session server-side (getUser validates the JWT with Supabase) and the active admin role + permission from the DB. */
export async function requireAdmin(perm: Perm) {
  const sb = userClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new HttpError(401, 'Sign in required');
  const { data } = await sb.from('admin_users').select('role, active').eq('user_id', user.id).maybeSingle();
  const role = data?.active ? (data.role as AdminRole) : null;
  if (!role || !can(role, perm)) throw new HttpError(403, 'Not permitted');
  return { sb, user, role };
}
export async function requireUser() {
  const sb = userClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new HttpError(401, 'Sign in required');
  return { sb, user };
}
// Small in-memory limiter (per server instance). Use Redis/Upstash for multi-instance production.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now(), arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) throw new HttpError(429, 'Too many requests. Please wait a moment.');
  arr.push(now); hits.set(key, arr);
}
export const uuid = (v: string) => { if (!/^[0-9a-f-]{36}$/i.test(v)) throw new HttpError(400, 'Invalid id'); return v; };
