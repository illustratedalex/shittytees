import { NextResponse } from 'next/server';
import { runAudit } from '@/scripts/audit-printful-mappings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await runAudit());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message.slice(0, 500) }, { status: 502 });
  }
}
