import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { Order } from '../types/order';

const STORE_PATH = resolve(process.cwd(), '.generated/orders.json');
const DEFAULT_STORE = { orders: [], fulfillmentLog: {} as Record<string, string> };

type StoredOrder = Omit<Order, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type OrderStoreState = {
  orders: StoredOrder[];
  fulfillmentLog: Record<string, string>;
};

async function readStore(): Promise<OrderStoreState> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<OrderStoreState>;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      fulfillmentLog: parsed.fulfillmentLog || {},
    };
  } catch (error) {
    const missing = typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT';
    if (missing) {
      return { ...DEFAULT_STORE };
    }
    throw error;
  }
}

async function writeStore(store: OrderStoreState): Promise<void> {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function toStoredOrder(order: Order): StoredOrder {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function fromStoredOrder(order: StoredOrder): Order {
  return {
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  };
}

async function updateStore(mutator: (store: OrderStoreState) => void): Promise<void> {
  const store = await readStore();
  mutator(store);
  await writeStore(store);
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findByCheckoutSessionId(sessionId: string): Promise<Order | null>;
  findById(id: string): Promise<Order | null>;
  list(): Promise<Order[]>;
}

export interface FulfillmentTracker {
  isFulfilled(sessionId: string): Promise<boolean>;
  markFulfilled(sessionId: string, printfulOrderId?: string): Promise<void>;
}

export const orderRepository: OrderRepository = {
  async save(order: Order) {
    await updateStore((store) => {
      const storedOrder = toStoredOrder(order);
      const index = store.orders.findIndex((item) => item.id === storedOrder.id);
      if (index >= 0) {
        store.orders[index] = storedOrder;
      } else {
        store.orders.push(storedOrder);
      }
    });
  },
  async findByCheckoutSessionId(sessionId: string) {
    const store = await readStore();
    const order = store.orders.find((item) => item.stripeCheckoutSessionId === sessionId);
    return order ? fromStoredOrder(order) : null;
  },
  async findById(id: string) {
    const store = await readStore();
    const order = store.orders.find((item) => item.id === id);
    return order ? fromStoredOrder(order) : null;
  },
  async list() {
    const store = await readStore();
    return store.orders.map(fromStoredOrder);
  },
};

export const fulfillmentTracker: FulfillmentTracker = {
  async isFulfilled(sessionId: string) {
    const store = await readStore();
    return Boolean(store.fulfillmentLog[sessionId]);
  },
  async markFulfilled(sessionId: string, printfulOrderId?: string) {
    await updateStore((store) => {
      store.fulfillmentLog[sessionId] = printfulOrderId || 'submitted';
    });
  },
};

export async function getOrderStats() {
  const allOrders = await orderRepository.list();
  const paidOrders = allOrders.filter((o) => o.status !== 'pending_payment');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  return {
    totalOrders: allOrders.length,
    paidOrders: paidOrders.length,
    totalRevenue,
    recentOrders: allOrders.slice(-10).reverse(),
  };
}
