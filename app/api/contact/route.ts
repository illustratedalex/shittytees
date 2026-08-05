import { NextRequest, NextResponse } from 'next/server';
import { ContactFormSchema } from '@/lib/validation/schemas';

// Simple in-memory rate limiting for development
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(ip);

  if (!limit || now > limit.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }

  if (limit.count >= 5) {
    // Max 5 requests per hour
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = ContactFormSchema.parse(body);

    // In production, send email via service (SendGrid, Resend, etc.)
    console.log('Contact form submission:', {
      name: validated.name,
      email: validated.email,
      subject: validated.subject,
      timestamp: new Date().toISOString(),
    });

    // Don't log the full message to console for privacy
    return NextResponse.json(
      { message: 'Thank you for your message. We will respond soon.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
