const API_BASE = 'https://api.printful.com';
const TOKEN = process.env.PRINTFUL_API_TOKEN;
const STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!TOKEN && process.env.NODE_ENV === 'production') {
  console.error('Missing PRINTFUL_API_TOKEN in environment');
}

if (!STORE_ID && process.env.NODE_ENV === 'production') {
  console.error('Missing PRINTFUL_STORE_ID in environment');
}

export interface PrintfulResponse<T> {
  code: number;
  result: T;
}

export interface PrintfulErrorResponse {
  code: number;
  result: {
    error?: string;
    errors?: Record<string, string[]>;
  };
}

export async function printfulRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PrintfulResponse<T>> {
  if (!TOKEN) {
    throw new Error('PRINTFUL_API_TOKEN not configured');
  }

  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Authorization', `Bearer ${TOKEN}`);
  headers.set('Content-Type', 'application/json');

  if (STORE_ID) {
    headers.set('X-Store-Id', STORE_ID);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    const data = (await response.json()) as PrintfulResponse<T> | PrintfulErrorResponse;

    if (!response.ok) {
      const errorData = data as PrintfulErrorResponse;
      const errorMessage =
        errorData.result?.error || JSON.stringify(errorData.result?.errors) || 'Unknown error';
      throw new Error(`Printful API error (${response.status}): ${errorMessage}`);
    }

    return data as PrintfulResponse<T>;
  } catch (error) {
    if (error instanceof TypeError && error.name === 'AbortError') {
      throw new Error('Printful API request timeout');
    }
    throw error;
  }
}

export function validatePrintfulWebhook(body: string, signature: string): boolean {
  const secret = process.env.PRINTFUL_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('PRINTFUL_WEBHOOK_SECRET not configured; webhook validation disabled');
    return true;
  }

  // Basic HMAC-SHA256 validation example
  // Note: Verify the exact implementation with Printful documentation
  try {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return hash === signature;
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return false;
  }
}
