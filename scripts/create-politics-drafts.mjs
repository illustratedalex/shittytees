if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit')throw new Error('Audit Preview only');
const token=process.env.PRINTFUL_API_TOK;
if(!token||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Wrong store context');
async function request(path,body){const r=await fetch('https://api.printful.com'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'X-PF-Store-Id':'18894982','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const p=await r.json();if(!r.ok)throw new Error('Printful request failed: '+r.status+' '+path);return p.result;}
const catalog=await request('/products/71');
if(!/3001/.test(catalog.product.model))throw new Error('Unexpected garment');
const variants=catalog.variants.filter(v=>v.color==='Black'&&['S','M','L','XL'].includes(v.size));
if(variants.length!==4)throw new Error('Missing exact garment variants');
const base='https://shittytees-git-stripe-printful-migration-audit-southernvt.vercel.app';
const designs=[{slug:'elected-not-housebroken',name:'Elected, Not Housebroken',art:'elected-art.png',mock:'elected-mockup.png'},{slug:'campaign-promises-batteries-not-included',name:'Campaign Promises — Batteries Not Included',art:'campaign-art.png',mock:'campaign-mockup.png'}];
const existing=await request('/store/products?limit=100');
for(const d of designs){
 const found=existing.find(p=>p.external_id==='shittytees-'+d.slug||p.name===d.name);
 if(found){console.log('POLITICS_DRAFT',JSON.stringify({name:d.name,id:found.id,existing:true}));continue;}
 for(const file of [d.art,d.mock]){const r=await fetch(base+'/images/designs/'+file);if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw new Error('Artwork URL inaccessible');}
 const result=await request('/store/products',{sync_product:{name:d.name,external_id:'shittytees-'+d.slug,thumbnail:base+'/images/designs/'+d.mock},sync_variants:variants.map(v=>({variant_id:v.id,external_id:d.slug+'-black-'+v.size.toLowerCase(),retail_price:'36.00',is_ignored:true,files:[{type:'front',url:base+'/images/designs/'+d.art}]}))});
 const verified=await request('/store/products/'+result.id);
 console.log('POLITICS_DRAFT',JSON.stringify({name:d.name,id:result.id,variants:verified.sync_variants?.map(v=>({id:v.id,size:v.size,color:v.color,ignored:v.is_ignored,fileStatus:v.files?.map(f=>f.status)})),publication:'draft',reason:'Print resolution and checkout verification pending'}));
}
