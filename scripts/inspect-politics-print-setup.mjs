if(process.env.VERCEL_ENV!=='preview')throw new Error('Preview only');
const h={Authorization:'Bearer '+process.env.PRINTFUL_API_TOK,'X-PF-Store-Id':'18894982'};
for(const path of ['/mockup-generator/printfiles/71','/store/products/480976406','/store/products/480976408']){
const r=await fetch('https://api.printful.com'+path,{headers:h});const p=await r.json();
if(!r.ok)throw new Error('Printful read failed '+r.status);
if(path.includes('printfiles'))console.log('PRINT_TEMPLATES',JSON.stringify(p.result));
else console.log('POLITICS_VARIANTS',JSON.stringify({id:p.result.sync_product.id,variants:p.result.sync_variants.map(v=>({id:v.id,variant_id:v.variant_id,size:v.size,color:v.color,price:v.retail_price,files:v.files.map(f=>({id:f.id,type:f.type,width:f.width,height:f.height,status:f.status}))}))}));
}
