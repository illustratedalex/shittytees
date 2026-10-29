import {describe,expect,it,vi} from 'vitest';
import {quoteCostPlusOrder} from '@/lib/pricing/quote';
import type {StoreOrderItem,StoreShippingAddress} from '@/lib/orders/types';
const items=[{quantity:1,unitPrice:13.92} as StoreOrderItem];
const address={} as StoreShippingAddress;
describe('destination cost pricing',()=>{
 it('includes supplier tax and processing in the reviewed amount',async()=>{
  const estimate=vi.fn(async()=>({currency:'USD' as const,productionCents:1192,shippingCents:495,supplierTaxCents:152,totalCents:1839}));
  const price=await quoteCostPlusOrder(items,address,estimate);
  expect(price.total).toBe(21.65);
  expect(price.subtotal+price.shipping).toBe(price.total);
  expect(estimate).toHaveBeenLastCalledWith(items,address,7.73);
 });
 it('re-estimates taxes using the final retail shipping instead of stale $36 prices',async()=>{
  const estimate=vi.fn(async (_i,_a,shipping=0)=>{const tax=Math.round((1392+shipping*100)*0.09);return {currency:'USD' as const,productionCents:1192,shippingCents:495,supplierTaxCents:tax,totalCents:1687+tax};});
  const price=await quoteCostPlusOrder(items,address,estimate);
  expect(estimate.mock.calls.length).toBeGreaterThan(2);
  const final=await estimate(items,address,price.shipping);
  expect(Math.round(price.total*100)-final.totalCents-Math.round(price.total*100*0.044)-30).toBeGreaterThanOrEqual(200);
 });
 it('rejects non-converging quotes and oversized orders',async()=>{
  const changing=vi.fn(async()=>({currency:'USD' as const,productionCents:1192,shippingCents:495,supplierTaxCents:0,totalCents:1700+100*changing.mock.calls.length}));
  await expect(quoteCostPlusOrder(items,address,changing)).rejects.toThrow('could not be confirmed');
  await expect(quoteCostPlusOrder([{...items[0],quantity:101}],address,changing)).rejects.toThrow('quantity');
 });
});
