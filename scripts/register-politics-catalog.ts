import {getCatalogRepository} from '../lib/catalog';
import {getPool} from '../lib/orders/database';
import {printfulRequest} from '../lib/printful/client';
import {estimateFulfillmentCosts} from '../lib/printful/costs';
import {DESIGN_SHOWCASE} from '../data/designShowcase';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
import type {StoreOrderItem} from '../lib/orders/types';
const environment=process.env.VERCEL_ENV;
const preview=environment==='preview' && process.env.VERCEL_GIT_COMMIT_REF==='stripe-printful-migration-audit';
const productionDraft=environment==='production' && process.argv.includes('--production-draft');
if((!preview&&!productionDraft)||process.env.PRINTFUL_STORE_ID!=='18894982') throw new Error('Verified native store only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true') throw new Error('Registration requires fulfillment disabled');
const address={firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'};
const catalogBySize:Record<string,number>={S:4016,M:4017,L:4018,XL:4019};
async function main(){
 const repo=getCatalogRepository();
 for(const [i,pfId] of [480976406,480976408].entries()){
  const d=DESIGN_SHOWCASE[i];
  const detail=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+pfId)).result;
  const expectedFile=i===0?1085648812:1085648838;
  if(detail.sync_product.name!==d.name||detail.sync_variants.length!==4) throw new Error('Design mismatch');
  const variants=[];
  const costsBySize=[];
  for(const v of detail.sync_variants){
   if(v.color!=='Black'||v.variant_id!==catalogBySize[v.size||'']||!v.files?.some(f=>f.type==='default'&&f.id===expectedFile))throw new Error('Print mapping mismatch');
   const localId=d.slug+'-black-'+v.size!.toLowerCase();
   const item:StoreOrderItem={id:localId,productId:'politics-'+d.slug,productSlug:d.slug,localVariantId:localId,printfulVariantId:String(v.id),name:d.name,size:v.size!,color:'Black',quantity:1,unitPrice:36,image:d.image};
   const costs=await estimateFulfillmentCosts([item],address);
   const price=(costs.productionCents+200)/100;
   costsBySize.push({size:v.size,productionCents:costs.productionCents,itemPrice:price});
   variants.push({id:localId,printfulVariantId:String(v.id),printfulSyncVariantId:String(v.id),printfulCatalogVariantId:String(v.variant_id),name:'Black - '+v.size,size:v.size!,color:'Black',colorHex:'#000000',sku:v.sku||d.slug+'-'+v.size,retailPrice:price,available:preview});
  }
  const now=new Date();
  await repo.upsertProduct({id:'politics-'+d.slug,slug:d.slug,printfulProductId:String(pfId),printfulExternalId:detail.sync_product.external_id,name:d.name,shortDescription:d.description,description:d.description+' Printed on a Bella + Canvas 3001 unisex tee. Delivery, production taxes and handling are quoted for your address before payment.',category:'T-Shirts',collectionSlug:'shitty-politics',active:true,publishStatus:preview?'published':'draft',featured:true,basePrice:Math.min(...costsBySize.map(c=>c.productionCents))/100,retailPrice:Math.min(...variants.map(v=>v.retailPrice)),currency:'USD',tags:['shitty-politics','new-arrival'],images:[{id:d.slug+'-front',src:d.image,alt:d.name+' official Printful black shirt mockup'}],createdAt:now,updatedAt:now,variants},{printfulStatus:'native-mapping-verified',printfulLastSyncedAt:now});
  const saved=await repo.getBySlug(d.slug);
  console.log('POLITICS_CATALOG',JSON.stringify({slug:saved?.slug,status:saved?.publishStatus,variants:saved?.variants.length,available:saved?.variants.some(v=>v.available),costsBySize}));
 }
 await getPool().end();
}
main().catch(async()=>{console.error('Politics catalog registration failed');await getPool().end();process.exitCode=1});
