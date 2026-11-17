import {getStripe} from '../lib/stripe/client';
import {quoteStandardShipping} from '../lib/printful/shipping';
import {getPool} from '../lib/orders/database';
if(process.env.VERCEL_ENV!=='preview')throw new Error('Preview only');
async function main(){
 try {const a=await getStripe().accounts.retrieve();console.log('STRIPE_CHECK',JSON.stringify({id:a.id,expected:a.id==='acct_1UPvlWRIGojPaEKC'}));}catch{console.log('STRIPE_CHECK',JSON.stringify({authenticated:false}));}
 try {const shipping=await quoteStandardShipping([{id:'preview-check',productId:'politics-elected',productSlug:'elected-not-housebroken',localVariantId:'preview-s',printfulVariantId:'5569301209',name:'Elected, Not Housebroken',size:'S',color:'Black',quantity:1,unitPrice:36,image:''}],{firstName:'Alexander',lastName:'Lawrence',email:'illustratedalex@gmail.com',address:'18 Opera House Square',city:'Claremont',state:'NH',postalCode:'03743',country:'US'});console.log('SHIPPING_CHECK',JSON.stringify({ok:true,shipping}));}catch(e){console.log('SHIPPING_CHECK',JSON.stringify({ok:false,message:e instanceof Error?e.message:'Failed'}));}
 try{const r=await getPool().query("SELECT COUNT(*)::int AS count FROM catalog_products");console.log('CATALOG_CHECK',JSON.stringify(r.rows[0]));}finally{await getPool().end();}
}
main().catch(()=>{console.error('Preview check failed');process.exitCode=1});
