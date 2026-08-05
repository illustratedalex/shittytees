'use client';

import { CartProvider } from '@/lib/hooks/useCart';

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
