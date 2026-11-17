import {describe,it,expect} from 'vitest';
import {printfulExternalId} from '../../lib/printful/orders';

describe('Printful external order IDs',()=>{
 it('preserves compatible existing IDs',()=>expect(printfulExternalId('order_123-abc')).toBe('order_123-abc'));
 it('maps normal UUIDs and long test IDs to stable valid IDs',()=>{
  for(const id of ['957381e0-43c4-44f8-a994-7492c5c5142d','preview-e2e-20261013-campaign-promises-batteries-not-included']){
   expect(printfulExternalId(id)).toMatch(/^[A-Za-z0-9_-]{32}$/);
   expect(printfulExternalId(id)).toBe(printfulExternalId(id));
  }
  expect(printfulExternalId('957381e0-43c4-44f8-a994-7492c5c5142d')).not.toBe(printfulExternalId('957381e0-43c4-44f8-a994-7492c5c5142e'));
 });
});
