import { getPrintfulEnv } from '@/lib/printful/env';

function sanitize(message: string): string {
  return message
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]')
    .slice(0, 500);
}

async function main() {
  const env = getPrintfulEnv();

  if (!env.apiToken || !env.storeId) {
    console.log(JSON.stringify({
      status: 500,
      code: null,
      message: 'Printful Preview credentials are not fully configured',
      intendedStoreMatched: false,
    }));
    return;
  }

  const response = await fetch('https://api.printful.com/stores', {
    headers: { Authorization: `Bearer ${env.apiToken}` },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as {
    code?: number;
    result?: unknown;
  } | null;

  if (!response.ok) {
    const result = payload?.result;
    const rawMessage =
      result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
        ? result.error
        : 'Unknown Printful error';

    console.log(JSON.stringify({
      status: response.status,
      code: payload?.code ?? null,
      message: sanitize(rawMessage),
      intendedStoreMatched: false,
    }));
    return;
  }

  const intendedStoreMatched =
    Array.isArray(payload?.result) &&
    payload.result.some((store: { id?: number }) => String(store.id) === env.storeId);

  console.log(JSON.stringify({
    status: response.status,
    code: payload?.code ?? null,
    message: 'OK',
    intendedStoreMatched,
  }));
}

main().catch((error) => {
  console.log(JSON.stringify({
    status: 0,
    code: null,
    message: sanitize(error instanceof Error ? error.message : 'Unknown Printful error'),
    intendedStoreMatched: false,
  }));
  process.exitCode = 1;
});
