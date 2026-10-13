// Uses Stripe's official CLI to redeliver the original paid sandbox events.
// No simulated events or locally generated signatures; no live payment or order confirmation.
import {getStripe} from '../lib/stripe/client';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

async function main(){
 if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982'||process.env.PRINTFUL_ENABLE_TEST_ORDERS!=='true')throw new Error('Test-only Preview required');
 if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Live fulfillment must remain off');
 const stripe=getStripe();
 if((await stripe.accounts.retrieve()).id!=='acct_1UPvlWRIGojPaEKC')throw new Error('Wrong sandbox');
 const ids=['evt_1UQAAERIGojPaEKCP221kDZD','evt_1UQACMRIGojPaEKCaPUmDkaA'];
 for(const id of ids){
  const event=await stripe.events.retrieve(id);
  if(event.livemode||event.type!=='checkout.session.completed')throw new Error('Wrong event');
  const session=event.data.object;
  if(!('payment_status' in session)||session.payment_status!=='paid'||!session.metadata?.orderId?.startsWith('preview-e2e-20261013-'))throw new Error('Wrong test payment');
 }
 const endpoint=await stripe.webhookEndpoints.retrieve('we_1UPw5PRIGojPaEKCnoiFx8B6');
 if(endpoint.url!=='https://shittytees-git-stripe-printful-migration-audit-southernvt.vercel.app/api/stripe/webhook')throw new Error('Wrong webhook');
 const releaseResponse=await fetch('https://api.github.com/repos/stripe/stripe-cli/releases/latest');
 if(!releaseResponse.ok)throw new Error('CLI release unavailable');
 const release=await releaseResponse.json() as {assets:Array<{name:string;browser_download_url:string;digest?:string}>};
 const asset=release.assets.find(a=>a.name.endsWith('_linux_x86_64.tar.gz'));
 if(!asset?.browser_download_url.startsWith('https://github.com/stripe/stripe-cli/releases/download/')||!asset.digest?.startsWith('sha256:'))throw new Error('Official verified CLI release required');
 const archiveResponse=await fetch(asset.browser_download_url);
 if(!archiveResponse.ok)throw new Error('CLI archive unavailable');
 const archive=Buffer.from(await archiveResponse.arrayBuffer());
 if('sha256:'+createHash('sha256').update(archive).digest('hex')!==asset.digest)throw new Error('CLI digest mismatch');
 const dir=await mkdtemp(join(tmpdir(),'shittytees-stripe-'));
 try{
  await writeFile(join(dir,'stripe.tar.gz'),archive);
  execFileSync('tar',['-xzf',join(dir,'stripe.tar.gz'),'-C',dir]);
  for(const id of ids){
   execFileSync(join(dir,'stripe'),['events','resend',id,'--webhook-endpoint',endpoint.id,'--api-key',process.env.STRIPE_SECRET_KEY!],{encoding:'utf8',timeout:60000,stdio:'pipe'});
   console.log('STRIPE_EVENT_REDELIVERED',JSON.stringify({id,endpoint:endpoint.id,sandbox:true}));
  }
 }finally{await rm(dir,{recursive:true,force:true});}
}
main().catch(()=>{console.error('Sandbox event redelivery failed');process.exitCode=1});
