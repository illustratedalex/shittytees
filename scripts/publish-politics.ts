import {getStripe} from '../lib/stripe/client';
import {getPool} from '../lib/orders/database';
import {getCatalogRepository} from '../lib/catalog';
import {printfulRequest} from '../lib/printful/client';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
if(process.env.VERCEL_ENV!=='production'||process.env.PRINTFUL_STORE_ID!=='18894982'||process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Native Production readiness only');
async function main(){
 if((await getStripe().accounts.retrieve()).id!=='acct_1UPvlRIsn0OPIJry')throw new Error('Wrong merchant');
 const receipt=await getPool().query("SELECT event_id FROM processed_webhook_events WHERE provider='stripe' AND event_type='checkout.session.expired' AND processed_at IS NOT NULL");
 if(!receipt.rows.length)throw new Error('Production signed delivery unverified');
 const stock=(await printfulRequest<{variants:Array<{id:number;in_stock?:boolean;availability_status?:Array<{region:string;status:string}>}>}>('/products/71')).result;
 const repo=getCatalogRepository();
 const plans=[];
 for(const [productId,draftId,fileId] of [[480976406,180769197,1085648812],[480976408,180772314,1085648838]]){
  const detail=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+productId)).result;
  const draft=(await printfulRequest<{status:string;items:Array<{sync_variant_id:number;files:Array<{id:number;type:string}>}>}>('/orders/'+draftId)).result;
  if(draft.status!=='draft'||!draft.items.some(i=>i.files.some(f=>f.type==='default'&&f.id===fileId)))throw new Error('Sandbox draft proof mismatch');
  const local=await repo.findByPrintfulProductId(productId);
  if(!local||local.variants.length!==4||detail.sync_variants.length!==4)throw new Error('Catalog incomplete');
  for(const variant of detail.sync_variants){
   const saved=local.variants.find(v=>v.printfulSyncVariantId===String(variant.id));
   const inventory=stock.variants.find(v=>v.id===variant.variant_id);
   if(!saved||saved.retailPrice!==13.92||saved.size!==variant.size||variant.color!=='Black'||saved.printfulCatalogVariantId!==String(variant.variant_id)||!variant.files?.some(f=>f.type==='default'&&f.id===fileId)||variant.availability_status!=='active'||!inventory?.in_stock)throw new Error('Unavailable or mismatched variant '+variant.id);
  }
  plans.push({detail,local,fileId});
 }
 console.log('NATIVE_STOCK_READINESS',JSON.stringify(plans.map(p=>({product:p.detail.sync_product.id,variants:p.detail.sync_variants.map(v=>({id:v.id,size:v.size,color:v.color,status:v.availability_status,stock:stock.variants.find(i=>i.id===v.variant_id),itemPrice:13.92}))}))));
 if(process.argv.includes('--publish')){
  for(const p of plans){
   for(const v of p.detail.sync_variants){
    await printfulRequest('/store/variants/'+v.id,{method:'PUT',body:JSON.stringify({retail_price:'13.92',is_ignored:false})});
   }
   const verified=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+p.detail.sync_product.id)).result;
   if(verified.sync_variants.some(v=>v.is_ignored||Number(v.retail_price)!==13.92||!v.files?.some(f=>f.type==='default'&&f.id===p.fileId)))throw new Error('Provider activation verification failed');
   await repo.upsertProduct({...p.local,publishStatus:'published',active:true,variants:p.local.variants.map(v=>({...v,available:true})),updatedAt:new Date()},{printfulStatus:'native-mapping-verified',printfulLastSyncedAt:new Date()});
   console.log('POLITICS_PUBLISHED',JSON.stringify({slug:p.local.slug,variants:4,itemPrice:13.92}));
  }
 }
 await getPool().end();
}
main().catch(async e=>{console.error('Native readiness failed:',e instanceof Error?e.message:'unknown');await getPool().end();process.exitCode=1});
