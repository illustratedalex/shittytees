export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  printfulVariantId: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}
