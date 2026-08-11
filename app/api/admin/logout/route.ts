import { NextRequest, NextResponse } from 'next/server';
import { getAdminCookie, getAdminSessionCookieOptions } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  const cookieName = await getAdminCookie();
  const response = NextResponse.redirect(new URL('/admin/login', request.url));

  response.cookies.set(cookieName, '', {
    ...getAdminSessionCookieOptions(process.env.NODE_ENV === 'production'),
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}