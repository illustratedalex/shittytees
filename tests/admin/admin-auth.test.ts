import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { authenticateAdminLogin, createAdminSessionCookieValue, verifyAdminSessionValue } from '@/lib/admin/auth';

function setProductionAuthEnv(password: string) {
  vi.stubEnv('ADMIN_EMAIL', 'owner@shittytees.com');
  vi.stubEnv('ADMIN_PASSWORD_HASH', bcrypt.hashSync(password, 10));
  vi.stubEnv('ADMIN_SESSION_SECRET', 'production-session-secret');
  vi.stubEnv('NODE_ENV', 'production');
  delete process.env.ADMIN_DEV_TOKEN;
}

function resetEnv() {
  vi.unstubAllEnvs();
}

function adminRequest(path: string, body: Record<string, unknown>) {
  return new NextRequest(`https://shittytees.com${path}`, {
    method: 'POST',
    headers: {
      origin: 'https://shittytees.com',
      host: 'shittytees.com',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('admin auth routes', () => {
  beforeEach(() => {
    vi.resetModules();
    resetEnv();
  });

  it('accepts a valid production login and sets secure cookie attributes', async () => {
    setProductionAuthEnv('correct horse battery staple');
    const { POST } = await import('@/app/api/admin/session/route');

    const response = await POST(adminRequest('/api/admin/session', {
      email: 'owner@shittytees.com',
      password: 'correct horse battery staple',
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('shittytees_admin_session=');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Secure');
    expect(response.headers.get('set-cookie')?.toLowerCase()).toContain('samesite=lax');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=28800');
  });

  it('rejects an invalid email with a generic login error', async () => {
    setProductionAuthEnv('correct horse battery staple');
    const { POST } = await import('@/app/api/admin/session/route');

    const response = await POST(adminRequest('/api/admin/session', {
      email: 'wrong@shittytees.com',
      password: 'correct horse battery staple',
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Invalid email or password' });
  });

  it('rejects an invalid password with the same generic login error', async () => {
    setProductionAuthEnv('correct horse battery staple');
    const { POST } = await import('@/app/api/admin/session/route');

    const response = await POST(adminRequest('/api/admin/session', {
      email: 'owner@shittytees.com',
      password: 'wrong password',
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Invalid email or password' });
  });

  it('rate limits repeated failed logins', async () => {
    setProductionAuthEnv('correct horse battery staple');
    const { POST } = await import('@/app/api/admin/session/route');

    let response = null as Awaited<ReturnType<typeof POST>> | null;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      response = await POST(adminRequest('/api/admin/session', {
        email: 'limit@shittytees.com',
        password: `wrong-${attempt}`,
      }));
    }

    expect(response?.status).toBe(429);
  });

  it('clears the session on logout and redirects back to login', async () => {
    const { POST } = await import('@/app/api/admin/logout/route');

    const response = await POST(new NextRequest('https://shittytees.com/api/admin/logout', {
      method: 'POST',
      headers: {
        host: 'shittytees.com',
      },
    }));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://shittytees.com/admin/login');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
});

describe('admin auth helpers', () => {
  beforeEach(() => {
    resetEnv();
  });

  it('retains development auth fallback when only the dev token is configured', async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_DEV_TOKEN = 'dev-only-token';
    vi.stubEnv('NODE_ENV', 'test');

    await expect(authenticateAdminLogin('anything@example.com', 'dev-only-token')).resolves.toBe('development');

    const cookieValue = createAdminSessionCookieValue('anything@example.com', 'development');
    expect(verifyAdminSessionValue(cookieValue)).toBe(true);
  });
});