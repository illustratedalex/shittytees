import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/auth';
import { getPrintfulEnv } from '@/lib/printful/env';
import { syncPrintfulCatalog } from '@/lib/printful/catalogSync';

function hasSecretAccess(request: NextRequest): boolean {
  const env = getPrintfulEnv();
  if (!env.syncSecret) return false;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  return token.length > 0 && token === env.syncSecret;
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (hasSecretAccess(request)) {
    return true;
  }

  try {
    await requireAdminSession();
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncPrintfulCatalog();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync failure';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
