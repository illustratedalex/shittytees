import { NextRequest, NextResponse } from 'next/server';
import { getPrintfulEnv } from '@/lib/printful/env';
import { syncPrintfulCatalog } from '@/lib/printful/catalogSync';

export async function GET(request: NextRequest) {
  const env = getPrintfulEnv();
  const expected = env.syncSecret;
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncPrintfulCatalog();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync failure';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
