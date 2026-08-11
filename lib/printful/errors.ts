export type PrintfulErrorOptions = {
  status?: number;
  code?: number;
  retryAfterMs?: number;
  cause?: unknown;
};

export class PrintfulError extends Error {
  status?: number;
  code?: number;
  retryAfterMs?: number;

  constructor(message: string, options: PrintfulErrorOptions = {}) {
    super(message);
    this.name = 'PrintfulError';
    this.status = options.status;
    this.code = options.code;
    this.retryAfterMs = options.retryAfterMs;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export function isRetryablePrintfulStatus(status?: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url;
  }
}
