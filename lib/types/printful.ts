export interface PrintfulWebhookSignature {
  signature: string;
}

export interface PrintfulProduct {
  id: number;
  external_id?: string;
  name: string;
  variants_count: number;
}

export interface PrintfulVariant {
  id: number;
  external_id?: string;
  sync_product_id: number;
  name: string;
  sku: string;
  color: string;
  color_code: string;
  size: string;
  price: number;
  retail_price: number;
  available: boolean;
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  status: string;
  items: PrintfulOrderItem[];
  recipient: PrintfulRecipient;
  shipping: string;
  total_price: number;
}

export interface PrintfulOrderItem {
  sync_variant_id: number;
  quantity: number;
  name: string;
}

export interface PrintfulRecipient {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
  email: string;
  phone: string;
}
