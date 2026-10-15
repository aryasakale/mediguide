import { ok, requireAdmin, toResponse } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { sb } = await requireAdmin('dashboard:read');
    const cnt = async (f: (q: any) => any) => { const { count, error } = await f(sb.from('healthcare_providers').select('id', { count: 'exact', head: true })); if (error) throw error; return count ?? 0; }; // eslint-disable-line @typescript-eslint/no-explicit-any
    const [total, hospitals, clinics, draft, pending, verified, rejected] = await Promise.all([
      cnt((q) => q), cnt((q) => q.eq('publication_status', 'published').eq('category', 'Hospital')), cnt((q) => q.eq('publication_status', 'published').eq('category', 'Clinic')),
      cnt((q) => q.eq('publication_status', 'draft')), cnt((q) => q.not('submitted_at', 'is', null).in('verification_status', ['pending', 'under_review'])),
      cnt((q) => q.eq('verification_status', 'verified')), cnt((q) => q.eq('verification_status', 'rejected')),
    ]);
    const { data: recent } = await sb.from('healthcare_providers').select('id,name,category,city,publication_status,verification_status,updated_at').order('updated_at', { ascending: false }).limit(6);
    const { data: logs } = await sb.from('admin_activity_logs').select('id,action,entity_type,created_at').order('created_at', { ascending: false }).limit(6); // empty unless super_admin (RLS)
    return ok({ total, publishedHospitals: hospitals, publishedClinics: clinics, draft, pendingVerification: pending, verified, rejected, recent: recent ?? [], recentActions: logs ?? [] });
  } catch (e) { return toResponse(e); }
}
