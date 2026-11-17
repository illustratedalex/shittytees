// Creates sandbox Checkout sessions and Preview-only snapshots for unpublished designs.
// No payment is taken here. The signed webhook creates an unconfirmed draft after test payment.
import {getStripe} from '../lib/stripe/client';
import {createCheckoutSession} from '../lib/stripe/checkout';
import {createPostgresOrderRepository} from '../lib/orders/postgresRepository';
import {getCatalogRepository} from '../lib/catalog';
import {getPool} from '../lib/orders/database';
import {generatePublicAccessToken,hashPublicAccessToken} from '../lib/orders/publicAccess';
import {quoteStandardShipping} from '../lib/printful/shipping';
import {printfulRequest} from '../lib/printful/client';
import type {StoreOrderItem} from '../lib/orders/types';

if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Audit Preview only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Live fulfillment must remain disabled');
const address={firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'};
const base='https://shittytees-git-stripe-printful-migration-audit-southernvt.vercel.app';
const specs=[{slug:'elected-not-housebroken',product:480976406,sync:5569301209,file:1085648812},{slug:'campaign-promises-batteries-not-included',product:480976408,sync:5569301218,file:1085648838}];
type Detail={sync_product:{id:number;name:string};sync_variants:Array<{id:number;variant_id:number;size:string;color:string;files:Array<{id:number;type:string;width:number;height:number;status:string}>}>};
async function main(){
 const stripe=getStripe();
 if((await stripe.accounts.retrieve()).id!=='acct_1UPvlWRIGojPaEKC')throw new Error('Wrong Stripe sandbox');
 const repo=createPostgresOrderRepository();
 for(const spec of specs){
  const id='preview-e2e-20261013-'+spec.slug;
  const existing=await repo.getById(id);
  if(existing?.stripeCheckoutSessionId){
   const session=await stripe.checkout.sessions.retrieve(existing.stripeCheckoutSessionId);
   if(session.livemode)throw new Error('Unexpected live session');
   console.log('TEST_CHECKOUT',JSON.stringify({order:id,session:session.id,status:session.status,paymentStatus:session.payment_status,existing:true}));
   continue;
  }
  if(existing)throw new Error('Incomplete test snapshot requires review');
  const product=await getCatalogRepository().getBySlug(spec.slug);
  const variant=product?.variants.find(v=>v.size==='S'&&v.color==='Black');
  if(!product||product.publishStatus!=='draft'||!variant||variant.available||variant.printfulVariantId!==String(spec.sync))throw new Error('Test-only draft mapping mismatch');
  const detail=(await printfulRequest<Detail>('/store/products/'+spec.product)).result;
  const remote=detail.sync_variants.find(v=>v.id===spec.sync);
  if(!remote||remote.variant_id!==4016||!remote.files.some(f=>f.id===spec.file&&f.width===3000&&f.height===4000&&f.status==='ok'))throw new Error('Uploaded print master is not verified');
  const token=generatePublicAccessToken();
  const item:StoreOrderItem={id:id+'-item',productId:product.id,productSlug:product.slug,localVariantId:variant.id,printfulVariantId:String(spec.sync),name:product.name,size:'S',color:'Black',quantity:1,unitPrice:variant.retailPrice,image:product.images[0].src};
  const shipping=await quoteStandardShipping([item],address);
  const total=Math.round((item.unitPrice+shipping)*100)/100;
  await repo.create({id,publicTokenHash:hashPublicAccessToken(token),status:'pending_payment',customerEmail:address.email,shippingAddress:address,items:[item],subtotal:item.unitPrice,shipping,tax:0,total,currency:'USD',fulfilled:false});
  const session=await createCheckoutSession({items:[{productId:product.id,variantId:variant.id,printfulVariantId:String(spec.sync),quantity:1,name:product.name,image:item.image,size:'S',color:'Black',unitPrice:item.unitPrice}],shippingAddress:address,baseUrl:base,orderId:id,orderAccessToken:token,shipping});
  if(session.livemode||!session.id.startsWith('cs_test_'))throw new Error('Unexpected live session');
  await repo.update(id,{stripeCheckoutSessionId:session.id});
  console.log('TEST_CHECKOUT',JSON.stringify({order:id,session:session.id,status:session.status,paymentStatus:session.payment_status,total,sandbox:true}));
 }
 await getPool().end();
}
main().catch(async()=>{console.error('Test Checkout preparation failed');await getPool().end();process.exitCode=1});
