import { NextResponse } from 'next/server';

// Placeholder endpoint for Printful product sync
export async function GET() {
  return NextResponse.json({
    message: 'Printful product sync endpoint',
    note: 'This would sync products from Printful catalog in production',
  });
}
