import {printfulRequest} from '../lib/printful/client';

async function main() {
  if (process.env.PRINTFUL_STORE_ID !== '18894982') throw new Error('Native store required');
  const response = await printfulRequest<{costs?: Record<string, unknown>}>('/orders/estimate-costs', {
    method: 'POST',
    body: JSON.stringify({
      recipient: {name: 'Checkout Verification', address1: '19749 Dearborn St', city: 'Chatsworth', state_code: 'CA', country_code: 'US', zip: '91311'},
      items: [{sync_variant_id: 5572208298, quantity: 1, retail_price: '13.92'}],
      shipping: 'STANDARD',
      retail_costs: {currency: 'USD', shipping: '0.00', tax: '0.00'},
    }),
  });
  // Log supplier amounts only; never credentials or customer/order information.
  console.log('SUPPLIER_COST_DIAGNOSTIC', JSON.stringify(response.result.costs));
}
main().catch(error => {
  console.error('Supplier cost inspection failed', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
