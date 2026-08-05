import { printfulRequest } from './client';
import { PrintfulOrder, PrintfulRecipient, PrintfulOrderItem } from '../types/printful';
import { ShippingAddress, OrderItem } from '../types/order';

export interface CreatePrintfulOrderRequest {
  external_id: string;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  shipping: string;
  confirm: boolean;
}

export async function createPrintfulOrder(
  externalId: string,
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  },
  shippingAddress: ShippingAddress,
  items: OrderItem[],
  autoConfirm: boolean = false
): Promise<PrintfulOrder> {
  const recipient: PrintfulRecipient = {
    name: `${customer.firstName} ${customer.lastName}`,
    address1: shippingAddress.address,
    address2: shippingAddress.addressLine2,
    city: shippingAddress.city,
    state_code: shippingAddress.state.toUpperCase(),
    country_code: shippingAddress.country,
    zip: shippingAddress.postalCode,
    email: customer.email,
    phone: customer.phone || '',
  };

  const printfulItems: PrintfulOrderItem[] = items.map((item) => ({
    sync_variant_id: parseInt(item.printfulVariantId.split('_')[1] || '1'),
    quantity: item.quantity,
    name: item.name,
  }));

  const request: CreatePrintfulOrderRequest = {
    external_id: externalId,
    recipient,
    items: printfulItems,
    shipping: 'STANDARD',
    confirm: autoConfirm,
  };

  const response = await printfulRequest<PrintfulOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response.result;
}

export async function getPrintfulOrder(orderId: number): Promise<PrintfulOrder> {
  const response = await printfulRequest<PrintfulOrder>(`/orders/${orderId}`, {
    method: 'GET',
  });

  return response.result;
}

export async function confirmPrintfulOrder(orderId: number): Promise<PrintfulOrder> {
  const response = await printfulRequest<PrintfulOrder>(`/orders/${orderId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  return response.result;
}

export async function cancelPrintfulOrder(orderId: number): Promise<void> {
  await printfulRequest<void>(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
