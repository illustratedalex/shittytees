import { getPrintfulEnv } from '@/lib/printful/env';

export function checkoutIsEnabled(): boolean {
  if (process.env.VERCEL_ENV !== 'production') return true;
  const printful = getPrintfulEnv();
  return process.env.STORE_CHECKOUT_ENABLED === 'true'
    && printful.storeId === '18894982'
    && !!printful.apiToken
    && printful.enableFulfillment
    && /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY || '')
    && !!process.env.STRIPE_WEBHOOK_SECRET;
}
