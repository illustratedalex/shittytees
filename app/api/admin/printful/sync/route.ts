import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/auth';
import { syncPrintfulCatalog } from '@/lib/printful/catalogSync';

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await syncPrintfulCatalog();
    return NextResponse.redirect(new URL('/admin/printful?sync=success', request.url));
  } catch {
    return NextResponse.redirect(new URL('/admin/printful?sync=error', request.url));
  }
}