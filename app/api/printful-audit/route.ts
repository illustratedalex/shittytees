import { NextResponse } from 'next/server';
import { runAudit } from '@/scripts/audit-printful-mappings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await runAudit(), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/Bearer\\s+[^\\s]+/gi, 'Bearer [REDACTED]').replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]').slice(0, 500) : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
