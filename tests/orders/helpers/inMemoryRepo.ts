import { OrderRepository } from '@/lib/orders/repository';
import { canTransition } from '@/lib/orders/transitions';
import { OrderListOptions, OrderListResult, OrderStatus, ProcessedWebhookEvent, StoreOrder } from '@/lib/orders/types';
import { hashPublicAccessToken } from '@/lib/orders/publicAccess';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createInMemoryRepository(): OrderRepository {
  const orders = new Map<string, StoreOrder>();
  const events = new Set<string>();

  const listResult = (options: OrderListOptions = {}): OrderListResult => {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.pageSize || 25);
    let records = [...orders.values()];
    if (options.status) records = records.filter((order) => order.status === options.status);
    if (options.search) {
      const q = options.search.toLowerCase();
      records = records.filter((order) => order.id.toLowerCase().includes(q) || order.customerEmail.toLowerCase().includes(q));
    }
    const total = records.length;
    const offset = (page - 1) * pageSize;
    const paged = records.slice(offset, offset + pageSize);
    return {
      orders: clone(paged),
      page,
      pageSize,
      total,
    };
  };

  return {
    async create(input) {
      const existing = orders.get(input.id);
      if (existing) return clone(existing);

      const created: StoreOrder = {
        ...clone(input),
        createdAt: input.createdAt || new Date(),
        updatedAt: input.updatedAt || new Date(),
      };
      orders.set(created.id, created);
      return clone(created);
    },

    async getById(id) {
      const order = orders.get(id);
      return order ? clone(order) : null;
    },

    async getByPublicToken(token) {
      const hash = hashPublicAccessToken(token);
      for (const order of orders.values()) {
        if (order.publicTokenHash === hash) {
          return clone(order);
        }
      }
      return null;
    },

    async getByStripeCheckoutSessionId(sessionId) {
      for (const order of orders.values()) {
        if (order.stripeCheckoutSessionId === sessionId) {
          return clone(order);
        }
      }
      return null;
    },

    async getByStripePaymentIntentId(paymentIntentId) {
      for (const order of orders.values()) {
        if (order.stripePaymentIntentId === paymentIntentId) {
          return clone(order);
        }
      }
      return null;
    },

    async getByPrintfulOrderId(printfulOrderId) {
      for (const order of orders.values()) {
        if (order.printfulOrderId === printfulOrderId) {
          return clone(order);
        }
      }
      return null;
    },

    async update(id, patch) {
      const current = orders.get(id);
      if (!current) throw new Error('not found');
      const updated = {
        ...current,
        ...clone(patch),
        updatedAt: patch.updatedAt || new Date(),
      };
      orders.set(id, updated);
      return clone(updated);
    },

    async transitionStatus(id, expectedStatuses, nextStatus, _source, _note, patch) {
      const current = orders.get(id);
      if (!current) throw new Error('not found');
      if (!expectedStatuses.includes(current.status)) throw new Error('expected status mismatch');
      if (!canTransition(current.status as OrderStatus, nextStatus)) {
        throw new Error('invalid transition');
      }
      const updated = {
        ...current,
        ...(patch || {}),
        status: nextStatus,
        updatedAt: patch?.updatedAt || new Date(),
      };
      orders.set(id, updated);
      return clone(updated);
    },

    async recordWebhookEvent(event: ProcessedWebhookEvent) {
      const key = `${event.provider}:${event.eventId}`;
      if (events.has(key)) return false;
      events.add(key);
      return true;
    },

    async list(options) {
      return listResult(options);
    },
  };
}
