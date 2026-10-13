import {getStripe} from '../lib/stripe/client';
import {getOrderRepository} from '../lib/orders';
import {getPool} from '../lib/orders/database';
import {printfulRequest} from '../lib/printful/client';
import {quoteCostPlusOrder} from '../lib/pricing/quote';
import {PrintfulError} from '../lib/printful/errors';
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Audit Preview only');
async function main(){
 const stripe=getStripe();
 if((await stripe.accounts.retrieve()).id!=='acct_1UPvlWRIGojPaEKC')throw new Error('Incorrect sandbox');
 for(const sessionId of ['cs_test_a1pi57w3bnYm14hY74oEUBCP5up3xu9JxZiifsFeVJUrOJjf8d9TU3OlH6','cs_test_a18LXLAGpqsVhNQ77cT5i0hSA4PPP9OQhYfTSSmzJd3a1WMOtrsEOCQjuz']){
 const session=await stripe.checkout.sessions.retrieve(sessionId);
 const order=await getOrderRepository().getById(session.metadata?.orderId||'');
 if(!order||session.livemode)throw new Error('Saved sandbox quote missing');
 const quote=await quoteCostPlusOrder(order.items,order.shippingAddress);
 console.log('DESTINATION_CHECKOUT_PROOF',JSON.stringify({order:order.id,status:order.status,checkout:session.status,payment:session.payment_status,totalCents:session.amount_total,savedTotal:order.total,requotedTotal:quote.total,totalsMatch:order.total===quote.total&&Math.round(order.total*100)===session.amount_total,printfulOrder:order.printfulOrderId||null}));
 if(order.printfulOrderId){
  const draft=(await printfulRequest<{id:number;status:string;costs:{total:string};retail_costs:{total:string;shipping:string};items:Array<{sync_variant_id:number;variant_id:number;quantity:number;retail_price:string;files:Array<{id:number;type:string}>}>}>('/orders/'+order.printfulOrderId)).result;
  const events=await stripe.events.list({type:'checkout.session.completed',limit:30});
  const event=events.data.find(e=>'id' in e.data.object&&e.data.object.id===session.id);
  const receipt=event?await getPool().query('SELECT processed_at FROM processed_webhook_events WHERE provider=$1 AND event_id=$2',['stripe',event.id]):undefined;
  console.log('DESTINATION_DRAFT_PROOF',JSON.stringify({id:draft.id,status:draft.status,costs:draft.costs,retailTotal:draft.retail_costs?.total,retailShipping:draft.retail_costs?.shipping,event:event?.id,signedReceiptProcessed:!!receipt?.rows[0]?.processed_at,items:draft.items.map(i=>({syncVariant:i.sync_variant_id,catalogVariant:i.variant_id,quantity:i.quantity,retailPrice:i.retail_price,files:i.files.map(f=>({id:f.id,type:f.type}))}))}));
 }
 }
 try {
  const result=(await printfulRequest<{url:string;types:string[]}>('/webhooks')).result;
  const url=result.url?new URL(result.url):undefined;
  console.log('NATIVE_CALLBACK_CONFIGURATION',JSON.stringify({read:true,configured:!!url,host:url?.hostname,path:url?.pathname,hasToken:!!url?.searchParams.get('token'),events:result.types}));
 }catch(error){console.log('NATIVE_CALLBACK_CONFIGURATION',JSON.stringify({read:false,status:error instanceof PrintfulError?error.status:undefined}));}
 await getPool().end();
}
main().catch(async()=>{console.error('Destination-checkout inspection failed');await getPool().end();process.exitCode=1});
