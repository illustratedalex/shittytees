import { printfulRequest } from './client';
import { buildPrintfulRecipient, mapOrderItemsToPrintful } from './orders';
import type { StoreOrderItem, StoreShippingAddress } from '@/lib/orders/types';

type Costs = { currency: string; subtotal: number | string; shipping: number | string; tax: number | string; total: number | string };

function cents(value: number | string) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) throw new Error('Invalid Printful cost');
  const result = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(result)) throw new Error('Printful cost exceeds limits');
  return result;
}

/** Estimation only: this endpoint does not create or confirm an order. */
export async function estimateFulfillmentCosts(items: StoreOrderItem[], address: StoreShippingAddress, retailShipping?: number) {
  const response = await printfulRequest<{ costs: Costs }>('/orders/estimate-costs', {
    method: 'POST',
    body: JSON.stringify({recipient: buildPrintfulRecipient(address, address.email), items: mapOrderItemsToPrintful(items), shipping: 'STANDARD', ...(retailShipping === undefined ? {} : {retail_costs:{currency:'USD',shipping:retailShipping.toFixed(2),tax:'0.00'}})}),
  });
  const costs = response.result.costs;
  if (costs?.currency !== 'USD') throw new Error('USD fulfillment costs are required');
  return { currency: 'USD', productionCents: cents(costs.subtotal), shippingCents: cents(costs.shipping), supplierTaxCents: cents(costs.tax), totalCents: cents(costs.total) };
}
