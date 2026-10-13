// Read-only production audit. Always fails the build to prevent publishing it.
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
  const store = await read('https://api.printful.com/store', process.env.PRINTFUL_API_TOK, {'X-PF-Store-Id':'18894982'});
  console.log('PRODUCTION_PRINTFUL_AUDIT', JSON.stringify({nativeStore: store.result?.id, configuredNativeStore: process.env.PRINTFUL_STORE_ID === '18894982', fulfillmentEnabled: ['true','1'].includes(process.env.PRINTFUL_ENABLE_FULFILLMENT), autoConfirm: ['true','1'].includes(process.env.PRINTFUL_AUTO_CONFIRM)}));
  const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized:false}});
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('products','product_variants','orders','processed_webhook_events','order_status_events') ORDER BY table_name");
    console.log('PRODUCTION_DATABASE_AUDIT', JSON.stringify({connected:true,tables:tables.rows.map(r=>r.table_name),demoCheckout:process.env.NEXT_PUBLIC_DEMO_CHECKOUT==='true'}));
  } finally { await pool.end(); }
}
main().catch(error => console.error('PRODUCTION_AUDIT_FAILED', /^(Production only|Live Stripe key required|Wrong merchant|Provider read failed: HTTP \d+)$/.test(error.message) ? error.message : 'Read-only check failed')).finally(() => {
  console.log('AUDIT_ONLY: deliberately stopping before website build or alias changes');
  process.exitCode=1;
});
