import { NextResponse } from 'next/server';
import { getPrintfulEnv } from '@/lib/printful/env';

export const dynamic = 'force-dynamic';

function sanitize(value: string): string {
  return value
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]')
    .slice(0, 500);
}

async function callStores() {
  const env = getPrintfulEnv();

  if (!env.apiToken || !env.storeId) {
    return {
      status: 500,
      code: undefined,
      message: 'Printful Preview credentials are not fully configured',
      result: undefined,
    };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.apiToken}`,
  };

  const response = await fetch('https://api.printful.com/stores', {
    headers,
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as
    | { code?: number; result?: unknown }
    | null;

  if (!response.ok) {
    const result = payload?.result;
    const message =
      result &&
      typeof result === 'object' &&
      'error' in result &&
      typeof result.error === 'string'
        ? result.error
        : 'Unknown Printful error';

    return {
      status: response.status,
      code: payload?.code,
      message: sanitize(message),
      result: undefined,
    };
  }

  return {
    status: response.status,
    code: payload?.code,
    result: payload?.result,
  };
}

export async function GET() {
  const env = getPrintfulEnv();
  const stores = await callStores();

  const intendedStoreMatched =
    stores.status === 200 &&
    Array.isArray(stores.result) &&
    stores.result.some(
      (store: { id?: number }) => String(store.id) === env.storeId,
    );

  return NextResponse.json({
    storeAccess: {
      status: stores.status,
      code: stores.code,
      intendedStoreMatched,
      storeCount: Array.isArray(stores.result) ? stores.result.length : undefined,
    },
  });
}
