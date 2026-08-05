import { printfulRequest } from './client';
import { PrintfulDraftOrderPayload, PrintfulOrder, PrintfulRecipient } from './types';
import { StoreOrder, StoreOrderItem } from '@/lib/orders/types';

export type ResolvedPrintfulOrderItem = {
  sync_variant_id: number;
  quantity: number;
  name: string;
};

export function buildPrintfulRecipient(shippingAddress: StoreOrder['shippingAddress'], email: string, phone?: string): PrintfulRecipient {
  return {
    name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
    address1: shippingAddress.address,
    address2: shippingAddress.addressLine2,
    city: shippingAddress.city,
    state_code: shippingAddress.state.toUpperCase(),
    country_code: shippingAddress.country,
    zip: shippingAddress.postalCode,
    email,
    phone,
  };
}

export function mapOrderItemsToPrintful(items: StoreOrderItem[]): ResolvedPrintfulOrderItem[] {
  return items.map((item) => ({
    sync_variant_id: Number(item.printfulVariantId),
    quantity: item.quantity,
    name: item.name,
  }));
}

export async function createPrintfulDraftOrder(order: StoreOrder, confirm = false): Promise<PrintfulOrder> {
  const payload: PrintfulDraftOrderPayload = {
    external_id: order.id,
    recipient: buildPrintfulRecipient(order.shippingAddress, order.customerEmail),
    items: mapOrderItemsToPrintful(order.items),
    shipping: 'STANDARD',
    confirm,
  };

  const response = await printfulRequest<PrintfulOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.result;
}

export async function getPrintfulOrder(orderId: number): Promise<PrintfulOrder> {
  return (await printfulRequest<PrintfulOrder>(`/orders/${orderId}`, { method: 'GET' })).result;
}

export async function confirmPrintfulOrder(orderId: number): Promise<PrintfulOrder> {
  return (await printfulRequest<PrintfulOrder>(`/orders/${orderId}/confirm`, { method: 'POST', body: JSON.stringify({}) })).result;
}

export async function cancelPrintfulOrder(orderId: number): Promise<void> {
  await printfulRequest<void>(`/orders/${orderId}/cancel`, { method: 'POST', body: JSON.stringify({}) });
}
