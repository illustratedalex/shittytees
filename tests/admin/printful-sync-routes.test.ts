import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAdminSessionMock = vi.hoisted(() => vi.fn());
const syncPrintfulCatalogMock = vi.hoisted(() => vi.fn());
const getPrintfulEnvMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/admin/auth', () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock('@/lib/printful/catalogSync', () => ({
  syncPrintfulCatalog: syncPrintfulCatalogMock,
}));

vi.mock('@/lib/printful/env', () => ({
  getPrintfulEnv: getPrintfulEnvMock,
}));

function makePostRequest(url: string, headers?: HeadersInit): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers,
  });
}

function makeGetRequest(url: string, headers?: HeadersInit): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
    headers,
  });
}

describe('manual admin printful sync route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows authenticated admin manual sync and redirects with success state', async () => {
    requireAdminSessionMock.mockResolvedValueOnce(undefined);
    syncPrintfulCatalogMock.mockResolvedValueOnce({ checked: 1, created: 0, updated: 0, unchanged: 1, failed: 0, errors: [] });

    const { POST } = await import('@/app/api/admin/printful/sync/route');
    const response = await POST(makePostRequest('https://shittytees.com/api/admin/printful/sync'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://shittytees.com/admin/printful?sync=success');
    expect(syncPrintfulCatalogMock).toHaveBeenCalledTimes(1);
  });

  it('redirects unauthenticated requests to login', async () => {
    requireAdminSessionMock.mockRejectedValueOnce(new Error('Not authenticated'));

    const { POST } = await import('@/app/api/admin/printful/sync/route');
    const response = await POST(makePostRequest('https://shittytees.com/api/admin/printful/sync'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://shittytees.com/admin/login');
    expect(syncPrintfulCatalogMock).not.toHaveBeenCalled();
  });

  it('returns admin-safe error redirect on upstream sync failure', async () => {
    requireAdminSessionMock.mockResolvedValueOnce(undefined);
    syncPrintfulCatalogMock.mockRejectedValueOnce(new Error('printful unavailable'));

    const { POST } = await import('@/app/api/admin/printful/sync/route');
    const response = await POST(makePostRequest('https://shittytees.com/api/admin/printful/sync'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://shittytees.com/admin/printful?sync=error');
  });
});

describe('api printful sync route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPrintfulEnvMock.mockReturnValue({ syncSecret: 'sync-secret-token' });
  });

  it('accepts authenticated admin session requests without cron secret', async () => {
    requireAdminSessionMock.mockResolvedValueOnce(undefined);
    syncPrintfulCatalogMock.mockResolvedValueOnce({ checked: 2, created: 0, updated: 1, unchanged: 1, failed: 0, errors: [] });

    const { POST } = await import('@/app/api/printful/sync/route');
    const response = await POST(makePostRequest('https://shittytees.com/api/printful/sync'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ updated: 1 });
  });

  it('rejects requests when both admin session and secret auth are missing', async () => {
    requireAdminSessionMock.mockRejectedValueOnce(new Error('Not authenticated'));

    const { POST } = await import('@/app/api/printful/sync/route');
    const response = await POST(makePostRequest('https://shittytees.com/api/printful/sync'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Unauthorized' });
  });
});

describe('cron printful sync route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPrintfulEnvMock.mockReturnValue({ syncSecret: 'sync-secret-token' });
  });

  it('allows cron secret requests', async () => {
    syncPrintfulCatalogMock.mockResolvedValueOnce({ checked: 1, created: 0, updated: 0, unchanged: 1, failed: 0, errors: [] });

    const { GET } = await import('@/app/api/cron/printful-sync/route');
    const response = await GET(makeGetRequest('https://shittytees.com/api/cron/printful-sync', {
      authorization: 'Bearer sync-secret-token',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it('rejects missing or wrong cron secret', async () => {
    const { GET } = await import('@/app/api/cron/printful-sync/route');

    const missingSecretResponse = await GET(makeGetRequest('https://shittytees.com/api/cron/printful-sync'));
    expect(missingSecretResponse.status).toBe(401);

    const wrongSecretResponse = await GET(makeGetRequest('https://shittytees.com/api/cron/printful-sync', {
      authorization: 'Bearer wrong-token',
    }));
    expect(wrongSecretResponse.status).toBe(401);
  });
});