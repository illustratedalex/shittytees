import { z } from 'zod';

const rawEnvSchema = z.object({
  PRINTFUL_API_TOKEN: z.string().optional(),
  PRINTFUL_STORE_ID: z.string().optional(),
  PRINTFUL_WEBHOOK_SECRET: z.string().optional(),
  PRINTFUL_SYNC_SECRET: z.string().optional(),
  PRINTFUL_ENABLE_TEST_ORDERS: z.string().optional(),
  PRINTFUL_ENABLE_FULFILLMENT: z.string().optional(),
});

export type PrintfulEnv = {
  apiToken?: string;
  storeId?: string;
  webhookSecret?: string;
  syncSecret?: string;
  enableTestOrders: boolean;
  enableFulfillment: boolean;
};

function parseBoolean(value?: string): boolean {
  return value === 'true' || value === '1';
}

export function getPrintfulEnv(): PrintfulEnv {
  const parsed = rawEnvSchema.parse(process.env);
  return {
    apiToken: parsed.PRINTFUL_API_TOKEN || undefined,
    storeId: parsed.PRINTFUL_STORE_ID || undefined,
    webhookSecret: parsed.PRINTFUL_WEBHOOK_SECRET || undefined,
    syncSecret: parsed.PRINTFUL_SYNC_SECRET || undefined,
    enableTestOrders: parseBoolean(parsed.PRINTFUL_ENABLE_TEST_ORDERS),
    enableFulfillment: parseBoolean(parsed.PRINTFUL_ENABLE_FULFILLMENT),
  };
}

export function hasPrintfulCredentials(): boolean {
  const env = getPrintfulEnv();
  return Boolean(env.apiToken && env.storeId);
}

export function requirePrintfulCredentials(context: string): Required<Pick<PrintfulEnv, 'apiToken' | 'storeId'>> & PrintfulEnv {
  const env = getPrintfulEnv();
  if (!env.apiToken || !env.storeId) {
    throw new Error(`Printful credentials are required for ${context}`);
  }

  return {
    ...env,
    apiToken: env.apiToken,
    storeId: env.storeId,
  };
}

export function requirePrintfulSyncSecret(context: string): string {
  const env = getPrintfulEnv();
  if (!env.syncSecret) {
    throw new Error(`PRINTFUL_SYNC_SECRET is required for ${context}`);
  }
  return env.syncSecret;
}

export function redactPrintfulToken(token?: string): string {
  if (!token) return '[missing]';
  if (token.length <= 8) return '[redacted]';
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}
