import {afterEach,describe,expect,it,vi} from 'vitest';
import {checkoutIsEnabled} from '@/lib/stripe/readiness';
afterEach(()=>vi.unstubAllEnvs());
describe('production checkout launch gate',()=>{
 it('rejects payments while fulfillment or the explicit launch switch is off',()=>{
  vi.stubEnv('VERCEL_ENV','production');vi.stubEnv('PRINTFUL_STORE_ID','18894982');vi.stubEnv('PRINTFUL_API_TOK','example');vi.stubEnv('STRIPE_SECRET_KEY','rk_live_example');vi.stubEnv('STRIPE_WEBHOOK_SECRET','example');vi.stubEnv('PRINTFUL_ENABLE_FULFILLMENT','true');vi.stubEnv('STORE_CHECKOUT_ENABLED','false');
  expect(checkoutIsEnabled()).toBe(false);
  vi.stubEnv('STORE_CHECKOUT_ENABLED','true');expect(checkoutIsEnabled()).toBe(true);
  vi.stubEnv('PRINTFUL_ENABLE_FULFILLMENT','false');expect(checkoutIsEnabled()).toBe(false);
 });
 it('rejects Square store routing and test credentials in Production',()=>{
  vi.stubEnv('VERCEL_ENV','production');vi.stubEnv('STORE_CHECKOUT_ENABLED','true');vi.stubEnv('PRINTFUL_ENABLE_FULFILLMENT','true');vi.stubEnv('PRINTFUL_API_TOK','example');vi.stubEnv('STRIPE_WEBHOOK_SECRET','example');vi.stubEnv('STRIPE_SECRET_KEY','rk_live_example');vi.stubEnv('PRINTFUL_STORE_ID','7561356');
  expect(checkoutIsEnabled()).toBe(false);
  vi.stubEnv('PRINTFUL_STORE_ID','18894982');vi.stubEnv('STRIPE_SECRET_KEY','sk_test_example');expect(checkoutIsEnabled()).toBe(false);
 });
});
