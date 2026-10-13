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
 const session=await stripe.checkout.sessions.retrieve('cs_test_a1pi57w3bnYm14hY74oEUBCP5up3xu9JxZiifsFeVJUrOJjf8d9TU3OlH6');
 const order=await getOrderRepository().getById(session.metadata?.orderId||'');
 if(!order||session.livemode)throw new Error('Saved sandbox quote missing');
 const quote=await quoteCostPlusOrder(order.items,order.shippingAddress);
 console.log('DESTINATION_CHECKOUT_PROOF',JSON.stringify({order:order.id,status:order.status,checkout:session.status,payment:session.payment_status,totalCents:session.amount_total,savedTotal:order.total,requotedTotal:quote.total,totalsMatch:order.total===quote.total&&Math.round(order.total*100)===session.amount_total,printfulOrder:order.printfulOrderId||null}));
 try {
  const result=(await printfulRequest<{url:string;types:string[]}>('/webhooks')).result;
  const url=result.url?new URL(result.url):undefined;
  console.log('NATIVE_CALLBACK_CONFIGURATION',JSON.stringify({read:true,configured:!!url,host:url?.hostname,path:url?.pathname,hasToken:!!url?.searchParams.get('token'),events:result.types}));
 }catch(error){console.log('NATIVE_CALLBACK_CONFIGURATION',JSON.stringify({read:false,status:error instanceof PrintfulError?error.status:undefined}));}
 await getPool().end();
}
main().catch(async()=>{console.error('Destination-checkout inspection failed');await getPool().end();process.exitCode=1});
