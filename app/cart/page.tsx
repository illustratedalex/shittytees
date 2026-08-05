'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { CheckoutRequestSchema } from '@/lib/validation/schemas';
import { LogoLockup } from '@/components/brand';
import { SiteHeader } from '@/components/layout';

const SHIPPING_COST = 10;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, subtotal } = useCart();
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

  if (items.length === 0) {
    return (
      <>
      <SiteHeader />
      <div className="min-h-screen bg-[#0e0d0c] pt-20 sm:pt-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="mb-10">
            <LogoLockup variant="light" layout="horizontal" />
          </div>
          <Link href="/" className="text-[#d4cdbc] hover:text-[#f2ecde] text-xs uppercase tracking-[0.16em] font-semibold mb-8 inline-flex items-center gap-2">
            ← Back
          </Link>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-[#f2ecde] mb-4">Your cart is behaving suspiciously well.</h1>
            <p className="text-[#c9bda8] mb-8">Add some terrible ideas to get started.</p>
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
    <div className="min-h-screen bg-[#0e0d0c] pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <LogoLockup variant="light" layout="horizontal" />
        </div>
        <Link href="/" className="text-[#d4cdbc] hover:text-[#f2ecde] text-xs uppercase tracking-[0.16em] font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-[#f2ecde] mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 sm:gap-6 border-b border-[#f2ecde1e] pb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 product-image mb-0 flex-shrink-0 border border-[#f2ecde1c]">
                    <div className="campaign-mockup absolute inset-0"></div>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover relative z-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#f2ecde] mb-2 text-base">{item.name}</h3>
                    <p className="text-sm text-[#baaf9c] mb-2">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-[#f2ecde] font-semibold mb-3">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                    <div className="flex gap-2 items-center mb-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#201d1a] hover:bg-[#292621] text-sm font-semibold text-[#f2ecde] rounded"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#f2ecde]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#201d1a] hover:bg-[#292621] text-sm font-semibold text-[#f2ecde] rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-[#c4b9a7] hover:text-[#f2ecde] font-semibold text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="panel-soft p-6 sm:p-7 sticky top-24">
              <h2 className="font-semibold text-[#f2ecde] text-lg mb-6">Order Summary</h2>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between text-[#baaf9c]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#f2ecde]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#baaf9c]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#f2ecde]">${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#baaf9c]">
                  <span>Tax</span>
                  <span className="font-semibold text-[#f2ecde]">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#f2ecde24] pt-3 flex justify-between font-bold text-[#f2ecde] text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">First Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">Last Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">Email *</label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.slice(0, 2).toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="State (TX)"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f2ecde] mb-2 uppercase tracking-[0.1em]">ZIP Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12110f] border border-[#f2ecde33] text-[#f2ecde] placeholder-[#8f8779] text-sm rounded-md focus:outline-none"
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              {error && <div className="bg-[#3c0e12] text-[#f2ecde] p-3 mb-4 text-sm rounded border border-[#a34a4f]">{error}</div>}

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
