import { getPrintfulEnv } from '../lib/printful/env';
import { estimateFulfillmentCosts } from '../lib/printful/costs';
import { printfulRequest } from '../lib/printful/client';
import { calculateCostPlusTotal } from '../lib/pricing/costPlus';
import type { StoreOrderItem } from '../lib/orders/types';

if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'stripe-printful-migration-audit' || getPrintfulEnv().storeId !== '18894982') throw new Error('Audit Preview only');
// Illustration only until the merchant's actual fee schedule is verified.
const fees = {basisPoints:290, fixedCents:30};
// Published example recipient from Printful API documentation, not customer data.
const address = {firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'};
type Detail = {sync_product:{id:number;name:string};sync_variants:Array<{id:number;size:string;color:string}>};
async function main() {
for (const id of [480976406,480976408]) {
 const detail = (await printfulRequest<Detail>('/store/products/' + id)).result;
 for (const variant of detail.sync_variants) {
  if (variant.color !== 'Black' || !['S','M','L','XL'].includes(variant.size)) throw new Error('Unexpected garment mapping');
  const item:StoreOrderItem = {id:String(variant.id), productId:String(id), productSlug:'pricing-audit',localVariantId:String(variant.id),printfulVariantId:String(variant.id),name:detail.sync_product.name,size:variant.size,color:variant.color,quantity:1,unitPrice:36,image:''};
  try {
   const costs = await estimateFulfillmentCosts([item],address);
   const price = calculateCostPlusTotal(costs.totalCents,1,fees);
   console.log('PRICING_ESTIMATE',JSON.stringify({product:id,size:variant.size,color:variant.color,costs,price,feeAssumption:'Standard US domestic online card: 2.9% + 30 cents; merchant schedule unverified',destination:'Printful documentation sample recipient, CA 91311',published:false}));
  } catch {console.log('PRICING_ESTIMATE',JSON.stringify({product:id,size:variant.size,ok:false,published:false}));}
 }
}
}
main().catch(() => {console.error('Pricing diagnostic failed'); process.exitCode = 1;});
