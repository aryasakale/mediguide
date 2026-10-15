import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Server-side guard for /admin/*: signed-in user with an ACTIVE row in admin_users (RLS lets a user read only their own row). Fails closed. */
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next();
  const deny = () => NextResponse.redirect(new URL('/admin/login', req.url));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return deny();
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(url, key, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: (c: { name: string; value: string; options: CookieOptions }[]) => { res = NextResponse.next({ request: req }); c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); } },
  });
  const { data } = await sb.auth.getUser();
  if (!data.user) return deny();
  const { data: row } = await sb.from('admin_users').select('active').eq('user_id', data.user.id).maybeSingle();
  return row?.active ? res : deny();
}
export const config = { matcher: ['/admin/:path*'] };
