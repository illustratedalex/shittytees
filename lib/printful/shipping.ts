import { printfulRequest } from './client';
import { getSyncVariant } from './products';
import { buildPrintfulRecipient } from './orders';
import { StoreOrderItem, StoreShippingAddress } from '@/lib/orders/types';

export async function quoteStandardShipping(items: StoreOrderItem[], address: StoreShippingAddress): Promise<number> {
  const resolved = await Promise.all(items.map(async (item) => {
    const syncId = Number(item.printfulVariantId);
    if (!Number.isSafeInteger(syncId) || syncId <= 0) throw new Error('Invalid Printful sync variant');
    const variant = await getSyncVariant(syncId);
    const catalogId = variant.variant_id || variant.product?.variant_id;
    if (!catalogId) throw new Error('Printful catalog variant is unavailable');
    return { variant_id: catalogId, quantity: item.quantity };
  }));
  const response = await printfulRequest<Array<{ id: string; rate: string; currency: string }>>('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify({ recipient: buildPrintfulRecipient(address, address.email), items: resolved, currency: 'USD' }),
  });
  const rate = response.result.find((candidate) => candidate.id === 'STANDARD' && candidate.currency === 'USD');
  const dollars = Number(rate?.rate);
  if (!rate || !Number.isFinite(dollars) || dollars < 0) throw new Error('Standard shipping is unavailable for this address');
  return Math.round(dollars * 100) / 100;
}
