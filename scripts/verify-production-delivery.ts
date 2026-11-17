import {getStripe} from '../lib/stripe/client';
import {getPool} from '../lib/orders/database';
import {printfulRequest} from '../lib/printful/client';
import {printfulWebhookToken} from '../lib/printful/webhookAuth';
import type Stripe from 'stripe';
const endpointId='we_1UQCEXIsn0OPIJry4vhIvy20';
const required:Stripe.WebhookEndpointUpdateParams.EnabledEvent[]=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','charge.refunded'];
if(process.env.VERCEL_ENV!=='production'||process.env.PRINTFUL_STORE_ID!=='18894982'||process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Verify native Production before fulfillment');
async function main(){
 const stripe=getStripe();
 if((await stripe.accounts.retrieve()).id!=='acct_1UPvlRIsn0OPIJry')throw new Error('Incorrect merchant');
 const endpoint=await stripe.webhookEndpoints.retrieve(endpointId);
 if(endpoint.url!=='https://shittytees.com/api/stripe/webhook'||endpoint.status!=='enabled'||!required.every(e=>endpoint.enabled_events.includes(e)))throw new Error('Unexpected endpoint');
 // A real expired-session event exercises Stripe signing without a payment.
 await stripe.webhookEndpoints.update(endpointId,{enabled_events:[...required,'checkout.session.expired']});
 try {
  const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{price_data:{currency:'usd',unit_amount:3600,product_data:{name:'Internal signed-webhook verification'}},quantity:1}],success_url:'https://shittytees.com/checkout/success',cancel_url:'https://shittytees.com/cart',metadata:{verificationProbe:'shittytees-live-signature-20261013'}},{idempotencyKey:'shittytees-live-signature-20261013'});
  if(session.status!=='expired')await stripe.checkout.sessions.expire(session.id);
  let eventId:string|undefined,processed=false;
  for(let attempt=0;attempt<20;attempt++){
   const events=await stripe.events.list({type:'checkout.session.expired',limit:30});
   const event=events.data.find(e=>(e.data.object as Stripe.Checkout.Session).id===session.id);
   eventId=event?.id;
   if(eventId){const receipt=await getPool().query('SELECT processed_at FROM processed_webhook_events WHERE provider=$1 AND event_id=$2',['stripe',eventId]);processed=!!receipt.rows[0]?.processed_at;}
   if(processed)break;
   await new Promise(resolve=>setTimeout(resolve,2000));
  }
  console.log('PRODUCTION_SIGNED_WEBHOOK_PROOF',JSON.stringify({event:eventId,processed,expired:true,paid:false,charged:false}));
  if(!processed)throw new Error('Signed receipt not observed');
 } finally {
  await stripe.webhookEndpoints.update(endpointId,{enabled_events:required});
  const restored=await stripe.webhookEndpoints.retrieve(endpointId);
  console.log('PRODUCTION_WEBHOOK_EVENTS_RESTORED',JSON.stringify({events:restored.enabled_events}));
 }
 const configured=(await printfulRequest<{url:string}>('/webhooks')).result;
 const callback=new URL(configured.url);
 if(callback.origin!=='https://shittytees.com'||callback.pathname!=='/api/printful/webhook'||callback.searchParams.get('token')!==printfulWebhookToken())throw new Error('Incorrect native callback');
 const probe={id:'internal-native-callback-verification-20261013',type:'order_updated',store:18894982,data:{order:{id:0}}};
 const response=await fetch(callback,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(probe)});
 const rejected=await fetch('https://shittytees.com/api/printful/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(probe)});
 console.log('PRODUCTION_NATIVE_CALLBACK_PROOF',JSON.stringify({configuredUrlMatched:true,authenticatedStatus:response.status,unauthenticatedStatus:rejected.status,syntheticEndpointProbe:true}));
 if(response.status!==200||rejected.status!==401)throw new Error('Native callback check failed');
 await getPool().end();
}
main().catch(async()=>{console.error('Production delivery verification failed; inspect sanitized proof lines');await getPool().end();process.exitCode=1});
