import { createPrintfulDraftOrder } from '@/lib/printful/orders';
import { FulfillmentDisabledError, PaymentNotConfirmedError, PrintfulDraftMissingError, UnresolvedVariantError } from '@/lib/orders/errors';
import { OrderRepository } from '@/lib/orders/repository';
import { StoreOrder } from '@/lib/orders/types';

function isFulfillmentEnabled(): boolean {
  return process.env.PRINTFUL_ENABLE_FULFILLMENT === 'true';
}

function canCreateDraft(order: StoreOrder): boolean {
  return order.status === 'paid' && !order.printfulOrderId;
}

export async function createDraftForOrder(repository: OrderRepository, orderId: string, source: 'admin_action' | 'stripe_webhook') {
  const order = await repository.getById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (!isFulfillmentEnabled()) {
    throw new FulfillmentDisabledError();
  }

  if (!canCreateDraft(order)) {
    if (order.status !== 'paid') {
      throw new PaymentNotConfirmedError(`Order status must be paid, found ${order.status}`);
    }
    return order;
  }

  if (order.items.some((item) => !item.printfulVariantId)) {
    throw new UnresolvedVariantError();
  }

  const printfulOrder = await createPrintfulDraftOrder(order, false);
  return repository.transitionStatus(
    order.id,
    ['paid'],
    'printful_draft_created',
    source,
    'Printful draft created',
    {
      printfulOrderId: printfulOrder.id,
      printfulExternalOrderId: String(printfulOrder.external_id || order.id),
    },
  );
}

export async function submitOrderToFulfillment(repository: OrderRepository, orderId: string, source: 'admin_action' | 'stripe_webhook') {
  const order = await repository.getById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (!isFulfillmentEnabled()) {
    throw new FulfillmentDisabledError();
  }

  if (order.status !== 'printful_draft_created' && order.status !== 'paid') {
    throw new PaymentNotConfirmedError(`Order cannot be submitted from ${order.status}`);
  }

  if (!order.printfulOrderId) {
    throw new PrintfulDraftMissingError();
  }

  return repository.transitionStatus(
    order.id,
    ['printful_draft_created', 'paid'],
    'submitted_to_printful',
    source,
    'Submitted to fulfillment',
    {
      fulfilled: true,
    },
  );
}
