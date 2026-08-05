import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { OrderNotFoundError } from './errors';
import { hashPublicAccessToken } from './publicAccess';
import { OrderRepository, CreateOrderInput } from './repository';
import { assertTransition } from './transitions';
import { OrderListOptions, OrderListResult, OrderStatus, ProcessedWebhookEvent, StatusTransitionSource, StoreOrder, StoreOrderItem } from './types';

type StoredOrder = Omit<StoreOrder, 'createdAt' | 'updatedAt' | 'items'> & {
  createdAt: string;
  updatedAt: string;
  items: Array<Omit<StoreOrderItem, 'id'> & { id: string }>;
};

type StoredStatusEvent = {
  orderId: string;
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
  source: StatusTransitionSource;
  note?: string;
  createdAt: string;
};

type FileStoreState = {
  orders: StoredOrder[];
  processedWebhookEvents: ProcessedWebhookEvent[];
  statusEvents: StoredStatusEvent[];
};

const FILE_STORE_PATH = resolve(process.cwd(), '.generated/orders.v2.json');
const DEFAULT_STATE: FileStoreState = {
  orders: [],
  processedWebhookEvents: [],
  statusEvents: [],
};

function toStored(order: StoreOrder): StoredOrder {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({ ...item })),
  };
}

function fromStored(order: StoredOrder): StoreOrder {
  return {
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
    items: order.items.map((item) => ({ ...item })),
  };
}

async function readStore(): Promise<FileStoreState> {
  try {
    const raw = await readFile(FILE_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<FileStoreState>;
    return {
      orders: parsed.orders || [],
      processedWebhookEvents: parsed.processedWebhookEvents || [],
      statusEvents: parsed.statusEvents || [],
    };
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: string }).code : undefined;
    if (code === 'ENOENT') {
      return DEFAULT_STATE;
    }
    throw error;
  }
}

async function writeStore(state: FileStoreState): Promise<void> {
  await mkdir(dirname(FILE_STORE_PATH), { recursive: true });
  await writeFile(FILE_STORE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function mutateStore<T>(fn: (state: FileStoreState) => T): Promise<T> {
  const state = await readStore();
  const result = fn(state);
  await writeStore(state);
  return result;
}

function toListResult(orders: StoreOrder[], options: OrderListOptions = {}): OrderListResult {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 25));
  const search = options.search?.toLowerCase();

  let filtered = orders;
  if (options.status) {
    filtered = filtered.filter((order) => order.status === options.status);
  }
  if (search) {
    filtered = filtered.filter((order) =>
      order.id.toLowerCase().includes(search) || order.customerEmail.toLowerCase().includes(search),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    orders: paged,
    page,
    pageSize,
    total,
  };
}

function buildOrder(input: CreateOrderInput): StoreOrder {
  const now = new Date();
  return {
    id: input.id,
    publicTokenHash: input.publicTokenHash,
    status: input.status,
    customerEmail: input.customerEmail,
    shippingAddress: input.shippingAddress,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId,
    stripePaymentIntentId: input.stripePaymentIntentId,
    printfulOrderId: input.printfulOrderId,
    printfulExternalOrderId: input.printfulExternalOrderId,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    currency: input.currency,
    trackingNumber: input.trackingNumber,
    trackingUrl: input.trackingUrl,
    mappingError: input.mappingError,
    fulfilled: input.fulfilled,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
    items: input.items.map((item) => ({ ...item })),
  };
}

export function createFileOrderRepository(): OrderRepository {
  return {
    async create(input) {
      return mutateStore((state) => {
        if (state.orders.some((existing) => existing.id === input.id)) {
          return fromStored(state.orders.find((existing) => existing.id === input.id) as StoredOrder);
        }

        const order = buildOrder(input);
        state.orders.push(toStored(order));
        return order;
      });
    },

    async getById(id) {
      const state = await readStore();
      const order = state.orders.find((entry) => entry.id === id);
      return order ? fromStored(order) : null;
    },

    async getByPublicToken(token) {
      const hash = hashPublicAccessToken(token);
      const state = await readStore();
      const order = state.orders.find((entry) => entry.publicTokenHash === hash);
      return order ? fromStored(order) : null;
    },

    async getByStripeCheckoutSessionId(sessionId) {
      const state = await readStore();
      const order = state.orders.find((entry) => entry.stripeCheckoutSessionId === sessionId);
      return order ? fromStored(order) : null;
    },

    async getByStripePaymentIntentId(paymentIntentId) {
      const state = await readStore();
      const order = state.orders.find((entry) => entry.stripePaymentIntentId === paymentIntentId);
      return order ? fromStored(order) : null;
    },

    async getByPrintfulOrderId(printfulOrderId) {
      const state = await readStore();
      const order = state.orders.find((entry) => entry.printfulOrderId === printfulOrderId);
      return order ? fromStored(order) : null;
    },

    async update(id, patch) {
      return mutateStore((state) => {
        const index = state.orders.findIndex((entry) => entry.id === id);
        if (index < 0) {
          throw new OrderNotFoundError();
        }

        const current = fromStored(state.orders[index]);
        const updated: StoreOrder = {
          ...current,
          ...patch,
          items: patch.items ? patch.items.map((item) => ({ ...item })) : current.items,
          updatedAt: patch.updatedAt || new Date(),
        };

        state.orders[index] = toStored(updated);
        return updated;
      });
    },

    async transitionStatus(id, expectedStatuses, nextStatus, source, note, patch) {
      return mutateStore((state) => {
        const index = state.orders.findIndex((entry) => entry.id === id);
        if (index < 0) {
          throw new OrderNotFoundError();
        }

        const current = fromStored(state.orders[index]);
        if (!expectedStatuses.includes(current.status)) {
          throw new Error(`Expected statuses ${expectedStatuses.join(',')} but found ${current.status}`);
        }

        assertTransition(current.status, nextStatus);

        const updated: StoreOrder = {
          ...current,
          ...patch,
          status: nextStatus,
          items: patch?.items ? patch.items.map((item) => ({ ...item })) : current.items,
          updatedAt: patch?.updatedAt || new Date(),
        };

        state.orders[index] = toStored(updated);
        state.statusEvents.push({
          orderId: id,
          previousStatus: current.status,
          nextStatus,
          source,
          note,
          createdAt: new Date().toISOString(),
        });

        return updated;
      });
    },

    async recordWebhookEvent(event) {
      return mutateStore((state) => {
        const exists = state.processedWebhookEvents.some(
          (existing) => existing.provider === event.provider && existing.eventId === event.eventId,
        );
        if (exists) {
          return false;
        }

        state.processedWebhookEvents.push({
          provider: event.provider,
          eventId: event.eventId,
          eventType: event.eventType,
          payloadHash: event.payloadHash,
          processedAt: event.processedAt || new Date(),
        });
        return true;
      });
    },

    async list(options) {
      const state = await readStore();
      const orders = state.orders.map(fromStored).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return toListResult(orders, options);
    },
  };
}
