import {getCatalogRepository} from '../lib/catalog';
import {getPool} from '../lib/orders/database';
import {printfulRequest} from '../lib/printful/client';
import {DESIGN_SHOWCASE} from '../data/designShowcase';
if(process.env.VERCEL_ENV!=='preview'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Audit Preview only');
async function main(){
 const repo=getCatalogRepository();
 for(const [i,pfId] of [480976406,480976408].entries()){
 const d=DESIGN_SHOWCASE[i];
 const detail=(await printfulRequest<any>('/store/products/'+pfId)).result;
 if(detail.sync_product.name!==d.name)throw new Error('Design mismatch');
 const now=new Date();
 await repo.upsertProduct({id:'politics-'+d.slug,slug:d.slug,printfulProductId:String(pfId),printfulExternalId:detail.sync_product.external_id,name:d.name,shortDescription:d.description,description:d.description+' Printed on a Bella + Canvas 3001 unisex tee.',category:'T-Shirts',collectionSlug:'shitty-politics',active:true,publishStatus:'draft',featured:true,basePrice:0,retailPrice:36,currency:'USD',tags:['shitty-politics','new-arrival'],images:[{id:d.slug+'-front',src:d.image,alt:d.name+' black shirt concept mockup'}],createdAt:now,updatedAt:now,variants:detail.sync_variants.map((v:any)=>({id:d.slug+'-black-'+v.size.toLowerCase(),printfulVariantId:String(v.id),printfulSyncVariantId:String(v.id),printfulCatalogVariantId:String(v.variant_id),name:'Black - '+v.size,size:v.size,color:v.color,colorHex:'#000000',sku:v.sku||d.slug+'-'+v.size,retailPrice:Number(v.retail_price),available:false}))},{printfulStatus:'print-review-pending',printfulLastSyncedAt:now});
 const saved=await repo.getBySlug(d.slug);console.log('POLITICS_CATALOG',JSON.stringify({slug:saved?.slug,status:saved?.publishStatus,variants:saved?.variants.length,available:saved?.variants.some(v=>v.available)}));
 }
 await getPool().end();
}
main().catch(()=>{console.error('Politics catalog registration failed');process.exitCode=1});
