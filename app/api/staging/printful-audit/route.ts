import { NextResponse } from 'next/server';
import { runPrintfulMappingAudit } from '@/lib/printful/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const stagingOnly =
    process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'stripe-printful-migration-audit' &&
    process.env.VERCEL_GIT_REPO_OWNER === 'illustratedalex' &&
    process.env.VERCEL_GIT_REPO_SLUG === 'shittytees';

  if (!stagingOnly) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  try {
    const report = await runPrintfulMappingAudit();
    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Printful audit failed' }, { status: 500 });
  }
}
