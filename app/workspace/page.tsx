'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WorkspacePage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    productCount: 6,
  });

  useEffect(() => {
    // Load stats from local store for demo
    const orders = localStorage.getItem('shittytees_orders');
    if (orders) {
      try {
        const parsed = JSON.parse(orders);
        setStats((prev) => ({
          ...prev,
          totalOrders: parsed.length,
          paidOrders: parsed.filter((o: any) => o.status !== 'pending_payment').length,
          totalRevenue: parsed
            .filter((o: any) => o.status !== 'pending_payment')
            .reduce((sum: number, o: any) => sum + o.total, 0),
        }));
      } catch (e) {
        console.error('Failed to load orders');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-8 p-4 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <h2 className="font-semibold mb-2">⚠ Development Notice</h2>
          <p className="text-sm">
            This workspace is not production-ready. Authentication and database integration must be completed before deploying to production.
          </p>
        </div>

        <h1 className="text-black mb-12">Workspace</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <div className="text-3xl font-bold text-red-900 mb-2">{stats.totalOrders}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Orders</div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <div className="text-3xl font-bold text-red-900 mb-2">{stats.paidOrders}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Paid Orders</div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <div className="text-3xl font-bold text-red-900 mb-2">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Revenue</div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <div className="text-3xl font-bold text-red-900 mb-2">{stats.productCount}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Products</div>
          </div>
        </div>

        {/* Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <h2 className="font-semibold text-black mb-4">Stripe Connection</h2>
            <div className="inline-block px-3 py-1 bg-yellow-50 text-yellow-900 text-xs uppercase tracking-wider rounded font-semibold border border-yellow-200">
              Configured (Demo)
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Webhook endpoint: /api/stripe/webhook
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <h2 className="font-semibold text-black mb-4">Printful Connection</h2>
            <div className="inline-block px-3 py-1 bg-yellow-50 text-yellow-900 text-xs uppercase tracking-wider rounded font-semibold border border-yellow-200">
              Configured (Demo)
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Webhook endpoint: /api/printful/webhook
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg mb-12">
          <h2 className="font-semibold text-black mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/shop" className="px-4 py-3 bg-black text-white hover:bg-gray-900 font-semibold text-sm rounded transition-colors text-center">
              View Shop
            </Link>
            <a href="#" className="px-4 py-3 bg-gray-100 text-gray-400 font-semibold text-sm rounded text-center opacity-50 cursor-not-allowed">
              Product Mgmt
            </a>
            <a href="#" className="px-4 py-3 bg-gray-100 text-gray-400 font-semibold text-sm rounded text-center opacity-50 cursor-not-allowed">
              Orders
            </a>
            <a href="#" className="px-4 py-3 bg-gray-100 text-gray-400 font-semibold text-sm rounded text-center opacity-50 cursor-not-allowed">
              Settings
            </a>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="font-semibold text-black mb-4">Next Steps</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Storefront complete with products & checkout</li>
            <li>✓ Cart persistence with localStorage</li>
            <li>✓ Stripe webhook handler scaffolding</li>
            <li>✓ Printful webhook handler scaffolding</li>
            <li>⚠ Database layer (replace in-memory store)</li>
            <li>⚠ Authentication system (admin access)</li>
            <li>⚠ Order management dashboard</li>
            <li>⚠ Fulfillment tracking</li>
            <li>⚠ Email notifications</li>
            <li>⚠ Analytics & reporting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
