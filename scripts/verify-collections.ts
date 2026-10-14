import {printfulRequest} from '../lib/printful/client';
import {estimateFulfillmentCosts} from '../lib/printful/costs';
import designs from '../data/designs/new-collections.json';
import proof from '../data/designs/print-asset-proof.json';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
import type {StoreOrderItem} from '../lib/orders/types';
const tasks=['gt-983626337','gt-983626347','gt-983626771','gt-983626780','gt-983627213','gt-983627232','gt-983627659','gt-983627672','gt-983628069','gt-983628081','gt-983628477','gt-983628489'];
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Native audit Preview only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Unconfirmed verification only');
const address={firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'};
async function main(){
 const list=(await printfulRequest<Array<{id:number;external_id:string}>>('/store/products?limit=100')).result;
 const stock=(await printfulRequest<{product:{model:string};variants:Array<{id:number;in_stock:boolean}>}>('/products/71')).result;
 if(!stock.product.model.includes('3001'))throw new Error('Wrong garment');
 const plans=[]; const items:StoreOrderItem[]=[];
 for(const [i,d] of designs.entries()){
  const matches=list.filter(p=>p.external_id==='shittytees-'+d.slug);if(matches.length!==1)throw new Error('Missing/ambiguous product '+d.slug);
  const detail=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+matches[0].id)).result;
  if(detail.sync_product.name!==d.name||detail.sync_variants.length!==4)throw new Error('Design mismatch');
  const ids=[...new Set(detail.sync_variants.flatMap(v=>(v.files||[]).filter(f=>f.type==='default').map(f=>f.id)))];
  if(ids.length!==1||!ids[0])throw new Error('Artwork mismatch');
  const file=(await printfulRequest<{id:number;hash:string;width:number;height:number;status:string}>('/files/'+ids[0])).result;
  const expected=proof.find(p=>p.slug===d.slug)!;
  if(file.hash!==expected.md5||file.width!==3000||file.height!==4000||file.status!=='ok')throw new Error('Processed file mismatch '+d.slug);
  const task=(await printfulRequest<{status:string;mockups:Array<{placement:string;variant_ids:number[];mockup_url:string}>}>('/mockup-generator/task?task_key='+tasks[i])).result;
  const front=task.mockups?.find(m=>m.placement==='front'&&[4016,4017,4018,4019].every(id=>m.variant_ids.includes(id)));
  if(task.status!=='completed'||!front?.mockup_url)throw new Error('Mockup incomplete '+d.slug);
  const image=await fetch(front.mockup_url);if(!image.ok||!image.headers.get('content-type')?.startsWith('image/'))throw new Error('Mockup inaccessible');
  const variants=[];
  for(const size of ['S','M','L','XL']){
   const v=detail.sync_variants.find(v=>v.size===size);const catalog=({S:4016,M:4017,L:4018,XL:4019} as Record<string,number>)[size];
   if(!v||v.color!=='Black'||v.variant_id!==catalog||v.availability_status!=='active'||!stock.variants.find(s=>s.id===catalog)?.in_stock||v.is_discontinued||!v.files?.some(f=>f.type==='default'&&f.id===file.id))throw new Error('Variant mismatch '+d.slug+' '+size);
   const id=d.slug+'-black-'+size.toLowerCase();
   const item:StoreOrderItem={id,productId:'collection-'+d.slug,productSlug:d.slug,localVariantId:id,printfulVariantId:String(v.id),name:d.name,size,color:'Black',quantity:1,unitPrice:13.92,image:d.mockup};
   const cost=await estimateFulfillmentCosts([item],address);const price=(cost.productionCents+200)/100;
   if(!Number.isFinite(price)||price<=2)throw new Error('Invalid cost');
   item.unitPrice=price;items.push(item);variants.push({id:v.id,catalog,size,price,productionCents:cost.productionCents});
  }
  plans.push({slug:d.slug,productId:matches[0].id,fileId:file.id,md5:file.hash,task:tasks[i],mockupUrl:front.mockup_url,variants});
  console.log('COLLECTION_READY',JSON.stringify(plans[plans.length-1]));
 }
 const external='st-collections-20261014';
 type Draft={id:number;status:string;items:Array<{sync_variant_id:number;files:Array<{id:number;type:string}>}>};
 let draft:Draft;
 try{draft=(await printfulRequest<Draft>('/orders/@'+external)).result;}catch(e){if((e as {status?:number}).status!==404)throw e;draft=(await printfulRequest<Draft>('/orders',{method:'POST',body:JSON.stringify({external_id:external,recipient:{name:'John Doe',email:'test@example.com',address1:address.address,city:address.city,state_code:'CA',country_code:'US',zip:address.postalCode},items:items.map(i=>({sync_variant_id:Number(i.printfulVariantId),quantity:1,retail_price:i.unitPrice.toFixed(2)})),confirm:false})})).result;}
 const checked=(await printfulRequest<Draft>('/orders/'+draft.id)).result;
 if(checked.status!=='draft'||checked.items.length!==48)throw new Error('Unconfirmed draft proof missing');
 for(const p of plans)for(const v of p.variants)if(!checked.items.some(i=>i.sync_variant_id===v.id&&i.files.some(f=>f.type==='default'&&f.id===p.fileId)))throw new Error('Draft artwork mismatch');
 console.log('COLLECTION_DRAFT_TEST',JSON.stringify({id:checked.id,status:checked.status,variants:48,confirmed:false}));
}
main().catch(e=>{console.error('Collection readiness failed',e instanceof Error?e.message:'unknown');process.exitCode=1});
