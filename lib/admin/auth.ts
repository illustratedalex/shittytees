import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'shittytees_admin_session';
const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export type AdminAuthMode = 'production' | 'development' | 'disabled';
export type AdminSessionKind = 'production' | 'development';

type AdminSessionPayload = {
  email: string;
  kind: AdminSessionKind;
  issuedAt: number;
  expiresAt: number;
};

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function adminDevToken(): string | null {
  return process.env.ADMIN_DEV_TOKEN?.trim() || null;
}

function adminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

function adminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

function configuredSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET?.trim() || null;
}

function sessionSecret(): string {
  return configuredSessionSecret() || 'dev-only-session-secret';
}

function hasProductionCredentials(): boolean {
  return Boolean(adminEmail() && adminPasswordHash() && configuredSessionSecret());
}

function hasDevelopmentCredentials(): boolean {
  return Boolean(adminDevToken());
}

function sessionPayloadToBody(payload: AdminSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function signSessionBody(body: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

function encodeSessionPayload(payload: AdminSessionPayload): string {
  const body = sessionPayloadToBody(payload);
  return `${body}.${signSessionBody(body)}`;
}

function decodeSessionPayload(value: string): AdminSessionPayload | null {
  const separatorIndex = value.lastIndexOf('.');
  if (separatorIndex <= 0) return null;

  const body = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  if (!safeEqual(signature, signSessionBody(body))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminSessionPayload;
    if (
      !payload ||
      typeof payload.email !== 'string' ||
      typeof payload.kind !== 'string' ||
      typeof payload.issuedAt !== 'number' ||
      typeof payload.expiresAt !== 'number'
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function isPayloadActive(payload: AdminSessionPayload): boolean {
  if (payload.expiresAt <= Date.now()) {
    return false;
  }

  if (payload.kind === 'production') {
    return hasProductionCredentials() && normalizeEmail(payload.email) === (adminEmail() || '');
  }

  return payload.kind === 'development' && hasDevelopmentCredentials();
}

export function adminAuthMode(): AdminAuthMode {
  if (process.env.NODE_ENV === 'production') {
    return hasProductionCredentials() ? 'production' : 'disabled';
  }

  if (hasProductionCredentials()) {
    return 'production';
  }

  if (hasDevelopmentCredentials()) {
    return 'development';
  }

  return 'disabled';
}

export function getAdminLandingPath(): string {
  return '/admin/printful';
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

export function createAdminSessionCookieValue(email: string, kind: AdminSessionKind = 'production'): string {
  const normalizedEmail = normalizeEmail(email);
  const issuedAt = Date.now();
  return encodeSessionPayload({
    email: normalizedEmail,
    kind,
    issuedAt,
    expiresAt: issuedAt + ADMIN_SESSION_DURATION_MS,
  });
}

export function verifyAdminSessionValue(value: string): boolean {
  const payload = decodeSessionPayload(value);
  if (!payload) return false;
  return isPayloadActive(payload);
}

export async function authenticateAdminLogin(email: string, password: string): Promise<AdminSessionKind | null> {
  const trimmedEmail = normalizeEmail(email);
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return null;
  }

  const mode = adminAuthMode();
  if (mode === 'production') {
    const configuredEmail = adminEmail();
    const hash = adminPasswordHash();
    if (!configuredEmail || !hash || trimmedEmail !== configuredEmail) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(trimmedPassword, hash);
    return passwordMatches ? 'production' : null;
  }

  if (mode === 'development') {
    const token = adminDevToken();
    if (!token) return null;
    return safeEqual(trimmedPassword, token) ? 'development' : null;
  }

  return null;
}

export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return Boolean(value && verifyAdminSessionValue(value));
}

export async function requireAdminSession(): Promise<void> {
  if (!(await hasAdminSession())) {
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

export function getAdminSessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: ADMIN_SESSION_DURATION_MS / 1000,
  };
}