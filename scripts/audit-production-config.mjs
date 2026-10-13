// Production configuration/permission audit. Always stops before publishing.
import pg from 'pg';
async function read(url, token, headers = {}) {
  const response = await fetch(url, {headers: {Authorization: `Bearer ${token}`, ...headers}});
  if (!response.ok) throw new Error(`Provider read failed: HTTP ${response.status}`);
  return response.json();
}
async function main() {
  if (process.env.VERCEL_ENV !== 'production') throw new Error('Production only');
  const key = process.env.STRIPE_SECRET_KEY;
  console.log('PRODUCTION_KEY_KIND', JSON.stringify({liveSecret:key?.startsWith('sk_live_')||false,liveRestricted:key?.startsWith('rk_live_')||false,test:key?.startsWith('sk_test_')||key?.startsWith('rk_test_')||false,present:!!key}));
  if (!key?.startsWith('sk_live_') && !key?.startsWith('rk_live_')) throw new Error('Live Stripe key required');
  const account = await read('https://api.stripe.com/v1/account', key);
  console.log('PRODUCTION_ACCOUNT_ID',account.id);
  if (account.id !== 'acct_1UPvlRIsn0OPIJry') throw new Error('Wrong merchant');
  const endpoints = await read('https://api.stripe.com/v1/webhook_endpoints?limit=100', key);
  const required = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'charge.refunded'];
  const webhook = endpoints.data.find(e => e.url === 'https://shittytees.com/api/stripe/webhook' && e.status === 'enabled');
  console.log('PRODUCTION_STRIPE_AUDIT', JSON.stringify({account: account.id, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, webhook: webhook?.id, webhookEventsValid: !!webhook && required.every(e => webhook.enabled_events.includes(e) || webhook.enabled_events.includes('*')), signingSecretPresent: !!process.env.STRIPE_WEBHOOK_SECRET}));
  // Verify the restricted key can create Checkout, then immediately expire it.
  // No URL is published, no payment method is supplied and no charge is made.
  const form = new URLSearchParams({mode:'payment','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':'3600','line_items[0][price_data][product_data][name]':'Internal checkout permission check','line_items[0][quantity]':'1',success_url:'https://shittytees.com/checkout/success',cancel_url:'https://shittytees.com/cart','metadata[internalVerification]':'20261013-production-permissions'});
  const creation = await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'production-permission-check-20261013'},body:form});
  if (!creation.ok) throw new Error(`Checkout permission failed: HTTP ${creation.status}`);
  const session = await creation.json();
  const expiry = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}/expire`,{method:'POST',headers:{Authorization:`Bearer ${key}`}});
  if (!expiry.ok) throw new Error(`Checkout expiry failed: HTTP ${expiry.status}`);
  const expired = await expiry.json();
  console.log('PRODUCTION_CHECKOUT_PERMISSION',JSON.stringify({created:!!session.id,expired:expired.status==='expired',payment:expired.payment_status,live:expired.livemode}));
  for (const id of [480976406,480976408]) {
    const product = await read(`https://api.printful.com/store/products/${id}`, process.env.PRINTFUL_API_TOK, {'X-PF-Store-Id':'18894982'});
    console.log('PRODUCTION_PRINTFUL_PRODUCT',JSON.stringify({id:product.result.sync_product.id,variants:product.result.sync_variants.map(v=>({id:v.id,size:v.size,color:v.color,catalogVariant:v.variant_id,files:v.files.map(f=>({id:f.id,status:f.status,type:f.type}))}))}));
  }
  console.log('PRODUCTION_PRINTFUL_AUDIT', JSON.stringify({configuredNativeStore: process.env.PRINTFUL_STORE_ID === '18894982', fulfillmentEnabled: ['true','1'].includes(process.env.PRINTFUL_ENABLE_FULFILLMENT), autoConfirm: ['true','1'].includes(process.env.PRINTFUL_AUTO_CONFIRM)}));
  const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized:false}});
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('catalog_products','catalog_variants','orders','processed_webhook_events','order_status_events') ORDER BY table_name");
    console.log('PRODUCTION_DATABASE_AUDIT', JSON.stringify({connected:true,tables:tables.rows.map(r=>r.table_name),demoCheckout:process.env.NEXT_PUBLIC_DEMO_CHECKOUT==='true'}));
  } finally { await pool.end(); }
}
main().catch(error => console.error('PRODUCTION_AUDIT_FAILED', /^(Production only|Live Stripe key required|Wrong merchant|Provider read failed: HTTP \d+|Checkout (permission|expiry) failed: HTTP \d+)$/.test(error.message) ? error.message : 'Check failed')).finally(() => {
  console.log('AUDIT_ONLY: deliberately stopping before website build or alias changes');
  process.exitCode=1;
});
