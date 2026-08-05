import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'shittytees_admin_session';

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function adminDevToken(): string | null {
  return process.env.ADMIN_DEV_TOKEN || null;
}

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dev-only-session-secret';
}

function signSession(token: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(token).digest('hex');
}

function isDevAdminAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function adminAuthMode(): 'disabled' | 'dev' {
  if (!isDevAdminAllowed() || !adminDevToken()) {
    return 'disabled';
  }
  return 'dev';
}

export function assertAdminPostRequest(request: NextRequest): void {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) {
    throw new Error('Missing origin/host');
  }

  const originHost = new URL(origin).host;
  if (originHost !== host) {
    throw new Error('Invalid origin');
  }
}

export function createAdminSessionCookieValue(token: string): string {
  return signSession(token);
}

export function verifyAdminSessionValue(value: string): boolean {
  const token = adminDevToken();
  if (!token) return false;
  return safeEqual(value, signSession(token));
}

export async function requireAdminSession(): Promise<void> {
  if (adminAuthMode() !== 'dev') {
    throw new Error('Real admin authentication is required in production');
  }

  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value || !verifyAdminSessionValue(value)) {
    throw new Error('Not authenticated');
  }
}

export async function getAdminCookie() {
  return ADMIN_COOKIE;
}

export async function getClientIpKey(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for') || h.get('x-real-ip') || 'local';
}
