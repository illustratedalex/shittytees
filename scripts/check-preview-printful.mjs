if(process.env.VERCEL_ENV!=='preview')throw new Error('Preview only');
const token=process.env.PRINTFUL_API_TOK;
if(!token)throw new Error('Preview token missing');
const r=await fetch('https://api.printful.com/store/products?limit=1',{headers:{Authorization:'Bearer '+token,'X-PF-Store-Id':'18894982'}});
const p=await r.json();
console.log('PRINTFUL_STORE_CHECK',JSON.stringify({status:r.status,storeId:'18894982',accessible:r.ok,productCount:p.paging?.total}));
if(!r.ok)process.exit(1);
