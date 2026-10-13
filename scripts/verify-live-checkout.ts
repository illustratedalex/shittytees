import {getCatalogRepository} from '../lib/catalog';
import {getStripe} from '../lib/stripe/client';
import {getPool} from '../lib/orders/database';
if(process.env.VERCEL_ENV!=='production'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Native Production only');
async function main(){
 const stripe=getStripe();
 if((await stripe.accounts.retrieve()).id!=='acct_1UPvlRIsn0OPIJry')throw new Error('Wrong merchant');
 const products=await getCatalogRepository().listPublic();
 for(const productId of ['480976406','480976408']){
  const product=products.find(p=>p.printfulProductId===productId);
  const v=product?.variants.find(v=>v.available&&v.size==='M');
  if(!product||!v)throw new Error('Verified product unavailable');
  const quoteResponse=await fetch('https://shittytees.com/api/checkout/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{productId:product.id,variantId:v.id,quantity:1,name:product.name,image:product.images[0].src,size:v.size,color:v.color,unitPrice:v.retailPrice,printfulVariantId:v.printfulVariantId}],shippingAddress:{firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'}})});
  const quote=await quoteResponse.json();
  if(!quoteResponse.ok||quote.total!==21.55)throw new Error('Live price quote failed '+quoteResponse.status);
  const response=await fetch('https://shittytees.com/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:quote.orderId,token:quote.token})});
  const checkout=await response.json();
  if(!response.ok||!checkout.url||checkout.isDemo)throw new Error('Live session failed '+response.status);
  const order=await getPool().query('SELECT stripe_checkout_session_id FROM orders WHERE id=$1',[quote.orderId]);
  const id=order.rows[0]?.stripe_checkout_session_id;
  if(!id)throw new Error('Live session snapshot missing');
  const session=await stripe.checkout.sessions.retrieve(id);
  try {if(!session.livemode||session.amount_total!==2155||session.payment_status!=='unpaid'||session.status!=='open')throw new Error('Live session verification failed');}
  finally{await stripe.checkout.sessions.expire(id);}
  const expired=await stripe.checkout.sessions.retrieve(id);
  console.log('LIVE_CHECKOUT_PROOF',JSON.stringify({slug:product.slug,order:quote.orderId,session:id,live:session.livemode,total:quote.total,expired:expired.status==='expired',payment:expired.payment_status,charged:false,printfulStore:18894982}));
 }
 await getPool().end();
}
main().catch(async e=>{console.error('Live checkout verification failed:',e instanceof Error?e.message:'unknown');await getPool().end();process.exitCode=1});
