import {printfulRequest} from '../lib/printful/client';
import {printfulWebhookToken} from '../lib/printful/webhookAuth';
if(process.env.VERCEL_ENV!=='production'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Verified native Production only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Configure before enabling fulfillment');
async function main(){
 const current=(await printfulRequest<{url:string;types:string[]}>('/webhooks')).result;
 if(current.url){const parsed=new URL(current.url);if(parsed.origin!=='https://shittytees.com'||parsed.pathname!=='/api/printful/webhook')throw new Error('Unexpected existing callback');}
 const token=printfulWebhookToken();
 const url='https://shittytees.com/api/printful/webhook?token='+token;
 const types=['package_shipped','package_returned','order_failed','order_canceled'];
 await printfulRequest('/webhooks',{method:'POST',body:JSON.stringify({url,types})});
 const verified=(await printfulRequest<{url:string;types:string[]}>('/webhooks')).result;
 if(verified.url!==url||!types.every(type=>verified.types.includes(type)))throw new Error('Callback verification failed');
 console.log('NATIVE_CALLBACK_CONFIGURED',JSON.stringify({store:18894982,host:'shittytees.com',path:'/api/printful/webhook',credentialVerified:true,events:verified.types}));
}
main().catch(()=>{console.error('Native callback configuration failed');process.exitCode=1});
