import { printfulRequest } from './client';
import { buildPrintfulRecipient, mapOrderItemsToPrintful } from './orders';
import type { StoreOrderItem, StoreShippingAddress } from '@/lib/orders/types';

type Costs = { currency: string; subtotal: number | string; shipping: number | string; tax: number | string; total: number | string };

function cents(value: number | string) {
  if (typeof value === 'string') {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) throw new Error('Invalid Printful cost');
  } else if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('Invalid Printful cost');
  }
  const scaled = Number(value) * 100;
  const result = Math.round(scaled);
  if (!Number.isSafeInteger(result)) throw new Error('Printful cost exceeds limits');
  // Numeric API amounts can contain binary floating-point noise, e.g.
  // 5.3500000000000005. Accept cent values within rounding error only;
  // genuine fractional-cent prices must still fail closed.
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4;
  if (Math.abs(scaled - result) > tolerance) throw new Error('Invalid Printful cost');
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
