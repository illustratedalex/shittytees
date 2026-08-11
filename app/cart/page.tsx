'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { CheckoutRequestSchema } from '@/lib/validation/schemas';
import { evaluateCartFulfillmentReadiness } from '@/lib/fulfillment/readiness';
import { SiteHeader } from '@/components/layout';

const SHIPPING_COST = 10;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, subtotal, isHydrated } = useCart();
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    state: 'TX',
    postalCode: '',
    country: 'US' as const,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tax = subtotal * 0.08;
  const total = subtotal + SHIPPING_COST + tax;

  const handleCheckout = async () => {
    if (!shippingAddress.firstName || !shippingAddress.email || !shippingAddress.address) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const readiness = evaluateCartFulfillmentReadiness(items.map((item) => ({ productId: item.productId, variantId: item.variantId })));
      if (!readiness.ready) {
        throw new Error('One or more cart items are not ready for fulfillment checkout.');
      }

      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        unitPrice: item.unitPrice,
        printfulVariantId: item.printfulVariantId,
      }));

      const payload = {
        items: checkoutItems,
        shippingAddress,
      };

      CheckoutRequestSchema.parse(payload);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <>
      <SiteHeader />
      <div className="min-h-screen bg-[#111111] pt-[4.75rem]">
        <div className="site-shell section-shell max-w-2xl">
          <Link href="/" className="text-[#d5d0c6] hover:text-[#f3efe6] text-sm tracking-[0.04em] font-semibold mb-8 inline-flex items-center gap-2">
            ← Back
          </Link>
          <div className="text-center py-20 bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl px-6">
            <h1 className="text-3xl font-bold text-[#f3efe6] mb-4">Loading your cart...</h1>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
      <SiteHeader />
      <div className="min-h-screen bg-[#111111] pt-[4.75rem]">
        <div className="site-shell section-shell max-w-2xl">
          <Link href="/" className="text-[#d5d0c6] hover:text-[#f3efe6] text-sm tracking-[0.04em] font-semibold mb-8 inline-flex items-center gap-2">
            ← Back
          </Link>
          <div className="text-center py-20 bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl px-6">
            <h1 className="text-3xl font-bold text-[#f3efe6] mb-4">Your cart is behaving suspiciously well.</h1>
            <p className="text-[#d5d0c6] mb-8">Add some terrible ideas to get started.</p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <SiteHeader />
    <div className="min-h-screen bg-[#111111] pt-[4.75rem]">
      <div className="site-shell section-shell">
        <Link href="/" className="text-[#d5d0c6] hover:text-[#f3efe6] text-sm tracking-[0.04em] font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-[#f3efe6] mb-10 text-[2.3rem]">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-10">
          {/* Items */}
          <div>
            <div className="space-y-5 mb-8">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5 items-start">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 product-image-stage mb-0 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#f3efe6] mb-2 text-lg leading-tight normal-case">{item.name}</h3>
                    <p className="text-sm text-[#aaa59c] mb-3">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-[#f3efe6] font-semibold mb-4 text-lg">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                    <div className="flex gap-2 items-center mb-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-11 h-11 flex items-center justify-center bg-[#242424] hover:bg-[#2e2e2e] text-sm font-semibold text-[#f3efe6] rounded focus-visible-ring"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-[#f3efe6]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-11 h-11 flex items-center justify-center bg-[#242424] hover:bg-[#2e2e2e] text-sm font-semibold text-[#f3efe6] rounded focus-visible-ring"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-[#d5d0c6] hover:text-[#f3efe6] font-semibold text-sm min-h-[44px] px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div>
            <div className="bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl p-6 sm:p-7 sticky top-24">
              <h2 className="font-semibold text-[#f3efe6] text-xl mb-6 normal-case">Order Summary</h2>

              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-[#aaa59c]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#f3efe6]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#aaa59c]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#f3efe6]">${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#aaa59c]">
                  <span>Tax</span>
                  <span className="font-semibold text-[#f3efe6]">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#2f2f2f] pt-4 flex justify-between font-bold text-[#f3efe6] text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">First Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">Last Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">Email *</label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.slice(0, 2).toUpperCase() })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="State (TX)"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f3efe6] mb-2 uppercase tracking-[0.1em]">ZIP Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2 bg-[#141414] border border-[#3a3a3a] text-[#f3efe6] placeholder-[#75706a] text-sm rounded-md"
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              {error && <div className="bg-[#4a1f1f] text-[#f3efe6] p-3 mb-4 text-sm rounded border border-[#7f1d1d]">{error}</div>}

              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="btn-primary-oxblood w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <button
                onClick={clear}
                className="btn-secondary w-full"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
