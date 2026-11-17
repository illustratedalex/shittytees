import {getStripe} from '../lib/stripe/client';
const env=process.env.VERCEL_ENV;
if(!['production','preview'].includes(env||''))throw new Error('Hosted environments only');
if(env==='preview'&&process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit')throw new Error('Audit Preview only');
if(process.env.PRINTFUL_ENABLE_FULFILLMENT==='true'||process.env.PRINTFUL_AUTO_CONFIRM==='true')throw new Error('Configure before fulfillment');
async function main(){
 const stripe=getStripe();
 const account=await stripe.accounts.retrieve();
 if(account.id!==(env==='production'?'acct_1UPvlRIsn0OPIJry':'acct_1UPvlWRIGojPaEKC'))throw new Error('Incorrect merchant');
 const configs=await stripe.paymentMethodConfigurations.list({limit:100});
 const defaults=configs.data.filter(c=>c.active&&c.is_default&&!c.application);
 if(defaults.length!==1||!defaults[0].card?.available)throw new Error('Default card configuration unavailable');
 const config=defaults[0];
 const saved=config.link?.display_preference.value==='off'?config:await stripe.paymentMethodConfigurations.update(config.id,{link:{display_preference:{preference:'off'}}});
 if(saved.link?.display_preference.value!=='off')throw new Error('Link disabling did not take effect');
 console.log('CARD_CHECKOUT_CONFIGURATION',JSON.stringify({account:account.id,config:saved.id,cardAvailable:saved.card?.available,linkEnabled:false}));
}
main().catch(()=>{console.error('Card checkout configuration failed');process.exitCode=1});
