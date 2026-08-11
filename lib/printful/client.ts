import crypto from 'crypto';
import { getPrintfulEnv } from './env';
import { PrintfulError, isRetryablePrintfulStatus } from './errors';
import { parseRetryAfter, withRetry } from './retry';

const API_BASE = 'https://api.printful.com';

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

function buildHeaders(initHeaders?: HeadersInit): Headers {
  const env = getPrintfulEnv();
  if (!env.apiToken || !env.storeId) {
    throw new PrintfulError('PRINTFUL_API_TOKEN and PRINTFUL_STORE_ID must be configured');
  }

  const headers = new Headers(initHeaders || {});
  headers.set('Authorization', `Bearer ${env.apiToken}`);
  headers.set('Content-Type', 'application/json');
  headers.set('X-PF-Store-Id', env.storeId);
  headers.set('X-Store-Id', env.storeId);
  return headers;
}

async function parseResponse<T>(endpoint: string, response: Response): Promise<PrintfulResponse<T>> {
  const payload = (await response.json()) as PrintfulResponse<T> | PrintfulErrorResponse;
  if (!response.ok) {
    const errorPayload = payload as PrintfulErrorResponse;
    const message =
      errorPayload.result?.error ||
      (errorPayload.result?.errors ? JSON.stringify(errorPayload.result.errors) : 'Unknown Printful error');
    throw new PrintfulError(`Printful API error (${response.status}) on ${endpoint}: ${message}`, {
      status: response.status,
      code: errorPayload.code,
      retryAfterMs: parseRetryAfter(response.headers.get('retry-after')),
    });
  }

  return payload as PrintfulResponse<T>;
}

export async function printfulRequest<T>(endpoint: string, options: RequestInit = {}): Promise<PrintfulResponse<T>> {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: buildHeaders(options.headers),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok && !isRetryablePrintfulStatus(response.status)) {
      return parseResponse<T>(endpoint, response);
    }

    return parseResponse<T>(endpoint, response);
  });
}

export function validatePrintfulWebhook(body: string, signature: string): boolean {
  const { webhookSecret } = getPrintfulEnv();

  if (!webhookSecret) {
    return false;
  }

  const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
