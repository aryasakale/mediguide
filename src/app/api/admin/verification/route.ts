import { ok, requireAdmin, toResponse } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { sb } = await requireAdmin('providers:read');
    const { data, error } = await sb.from('healthcare_providers').select('id,name,category,address,city,state,phone,latitude,longitude,verification_status,submitted_at,review_notes,created_by')
      .not('submitted_at', 'is', null).in('verification_status', ['pending', 'under_review']).order('submitted_at').limit(100);
    if (error) throw error;
    return ok(data);
  } catch (e) { return toResponse(e); }
}
