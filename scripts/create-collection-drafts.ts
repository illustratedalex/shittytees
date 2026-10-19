import {printfulRequest} from '../lib/printful/client';
import designs from '../data/designs/new-collections.json';
import proof from '../data/designs/print-asset-proof.json';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Native audit Preview only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Drafts only');
const base='https://shittytees-git-stripe-printful-migration-audit-southernvt.vercel.app';
async function main(){
 const stores=(await printfulRequest<Array<{id:number;type:string}>>('/stores')).result;
 if(!stores.some(s=>s.id===18894982&&s.type==='native'))throw new Error('Wrong platform');
 const stock=(await printfulRequest<{product:{model:string};variants:Array<{id:number;color:string;size:string;in_stock:boolean}>}>('/products/71')).result;
 if(!stock.product.model.includes('3001'))throw new Error('Wrong garment');
 const variants=['S','M','L','XL'].map(size=>stock.variants.find(v=>v.color==='Black'&&v.size===size&&v.in_stock));
 if(variants.some(v=>!v))throw new Error('Missing stock');
 const existing=(await printfulRequest<Array<{id:number;name:string;external_id:string}>>('/store/products?limit=100')).result;
 for(const d of designs){
  const asset=proof.find(p=>p.slug===d.slug);
  if(!asset||asset.preparedPixels[0]!==3000||asset.preparedPixels[1]!==4000||!asset.transparent)throw new Error('Unverified print asset');
  let product=existing.find(p=>p.external_id==='shittytees-'+d.slug);
  const imageUrl=base+d.printArtwork;
  const response=await fetch(imageUrl);if(!response.ok||!response.headers.get('content-type')?.startsWith('image/png'))throw new Error('Asset inaccessible');
  const {createHash}=await import('node:crypto');const bytes=Buffer.from(await response.arrayBuffer());
  if(createHash('md5').update(bytes).digest('hex')!==asset.md5)throw new Error('Wrong asset bytes');
  if(!product){
   const created=(await printfulRequest<{id:number}>('/store/products',{method:'POST',body:JSON.stringify({sync_product:{name:d.name,external_id:'shittytees-'+d.slug,thumbnail:imageUrl},sync_variants:variants.map(v=>({variant_id:v!.id,external_id:d.slug+'-black-'+v!.size.toLowerCase(),retail_price:'13.92',is_ignored:true,files:[{type:'default',url:imageUrl}]}))})})).result;
   product={id:created.id,name:d.name,external_id:'shittytees-'+d.slug};
  }
  const detail=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+product.id)).result;
  if(detail.sync_product.name!==d.name||detail.sync_variants.length!==4||detail.sync_variants.some(v=>v.color!=='Black'||!v.is_ignored))throw new Error('Unexpected product');
  const task=(await printfulRequest<{task_key:string}>('/mockup-generator/create-task/71',{method:'POST',body:JSON.stringify({variant_ids:variants.map(v=>v!.id),format:'png',files:[{placement:'front',image_url:imageUrl,position:{area_width:1800,area_height:2400,width:1800,height:2400,top:0,left:0}}]})})).result;
  console.log('COLLECTION_NATIVE_DRAFT',JSON.stringify({slug:d.slug,productId:product.id,task:task.task_key,variants:detail.sync_variants.map(v=>({id:v.id,catalog:v.variant_id,size:v.size,color:v.color,files:(v.files||[]).map(f=>({id:f.id,type:f.type,status:f.status,width:f.width,height:f.height,dpi:f.dpi,hash:f.hash}))})),ignored:true,md5:asset.md5}));
 }
}
main().catch(e=>{console.error('Native collection draft creation failed',e instanceof Error?e.message:'unknown');process.exitCode=1});
