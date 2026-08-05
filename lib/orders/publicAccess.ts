import crypto from 'crypto';

export function generatePublicAccessToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashPublicAccessToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function constantTimeTokenEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyPublicAccessToken(token: string, expectedHash: string): boolean {
  const incomingHash = hashPublicAccessToken(token);
  return constantTimeTokenEqual(incomingHash, expectedHash);
}
