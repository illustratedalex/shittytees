'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function loadWorkspaceStats() {
  const fallback = {
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    productCount: 6,
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  const orders = localStorage.getItem('shittytees_orders');
  if (!orders) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(orders) as Array<{ status: string; total: number }>;
    return {
      ...fallback,
      totalOrders: parsed.length,
      paidOrders: parsed.filter((order) => order.status !== 'pending_payment').length,
      totalRevenue: parsed
        .filter((order) => order.status !== 'pending_payment')
        .reduce((sum, order) => sum + order.total, 0),
    };
  } catch {
    console.error('Failed to load orders');
    return fallback;
  }
}

type SyncStatusResponse = {
  lastSync: {
    id: number;
    startedAt: string;
    completedAt?: string;
    status: 'started' | 'completed' | 'failed';
    checked: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
    errors: string[];
  } | null;
  productCount: number;
  draftCount: number;
  newDraftCount: number;
};

type SyncResult = {
  checked: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: string[];
};

export default function WorkspacePage() {
  const [stats, setStats] = useState(loadWorkspaceStats);
  const [status, setStatus] = useState<SyncStatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        setStatusError(null);
        const response = await fetch('/api/printful/sync/status', { cache: 'no-store' });
        if (!response.ok) {
          if (response.status === 401) {
            setStatusError('Admin login required to view catalog sync status.');
            return;
          }
          throw new Error(`Failed to load status (${response.status})`);
        }

        const payload = (await response.json()) as SyncStatusResponse;
        setStatus(payload);
        setStats((current) => ({
          ...current,
          productCount: payload.productCount,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load sync status';
        setStatusError(message);
      }
    }

    void loadStatus();
  }, []);

  async function runSyncNow() {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);

    try {
      const response = await fetch('/api/printful/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Sync failed (${response.status})`);
      }

      const result = (await response.json()) as SyncResult;
      setSyncResult(result);

      const statusResponse = await fetch('/api/printful/sync/status', { cache: 'no-store' });
      if (statusResponse.ok) {
        const payload = (await statusResponse.json()) as SyncStatusResponse;
        setStatus(payload);
        setStats((current) => ({
          ...current,
          productCount: payload.productCount,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      setSyncError(message);
    } finally {
      setSyncing(false);
    }
  }

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
              Configured
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Webhook endpoint: /api/printful/webhook
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Sync endpoints: /api/printful/sync and /api/printful/sync/status
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-black">Printful Catalog</h2>
              <p className="text-sm text-gray-600">Run sync now or review latest sync counters.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void runSyncNow();
              }}
              disabled={syncing}
              className="px-4 py-2 bg-black text-white hover:bg-gray-900 font-semibold text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {statusError ? (
            <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">{statusError}</p>
          ) : null}

          {status ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="border border-gray-200 rounded p-3">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Products</div>
                <div className="text-xl font-bold text-black mt-1">{status.productCount}</div>
              </div>
              <div className="border border-gray-200 rounded p-3">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Drafts</div>
                <div className="text-xl font-bold text-black mt-1">{status.draftCount}</div>
              </div>
              <div className="border border-gray-200 rounded p-3">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">New from Printful</div>
                <div className="text-xl font-bold text-black mt-1">{status.newDraftCount}</div>
              </div>
              <div className="border border-gray-200 rounded p-3">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Last Status</div>
                <div className="text-xl font-bold text-black mt-1">{status.lastSync?.status || 'never'}</div>
              </div>
            </div>
          ) : null}

          {status?.lastSync ? (
            <div className="text-sm text-gray-700 border border-gray-200 rounded p-3 mb-4">
              <p>Last run: {new Date(status.lastSync.startedAt).toLocaleString()}</p>
              <p className="mt-1">
                checked {status.lastSync.checked}, created {status.lastSync.created}, updated {status.lastSync.updated}, unchanged {status.lastSync.unchanged}, failed {status.lastSync.failed}
              </p>
              {status.lastSync.errors.length > 0 ? (
                <p className="mt-1 text-red-700">Errors: {status.lastSync.errors.slice(0, 2).join(' | ')}</p>
              ) : null}
            </div>
          ) : null}

          {syncResult ? (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2">
              Sync complete: checked {syncResult.checked}, created {syncResult.created}, updated {syncResult.updated}, unchanged {syncResult.unchanged}, failed {syncResult.failed}.
            </p>
          ) : null}

          {syncError ? (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">{syncError}</p>
          ) : null}
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
