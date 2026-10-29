import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('@/lib/printful/client',()=>({printfulRequest:vi.fn()}));
import {printfulRequest} from '@/lib/printful/client';
import {estimateFulfillmentCosts} from '@/lib/printful/costs';
import type {StoreOrderItem} from '@/lib/orders/types';

const items=[{printfulVariantId:'5572208298',quantity:1,name:'Shirt',unitPrice:13.92} as StoreOrderItem];
const address={firstName:'Test',lastName:'Buyer',email:'test@example.com',address:'1 Main',city:'Boston',state:'MA',postalCode:'02108',country:'US'};
const costs={currency:'USD',subtotal:11.92,shipping:5.3500000000000005,tax:1.43,total:18.7};
beforeEach(()=>vi.resetAllMocks());
function respond(overrides:Record<string,unknown>={}) {
 vi.mocked(printfulRequest).mockResolvedValue({code:200,result:{costs:{...costs,...overrides}}});
}
describe('supplier cost estimates',()=>{
 it('accepts the live response that previously blocked delivered-price review',async()=>{
  respond();
  await expect(estimateFulfillmentCosts(items,address,0)).resolves.toEqual({currency:'USD',productionCents:1192,shippingCents:535,supplierTaxCents:143,totalCents:1870});
  expect(JSON.parse(vi.mocked(printfulRequest).mock.calls[0][1]?.body as string).retail_costs.shipping).toBe('0.00');
 });
 it('retains support for decimal strings and zero tax',async()=>{
  respond({subtotal:'11.92',shipping:'5.35',tax:'0.00',total:'17.27'});
  await expect(estimateFulfillmentCosts(items,address)).resolves.toMatchObject({shippingCents:535,supplierTaxCents:0,totalCents:1727});
 });
 it.each([null,undefined,NaN,Infinity,-1,5.355,5.35001,'5.3500000000000005','', '5.35x','1e2',{},Number.MAX_VALUE])('rejects invalid or fractional-cent supplier amounts: %s',async(value)=>{
  respond({shipping:value});
  await expect(estimateFulfillmentCosts(items,address)).rejects.toThrow(/Printful cost/);
 });
 it('rejects a non-dollar estimate',async()=>{
  respond({currency:'EUR'});
  await expect(estimateFulfillmentCosts(items,address)).rejects.toThrow('USD');
 });
});
