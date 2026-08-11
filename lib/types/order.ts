export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'submitting_to_printful'
  | 'submitted'
  | 'in_production'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'failed'
  | 'canceled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  size: string;
  color: string;
  unitPrice: number;
  image: string;
  printfulVariantId: string;
  printfulSyncProductId?: string;
}

export interface ShippingAddress {
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
}

export interface Order {
  id: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
  printfulOrderId?: string;
  status: OrderStatus;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  fulfilled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
