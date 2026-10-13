import {afterEach,describe,expect,it,vi} from 'vitest';
import {printfulWebhookToken,validatePrintfulWebhookToken} from '@/lib/printful/webhookAuth';
afterEach(()=>vi.unstubAllEnvs());
describe('native Printful callback authentication',()=>{
 it('uses a derived callback credential and rejects invalid tokens or store routing',()=>{
  vi.stubEnv('VERCEL_ENV','production');vi.stubEnv('PRINTFUL_STORE_ID','18894982');vi.stubEnv('PRINTFUL_API_TOK','example-native-api-token');vi.stubEnv('PRINTFUL_NATIVE_API_TOKEN','');
  const token=printfulWebhookToken();
  expect(token).not.toContain('example-native');expect(validatePrintfulWebhookToken(token)).toBe(true);
  expect(validatePrintfulWebhookToken('a'.repeat(64))).toBe(false);expect(validatePrintfulWebhookToken('')).toBe(false);
  vi.stubEnv('PRINTFUL_STORE_ID','7561356');expect(validatePrintfulWebhookToken(token)).toBe(false);
 });
});
