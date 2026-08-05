import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMode, assertAdminPostRequest, createAdminSessionCookieValue, getAdminCookie } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  if (adminAuthMode() !== 'dev') {
    return NextResponse.json({ error: 'Admin login unavailable in this environment' }, { status: 503 });
  }

  try {
    assertAdminPostRequest(request);
  } catch {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const { token } = (await request.json()) as { token?: string };
  const expected = process.env.ADMIN_DEV_TOKEN;
  if (!token || !expected || token !== expected) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const cookieName = await getAdminCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, createAdminSessionCookieValue(expected), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
