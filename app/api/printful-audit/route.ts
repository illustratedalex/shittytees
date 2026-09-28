import { NextResponse } from 'next/server';
import { diagnosticFromError, runAudit } from '@/scripts/audit-printful-mappings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await runAudit());
  } catch (error) {
    return NextResponse.json({ printfulError: diagnosticFromError(error) }, { status: 502 });
  }
}
