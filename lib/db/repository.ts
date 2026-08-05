import { Order } from '../types/order';

// Local in-memory store for development
// In production, replace with a real database
const orders = new Map<string, Order>();
const fulfillmentLog = new Map<string, string>(); // sessionId -> fulfillmentState

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

// In-memory order repository for development
export const orderRepository: OrderRepository = {
  async save(order: Order) {
    orders.set(order.id, order);
  },
  async findByCheckoutSessionId(sessionId: string) {
    for (const order of orders.values()) {
      if (order.stripeCheckoutSessionId === sessionId) {
        return order;
      }
    }
    return null;
  },
  async findById(id: string) {
    return orders.get(id) || null;
  },
  async list() {
    return Array.from(orders.values());
  },
};

// Fulfillment tracker to prevent duplicate submissions
export const fulfillmentTracker: FulfillmentTracker = {
  async isFulfilled(sessionId: string) {
    return fulfillmentLog.has(sessionId);
  },
  async markFulfilled(sessionId: string, printfulOrderId?: string) {
    fulfillmentLog.set(sessionId, printfulOrderId || 'submitted');
  },
};

export async function getOrderStats() {
  const allOrders = Array.from(orders.values());
  const paidOrders = allOrders.filter((o) => o.status !== 'pending_payment');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  return {
    totalOrders: allOrders.length,
    paidOrders: paidOrders.length,
    totalRevenue,
    recentOrders: allOrders.slice(-10).reverse(),
  };
}
