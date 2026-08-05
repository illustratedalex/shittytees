export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'printful_draft_created'
  | 'submitted_to_printful'
  | 'in_fulfillment'
  | 'shipped'
  | 'issue_requires_contact'
  | 'failed'
  | 'canceled'
  | 'refunded';

export type StatusTransitionSource =
  | 'stripe_webhook'
  | 'printful_webhook'
  | 'admin_action'
  | 'migration'
  | 'system';

export type StoreOrderItem = {
  id: string;
  productId: string;
  productSlug: string;
  localVariantId: string;
  printfulVariantId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  image: string;
};

export type StoreShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type StoreOrder = {
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
  createdAt: Date;
  updatedAt: Date;
  items: StoreOrderItem[];
};

export type OrderPatch = Partial<Omit<StoreOrder, 'id' | 'items' | 'createdAt'>> & {
  items?: StoreOrderItem[];
  updatedAt?: Date;
};

export type ProcessedWebhookEvent = {
  provider: 'stripe' | 'printful';
  eventId: string;
  eventType: string;
  payloadHash?: string;
  processedAt?: Date;
};

export type OrderStatusEvent = {
  orderId: string;
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
  source: StatusTransitionSource;
  note?: string;
  createdAt: Date;
};

export type OrderListOptions = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
};

export type OrderListResult = {
  orders: StoreOrder[];
  page: number;
  pageSize: number;
  total: number;
};
