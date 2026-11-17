// Read-only diagnostic. Never prints credentials or customer/order details.
import Stripe from 'stripe';
if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'stripe-printful-migration-audit' || process.env.PRINTFUL_STORE_ID !== '18894982') throw new Error('Audit Preview only');
if (!/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY || '')) throw new Error('Stripe test key required');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const account = await stripe.accounts.retrieve();
if (account.id !== 'acct_1UPvlWRIGojPaEKC') throw new Error('Unexpected Stripe account');
console.log('READINESS_STRIPE', JSON.stringify({account: account.id, test: true, webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET), testDraftsEnabled: process.env.PRINTFUL_ENABLE_TEST_ORDERS === 'true', fulfillmentEnabled: process.env.PRINTFUL_ENABLE_FULFILLMENT === 'true', autoConfirm: process.env.PRINTFUL_AUTO_CONFIRM === 'true'}));
async function read(path) {
  const response = await fetch('https://api.printful.com' + path, {headers: {Authorization: 'Bearer ' + process.env.PRINTFUL_API_TOK, 'X-PF-Store-Id': '18894982'}, signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error('Printful read failed: ' + response.status);
  return (await response.json()).result;
}
try {const stores = await read('/stores'); console.log('READINESS_STORE', JSON.stringify(stores.filter(s => String(s.id) === '18894982').map(s => ({id:s.id, name:s.name, type:s.type}))));} catch { console.log('READINESS_STORE', JSON.stringify({store:18894982, type:'not-readable'})); }
const catalog = await read('/products/71');
console.log('READINESS_GARMENT', JSON.stringify({id:catalog.product.id, model:catalog.product.model, variants:catalog.variants.filter(v => [4016,4017,4018,4019].includes(v.id)).map(v => ({id:v.id,size:v.size,color:v.color,price:v.price,currency:v.currency,availability_status:v.availability_status}))}));
for (const id of [480976406,480976408]) {
 const product = await read('/store/products/' + id);
 console.log('READINESS_PRODUCT', JSON.stringify({id:product.sync_product.id,name:product.sync_product.name,variants:product.sync_variants.map(v => ({id:v.id,catalogId:v.variant_id,size:v.size,color:v.color,retailPrice:v.retail_price,ignored:v.is_ignored,files:v.files.map(f => ({id:f.id,type:f.type,width:f.width,height:f.height,dpi:f.dpi,status:f.status,position:f.position}))}))}));
}
