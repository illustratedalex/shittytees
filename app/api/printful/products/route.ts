import { NextResponse } from 'next/server';
import { inspectPrintfulCatalog, buildPrintfulSyncPlan } from '@/lib/printful/import';

export async function GET() {
  const inspection = await inspectPrintfulCatalog();
  const plan = await buildPrintfulSyncPlan();

  return NextResponse.json({
    ...inspection,
    plan,
    mode: 'read-only',
  });
}
