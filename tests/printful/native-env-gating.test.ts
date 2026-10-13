import {afterEach,describe,expect,it,vi} from 'vitest';
import {getPrintfulEnv} from '../../lib/printful/env';

afterEach(()=>vi.unstubAllEnvs());
function settings(environment:string,store:string){
 vi.stubEnv('VERCEL_ENV',environment);
 vi.stubEnv('VERCEL_GIT_COMMIT_REF','stripe-printful-migration-audit');
 vi.stubEnv('PRINTFUL_STORE_ID',store);
 vi.stubEnv('PRINTFUL_API_TOKEN','legacy-example');
 vi.stubEnv('PRINTFUL_NATIVE_API_TOKEN','native-example');
 vi.stubEnv('PRINTFUL_API_TOK','preview-example');
}
describe('native Printful credential routing',()=>{
 it('requires the verified native store in Production',()=>{
  settings('production','7561356');
  expect(getPrintfulEnv().apiToken).toBeUndefined();
  vi.stubEnv('PRINTFUL_STORE_ID','18894982');
  expect(getPrintfulEnv().apiToken).toBe('native-example');
 });
 it('never falls back to the old Square token in Production',()=>{
  settings('production','18894982');
  vi.stubEnv('PRINTFUL_NATIVE_API_TOKEN','');
  vi.stubEnv('PRINTFUL_API_TOK','');
  expect(getPrintfulEnv().apiToken).toBeUndefined();
 });
 it('accepts the existing unrenamable alias for the verified native Production store',()=>{
  settings('production','18894982');
  vi.stubEnv('PRINTFUL_NATIVE_API_TOKEN','');
  expect(getPrintfulEnv().apiToken).toBe('preview-example');
 });
 it('keeps the existing audit Preview token working during preparation',()=>{
  settings('preview','18894982');
  vi.stubEnv('PRINTFUL_NATIVE_API_TOKEN','');
  expect(getPrintfulEnv().apiToken).toBe('preview-example');
  vi.stubEnv('PRINTFUL_STORE_ID','7561356');
  expect(getPrintfulEnv().apiToken).toBeUndefined();
 });
 it('does not route the native credential to unrelated branches',()=>{
  settings('preview','7561356');
  vi.stubEnv('VERCEL_GIT_COMMIT_REF','unrelated-branch');
  expect(getPrintfulEnv().apiToken).toBe('legacy-example');
 });
});
