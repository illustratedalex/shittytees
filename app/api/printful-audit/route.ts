import { NextResponse } from 'next/server';
import { getPrintfulEnv } from '@/lib/printful/env';
export const dynamic = 'force-dynamic';
function sanitize(value: string): string {
  return value.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]').replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]').slice(0, 500);
}
async function request(path: string) {
  const env = getPrintfulEnv();
  if (!env.apiToken || !env.storeId) throw new Error('Printful credentials are not configured');
  const response = await fetch('https://api.printful.com' + path, { headers: { Authorization: 'Bearer ' + env.apiToken, 'X-PF-Store-Id': env.storeId, 'X-Store-Id': env.storeId }, cache: 'no-store' });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const result = payload?.result;
    const message = typeof result?.error === 'string' ? result.error : typeof result === 'string' ? result : 'Unknown Printful error';
    return { ok: false, status: response.status, code: payload?.code, message: sanitize(message) };
  }
  return { ok: true, status: response.status, payload };
}
export async function GET() {
  const stores = await request('/stores');
  if (!stores.ok) return NextResponse.json({ storeAccess: stores }, { status: 502 });
  const env = getPrintfulEnv();
  const matched = Array.isArray(stores.payload?.result) && stores.payload.result.some((s: { id?: number }) => String(s.id) === env.storeId);
  const products = await request('/store/products?status=all');
  if (!products.ok) return NextResponse.json({ storeAccess: { ok: true, intendedStoreMatched: matched }, products }, { status: 502 });
  return NextResponse.json({ storeAccess: { ok: true, intendedStoreMatched: matched }, products: { ok: true, status: products.status, code: products.payload?.code, count: Array.isArray(products.payload?.result) ? products.payload.result.length : 0, paging: products.payload?.paging } });
}