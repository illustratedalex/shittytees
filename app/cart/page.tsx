'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { CheckoutRequestSchema } from '@/lib/validation/schemas';

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
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
            ← Back
          </Link>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-black mb-4">Your cart is behaving suspiciously well.</h1>
            <p className="text-gray-600 mb-8">Add some terrible ideas to get started.</p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-6 border-b border-gray-200 pb-6">
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-red-900 font-semibold mb-3">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                    <div className="flex gap-2 items-center mb-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-black rounded"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-black rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-red-900 hover:text-red-950 font-semibold text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg sticky top-24">
              <h2 className="font-semibold text-black text-lg mb-6">Order Summary</h2>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-black text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">First Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">Email *</label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.slice(0, 2).toUpperCase() })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="State (TX)"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-black placeholder-gray-400 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-900 p-3 mb-4 text-sm rounded border border-red-200">{error}</div>}

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
  );
}
