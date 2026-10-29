// Updates only the two approved draft products in the separate native API store.
// Originals and the legacy Square store remain intact. This never creates orders.
if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'stripe-printful-migration-audit' || process.env.PRINTFUL_STORE_ID !== '18894982') throw new Error('Audit Preview only');
if (process.env.PRINTFUL_ENABLE_FULFILLMENT === 'true' || process.env.PRINTFUL_AUTO_CONFIRM === 'true') throw new Error('Fulfillment must remain disabled');
const apply = process.argv.includes('--apply');
const base = 'https://shittytees-git-stripe-printful-migration-audit-southernvt.vercel.app';
const designs = [
 {id:480976406,name:'Elected, Not Housebroken',file:'elected-front-3000x4000.png'},
 {id:480976408,name:'Campaign Promises — Batteries Not Included',file:'campaign-front-3000x4000.png'},
];
async function request(path,method='GET',body) {
 const response = await fetch('https://api.printful.com'+path,{method,headers:{Authorization:'Bearer '+process.env.PRINTFUL_API_TOK,'X-PF-Store-Id':'18894982','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Printful operation failed: '+response.status);
 return (await response.json()).result;
}
const stores=await request('/stores');
if(!stores.some(s=>s.id===18894982&&s.type==='native'))throw new Error('Native API store not verified');
for(const design of designs) {
 let detail=await request('/store/products/'+design.id);
 if(detail.sync_product.name!==design.name || detail.sync_variants.length!==4)throw new Error('Unexpected product');
 for(const v of detail.sync_variants) {
  const expected={S:4016,M:4017,L:4018,XL:4019}[v.size];
  if(v.color!=='Black'||v.variant_id!==expected||!v.is_ignored)throw new Error('Unexpected or enabled variant');
 }
 const imageUrl=base+'/images/designs/'+design.file;
 if(apply) {
  const response=await fetch(imageUrl,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/png'))throw new Error('Print asset is inaccessible');
  for(const v of detail.sync_variants) {
   const current=v.files.find(f=>f.type==='default');
   if(current?.filename===design.file&&current.width===3000&&current.height===4000)continue;
   await request('/store/variants/'+v.id,'PUT',{is_ignored:true,files:[{type:'default',url:imageUrl},...v.files.filter(f=>f.type==='preview').map(f=>({type:'preview',url:f.url}))]});
  }
  const task=await request('/mockup-generator/create-task/71','POST',{variant_ids:detail.sync_variants.map(v=>v.variant_id),format:'png',files:[{placement:'front',image_url:imageUrl,position:{area_width:1800,area_height:2400,width:1800,height:2400,top:0,left:0}}]});
  console.log('POLITICS_MOCKUP_TASK',JSON.stringify({product:design.id,task:task.task_key,status:task.status}));
 }
 detail=await request('/store/products/'+design.id);
 console.log('POLITICS_PRINT_REVIEW',JSON.stringify({product:design.id,variants:detail.sync_variants.map(v=>({id:v.id,size:v.size,color:v.color,ignored:v.is_ignored,files:v.files.filter(f=>f.type!=='preview').map(f=>({id:f.id,filename:f.filename,width:f.width,height:f.height,dpi:f.dpi,status:f.status}))})),published:false}));
}
