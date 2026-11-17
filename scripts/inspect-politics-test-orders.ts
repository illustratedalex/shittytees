// Read-only audit of real sandbox payments, signed-webhook receipts and unconfirmed drafts.
import {getStripe} from '../lib/stripe/client';
import {createPostgresOrderRepository} from '../lib/orders/postgresRepository';
import {getPool} from '../lib/orders/database';
import {printfulRequest} from '../lib/printful/client';

if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Audit Preview only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Live fulfillment must remain disabled');
const slugs=['elected-not-housebroken','campaign-promises-batteries-not-included'];
type Draft={id:number;status:string;external_id:string;items:Array<{sync_variant_id:number;variant_id:number;quantity:number;files:Array<{id:number;type:string}>}>};
async function main(){
 const stripe=getStripe();
 if((await stripe.accounts.retrieve()).id!=='acct_1UPvlWRIGojPaEKC')throw new Error('Wrong Stripe sandbox');
 const repo=createPostgresOrderRepository();
 const events=await stripe.events.list({type:'checkout.session.completed',limit:20});
 for(const slug of slugs){
  const id='preview-e2e-20261013-'+slug;
  const order=await repo.getById(id);
  if(!order?.stripeCheckoutSessionId)throw new Error('Test snapshot missing');
  const session=await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
  if(session.livemode)throw new Error('Unexpected live session');
  const event=events.data.find(e=>'id' in e.data.object&&e.data.object.id===session.id);
  const receipt=event?await getPool().query('SELECT event_id,event_type,processed_at FROM processed_webhook_events WHERE provider=$1 AND event_id=$2',['stripe',event.id]):undefined;
  const history=await getPool().query('SELECT previous_status,next_status,source FROM order_status_events WHERE order_id=$1 ORDER BY created_at',[id]);
  const draft=order.printfulOrderId?(await printfulRequest<Draft>('/orders/'+order.printfulOrderId)).result:undefined;
  console.log('TEST_ORDER_PROOF',JSON.stringify({order:id,status:order.status,sandbox:!session.livemode,payment:session.payment_status,checkout:session.status,totalCents:session.amount_total,webhookEvent:event?.id,webhookProcessed:!!receipt?.rows[0]?.processed_at,history:history.rows,printful:draft?{id:draft.id,status:draft.status,externalId:draft.external_id,items:draft.items.map(i=>({syncVariant:i.sync_variant_id,catalogVariant:i.variant_id,quantity:i.quantity,files:i.files.map(f=>({id:f.id,type:f.type}))}))}:null,hasMappingError:!!order.mappingError}));
 }
 await getPool().end();
}
main().catch(async()=>{console.error('Test-order inspection failed');await getPool().end();process.exitCode=1});
