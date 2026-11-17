import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {getPool} from '../lib/orders/database';
import {getCatalogRepository} from '../lib/catalog';
import {getStripe} from '../lib/stripe/client';
import {printfulRequest} from '../lib/printful/client';
import {estimateFulfillmentCosts} from '../lib/printful/costs';
import {quoteCostPlusOrder} from '../lib/pricing/quote';
import designs from '../data/designs/new-collections.json';
import manifest from '../data/designs/collection-product-proof.json';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
import type {Product} from '../lib/types/product';
import type {StoreOrderItem} from '../lib/orders/types';
const publish=process.argv.includes('--publish');
const preview=process.env.VERCEL_ENV==='preview'&&process.env.VERCEL_GIT_COMMIT_REF==='stripe-printful-migration-audit';
if((!preview&&process.env.VERCEL_ENV!=='production')||process.env.PRINTFUL_STORE_ID!=='18894982'||(publish&&preview))throw new Error('Wrong publication target');
const address={firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'};
async function main(){
 const repo=getCatalogRepository();
 if(!preview&&(await getStripe().accounts.retrieve()).id!=='acct_1UPvlRIsn0OPIJry')throw new Error('Wrong live merchant');
 const stock=(await printfulRequest<{variants:Array<{id:number;in_stock:boolean}>}>('/products/71')).result;
 const draft=(await printfulRequest<{status:string;items:Array<{sync_variant_id:number;files:Array<{id:number;type:string}>}>}>('/orders/@st-collections-20261014')).result;
 if(draft.status!=='draft'||draft.items.length!==48)throw new Error('Draft test proof missing');
 const plans:Product[]=[];
 for(const d of designs){
  const p=manifest.find(p=>p.slug===d.slug);if(!p||p.variants.length!==4)throw new Error('Missing proof');
  const mockup=readFileSync('public'+d.mockup);if(createHash('sha256').update(mockup).digest('hex')!==p.mockupSha256)throw new Error('Mockup bytes mismatch');
  const detail=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+p.productId)).result;
  const f=(await printfulRequest<{hash:string;width:number;height:number;status:string}>('/files/'+p.fileId)).result;
  if(f.hash!==p.md5||f.width!==3000||f.height!==4000||f.status!=='ok'||detail.sync_product.external_id!=='shittytees-'+d.slug||detail.sync_product.name!==d.name||detail.sync_variants.length!==4)throw new Error('Product proof mismatch '+d.slug);
  const variants=[];
  for(const v of p.variants){
   const actual=detail.sync_variants.find(a=>a.id===v.id);
   if(!actual||actual.variant_id!==v.catalog||actual.color!=='Black'||actual.size!==v.size||actual.availability_status!=='active'||actual.is_discontinued||!stock.variants.find(s=>s.id===v.catalog)?.in_stock||!actual.files?.some(f=>f.type==='default'&&f.id===p.fileId)||!draft.items.some(i=>i.sync_variant_id===v.id&&i.files.some(f=>f.type==='default'&&f.id===p.fileId)))throw new Error('Variant proof mismatch');
   const id=d.slug+'-black-'+v.size.toLowerCase();
   variants.push({id,printfulVariantId:String(v.id),printfulSyncVariantId:String(v.id),printfulCatalogVariantId:String(v.catalog),printfulVariantExternalId:actual.external_id,name:'Black - '+v.size,size:v.size,color:'Black',colorHex:'#000000',sku:actual.sku||id,retailPrice:v.price,available:preview||publish});
  }
  const current=await repo.getBySlug(d.slug);
  if(current&&current.printfulProductId!==String(p.productId))throw new Error('Existing mapping conflict');
  const now=new Date();
  const product:Product={id:current?.id||'collection-'+d.slug,slug:d.slug,printfulProductId:String(p.productId),printfulExternalId:detail.sync_product.external_id,name:d.name,shortDescription:d.description,description:d.description+' Printed on a Black Bella + Canvas 3001 unisex tee. Delivery, production taxes and handling are quoted for your address before payment.',category:'T-Shirts',collectionSlug:d.collection,active:true,publishStatus:preview||publish?'published':'draft',featured:true,basePrice:Math.min(...p.variants.map(v=>v.productionCents))/100,retailPrice:Math.min(...variants.map(v=>v.retailPrice)),currency:'USD',tags:[d.collection,'new-arrival'],images:[{id:d.slug+'-front',src:d.mockup,alt:d.name+' official Printful black shirt mockup'}],createdAt:current?.createdAt||now,updatedAt:now,variants};
  const v=variants[0];const item:StoreOrderItem={id:v.id,productId:product.id,productSlug:d.slug,localVariantId:v.id,printfulVariantId:v.printfulVariantId,name:d.name,size:v.size,color:'Black',quantity:1,unitPrice:v.retailPrice,image:d.mockup};
  const costs=await estimateFulfillmentCosts([item],address);
  if(costs.productionCents+200!==Math.round(v.retailPrice*100))throw new Error('Current production price changed');
  const quote=await quoteCostPlusOrder([item],address);if(quote.total<=v.retailPrice)throw new Error('Invalid destination quote');
  plans.push(product);console.log('COLLECTION_PUBLICATION_GATE',JSON.stringify({slug:d.slug,productId:p.productId,variants:4,itemPrice:v.retailPrice,destinationTotal:quote.total,publish}));
 }
 // Every design passes the read-only gate before any activation or catalog writes.
 for(const product of plans){
  if(publish){
   for(const v of product.variants)await printfulRequest('/store/variants/'+v.printfulSyncVariantId,{method:'PUT',body:JSON.stringify({is_ignored:false,retail_price:v.retailPrice.toFixed(2)})});
   const check=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+product.printfulProductId)).result;
   if(check.sync_variants.some(v=>v.is_ignored||v.availability_status!=='active'||Number(v.retail_price)!==product.variants.find(a=>a.printfulSyncVariantId===String(v.id))?.retailPrice))throw new Error('Provider activation failed');
  }
  if(!publish&&!preview&& (await repo.getBySlug(product.slug))?.publishStatus==='published')throw new Error('Refusing to downgrade live product');
  await repo.upsertProduct(product,{printfulStatus:'native-mapping-verified',printfulLastSyncedAt:new Date()});
  const saved=await repo.getBySlug(product.slug);
  if(saved?.variants.length!==4||saved.publishStatus!==product.publishStatus||saved.variants.some(v=>v.available!==(preview||publish)))throw new Error('Catalog verification failed');
  console.log('COLLECTION_CATALOG_VERIFIED',JSON.stringify({slug:product.slug,status:saved.publishStatus,available:saved.variants.every(v=>v.available),environment:process.env.VERCEL_ENV}));
 }
 await getPool().end();
}
main().catch(async e=>{console.error('Collection publication failed',e instanceof Error?e.message:'unknown');await getPool().end();process.exitCode=1});
