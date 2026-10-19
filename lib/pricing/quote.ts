import { calculateCostPlusTotal } from './costPlus';
import { estimateFulfillmentCosts } from '@/lib/printful/costs';
import type { StoreOrderItem, StoreShippingAddress } from '@/lib/orders/types';

// Published US online-card fee including the international-card allowance.
// Keep cards/wallets only while this profile is used; BNPL has different fees.
export const CARD_FEE_ALLOWANCE = {basisPoints:440,fixedCents:30};
type Estimate = typeof estimateFulfillmentCosts;

export async function quoteCostPlusOrder(items: StoreOrderItem[], address: StoreShippingAddress, estimate: Estimate = estimateFulfillmentCosts) {
  const quantity = items.reduce((sum,item)=>sum+item.quantity,0);
  const subtotalCents = items.reduce((sum,item)=>sum+Math.round(item.unitPrice*100)*item.quantity,0);
  if (quantity<1 || quantity>100) throw new Error('Order quantity exceeds limit');
  let shippingCents = 0;
  // Retail prices affect supplier tax in some destinations. Estimate with the
  // exact retail amounts that will be sent on the eventual fulfillment order.
  for(let attempt=0;attempt<12;attempt++) {
    const costs = await estimate(items,address,shippingCents/100);
    const priced = calculateCostPlusTotal(costs.totalCents,quantity,CARD_FEE_ALLOWANCE);
    const nextShipping = priced.totalCents-subtotalCents;
    if(nextShipping<0) throw new Error('Catalog prices require review');
    if(nextShipping===shippingCents) return {subtotal:subtotalCents/100,shipping:shippingCents/100,tax:0,total:priced.totalCents/100};
    shippingCents=nextShipping;
  }
  throw new Error('Destination price could not be confirmed');
}
