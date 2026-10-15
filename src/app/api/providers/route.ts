import { z } from 'zod';
import { ok, toResponse } from '@/lib/server/http';
import { userClient } from '@/lib/server/supabase';
export const dynamic = 'force-dynamic';
const Q = z.object({
  q: z.string().trim().max(80).optional(), city: z.string().trim().max(80).optional(), category: z.enum(['Hospital', 'Clinic', 'Doctor', 'Pharmacy']).optional(),
  specialty: z.string().trim().max(60).optional(), verified: z.enum(['true']).optional(),
  sort: z.enum(['name', 'newest']).default('name'), page: z.coerce.number().int().min(1).default(1), size: z.coerce.number().int().min(1).max(50).default(20),
});
/** Public search. RLS guarantees only published rows are visible, even to anonymous callers. */
export async function GET(req: Request) {
  try {
    const p = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
    let q = userClient().from('healthcare_providers').select('id,name,category,address,city,state,phone,specialties,services,languages,hours,open24h,emergency,latitude,longitude,verified', { count: 'exact' });
    if (p.q) { const s = p.q.replace(/[%,()]/g, ' '); q = q.or(`name.ilike.%${s}%,address.ilike.%${s}%,city.ilike.%${s}%`); }
    if (p.city) q = q.ilike('city', p.city.replace(/[%,]/g, ''));
    if (p.category) q = q.eq('category', p.category);
    if (p.specialty) q = q.contains('specialties', [p.specialty]);
    if (p.verified) q = q.eq('verified', true);
    q = p.sort === 'newest' ? q.order('created_at', { ascending: false }) : q.order('name');
    const { data, count, error } = await q.range((p.page - 1) * p.size, p.page * p.size - 1);
    if (error) throw error;
    return ok({ items: data, total: count ?? 0, page: p.page, size: p.size });
  } catch (e) { return toResponse(e); }
}
