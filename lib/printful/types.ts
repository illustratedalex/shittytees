export type PrintfulFile = {
  id?: number;
  type?: string;
  url?: string;
  preview_url?: string;
  thumbnail_url?: string;
  filename?: string;
  visible?: boolean;
  options?: Record<string, string | number | boolean>;
};

export type PrintfulStoreInfo = {
  id: number;
  name: string;
  owner?: string;
  currency?: string;
  status?: string;
  external_id?: string;
};

export type PrintfulSyncProduct = {
  id: number;
  external_id?: string;
  name: string;
  variants_count?: number;
  variants?: number;
  thumbnail_url?: string;
  is_ignored?: boolean;
  active?: boolean;
  files?: PrintfulFile[];
};

export type PrintfulPaging = {
  total: number;
  offset: number;
  limit: number;
};

export type PrintfulStoreProduct = {
  id: number;
  external_id?: string;
  name: string;
  synced?: number;
  thumbnail_url?: string;
  is_ignored?: boolean;
};

export type PrintfulStoreProductsPage = {
  result: PrintfulStoreProduct[];
  paging: PrintfulPaging;
};

export type PrintfulStoreProductDetail = {
  sync_product: PrintfulSyncProduct;
  sync_variants: PrintfulSyncVariant[];
};

export type PrintfulSyncProductDetail = {
  sync_product: PrintfulSyncProduct;
  sync_variants: PrintfulSyncVariant[];
};

export type PrintfulSyncVariant = {
  id: number;
  external_id?: string;
  variant_id?: number;
  sync_product_id: number;
  name: string;
  sku?: string;
  size?: string;
  color?: string;
  color_code?: string;
  price?: number | string;
  retail_price?: number | string;
  available?: boolean;
  is_ignored?: boolean;
  is_discontinued?: boolean;
  availability_status?: 'active' | 'discontinued' | 'out_of_stock' | 'temporary_out_of_stock' | string;
  product?: {
    variant_id?: number;
    product_id?: number;
    image?: string;
    name?: string;
  };
  files?: PrintfulFile[];
  mockup_url?: string;
};

export type PrintfulSyncVariantInfo = {
  sync_variant: PrintfulSyncVariant;
  sync_product: PrintfulSyncProduct;
};

export type PrintfulWebhook = {
  type: string;
  data: unknown;
};

export type PrintfulRecipient = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
  email: string;
  phone?: string;
};

export type PrintfulDraftOrderItem = {
  sync_variant_id: number;
  quantity: number;
  name?: string;
};

export type PrintfulDraftOrderPayload = {
  external_id: string;
  recipient: PrintfulRecipient;
  items: PrintfulDraftOrderItem[];
  shipping?: string;
  confirm?: boolean;
};

export type PrintfulOrder = {
  id: number;
  external_id: string;
  status: string;
  recipient?: PrintfulRecipient;
  items?: PrintfulDraftOrderItem[];
  shipping?: string;
  tracking_number?: string;
  tracking_url?: string;
  created?: string;
  updated?: string;
};

export type PrintfulWebhookConfig = {
  url: string;
  secret?: string;
  types?: string[];
};
