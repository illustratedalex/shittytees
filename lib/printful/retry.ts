import { isRetryablePrintfulStatus } from './errors';

export type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const maxDelayMs = options.maxDelayMs ?? 4000;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = typeof error === 'object' && error !== null ? (error as { status?: number }).status : undefined;
      const retryAfterMs = typeof error === 'object' && error !== null ? (error as { retryAfterMs?: number }).retryAfterMs : undefined;
      const shouldRetry = isRetryablePrintfulStatus(status);

      if (!shouldRetry || attempt === attempts) {
        throw error;
      }

      const delayMs = retryAfterMs ?? Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry failed');
}

export function parseRetryAfter(headerValue?: string | null): number | undefined {
  if (!headerValue) return undefined;
  const numericSeconds = Number(headerValue);
  if (!Number.isNaN(numericSeconds)) {
    return Math.max(0, numericSeconds * 1000);
  }

  const parsedDate = Date.parse(headerValue);
  if (Number.isNaN(parsedDate)) return undefined;
  return Math.max(0, parsedDate - Date.now());
}
