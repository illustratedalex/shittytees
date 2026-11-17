import {getOrderRepository} from '../lib/orders';
import {getPool} from '../lib/orders/database';
import {getStripe} from '../lib/stripe/client';
import {printfulRequest} from '../lib/printful/client';
import {printfulExternalId} from '../lib/printful/orders';
async function main(){
 if(process.env.VERCEL_ENV!=='production'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Native production only');
 const stripe=getStripe();if((await stripe.accounts.retrieve()).id!=='acct_1UPvlRIsn0OPIJry')throw new Error('Wrong merchant');
 const result=await getOrderRepository().list({page:1,pageSize:15});
 const recent=result.orders.filter(o=>o.customerEmail!=='test@example.com'&&Date.now()-new Date(o.createdAt).getTime()<2*60*60*1000);
 for(const o of recent){
  const session=o.stripeCheckoutSessionId?await stripe.checkout.sessions.retrieve(o.stripeCheckoutSessionId):null;
  let supplier:unknown=null;
  try{const id=o.printfulOrderId||'@'+printfulExternalId(o.id);const p=(await printfulRequest<{id:number;status:string;error?:unknown;items:Array<{sync_variant_id:number;quantity:number;name:string}>}>('/orders/'+id)).result;supplier={id:p.id,status:p.status,error:p.error,items:p.items.map(i=>({variant:i.sync_variant_id,quantity:i.quantity,name:i.name}))};}catch{supplier={found:false};}
  console.log('RECENT_ORDER_STATUS',JSON.stringify({order:o.id.slice(0,8),created:o.createdAt,status:o.status,total:o.total,currency:o.currency,payment:session?{status:session.payment_status,checkout:session.status,live:session.livemode,amount:session.amount_total}:null,items:o.items.map(i=>({name:i.name,size:i.size,color:i.color,quantity:i.quantity})),mappingError:o.mappingError,supplier}));
 }
 if(!recent.length)console.log('RECENT_ORDER_STATUS',JSON.stringify({found:false}));
 await getPool().end();
}
main().catch(async e=>{console.error('Order inspection failed',e instanceof Error?e.message:'unknown');await getPool().end();process.exitCode=1});
