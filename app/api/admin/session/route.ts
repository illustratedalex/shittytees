import { NextRequest, NextResponse } from 'next/server';
import {
  adminAuthMode,
  assertAdminPostRequest,
  authenticateAdminLogin,
  createAdminSessionCookieValue,
  getAdminCookie,
  getAdminSessionCookieOptions,
} from '@/lib/admin/auth';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

type AttemptRecord = {
  count: number;
  resetAt: number;
};

const loginAttempts = new Map<string, AttemptRecord>();

function requestRateLimitKey(request: NextRequest, email: string): string {
  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local').split(',')[0].trim().toLowerCase();
  return `${ip}:${email.trim().toLowerCase()}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current) {
    return false;
  }

  if (current.resetAt <= now) {
    loginAttempts.delete(key);
    return false;
  }

  return current.count >= MAX_LOGIN_ATTEMPTS;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }

  loginAttempts.set(key, { count: current.count + 1, resetAt: current.resetAt });
}

function clearFailures(key: string): void {
  loginAttempts.delete(key);
}

export async function POST(request: NextRequest) {
  try {
    assertAdminPostRequest(request);
  } catch {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 403 });
  }

  if (adminAuthMode() === 'disabled') {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 503 });
  }

  const { email, password } = (await request.json()) as { email?: string; password?: string };
  const submittedEmail = String(email || '').trim();
  const submittedPassword = String(password || '').trim();
  const rateLimitKey = requestRateLimitKey(request, submittedEmail);

  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 429 });
  }

  const sessionKind = await authenticateAdminLogin(submittedEmail, submittedPassword);
  if (!sessionKind) {
    recordFailure(rateLimitKey);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  clearFailures(rateLimitKey);

  const cookieName = await getAdminCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, createAdminSessionCookieValue(submittedEmail, sessionKind), getAdminSessionCookieOptions(process.env.NODE_ENV === 'production'));
  return response;
}
