import {
  OrderListOptions,
  OrderListResult,
  OrderPatch,
  OrderStatus,
  ProcessedWebhookEvent,
  StatusTransitionSource,
  StoreOrder,
  StoreOrderItem,
  StoreShippingAddress,
} from './types';

export type CreateOrderInput = {
  id: string;
  publicTokenHash: string;
  status: OrderStatus;
  customerEmail: string;
  shippingAddress: StoreShippingAddress;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  printfulOrderId?: number;
  printfulExternalOrderId?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  trackingUrl?: string;
  mappingError?: string;
  fulfilled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  items: StoreOrderItem[];
};

export type OrderRepository = {
  create(order: CreateOrderInput): Promise<StoreOrder>;
  getById(id: string): Promise<StoreOrder | null>;
  getByPublicToken(token: string): Promise<StoreOrder | null>;
  getByStripeCheckoutSessionId(sessionId: string): Promise<StoreOrder | null>;
  getByStripePaymentIntentId(paymentIntentId: string): Promise<StoreOrder | null>;
  getByPrintfulOrderId(printfulOrderId: number): Promise<StoreOrder | null>;
  update(id: string, patch: OrderPatch): Promise<StoreOrder>;
  transitionStatus(
    id: string,
    expectedStatuses: OrderStatus[],
    nextStatus: OrderStatus,
    source: StatusTransitionSource,
    note?: string,
    patch?: OrderPatch,
  ): Promise<StoreOrder>;
  recordWebhookEvent(event: ProcessedWebhookEvent): Promise<boolean>;
  list(options?: OrderListOptions): Promise<OrderListResult>;
};
