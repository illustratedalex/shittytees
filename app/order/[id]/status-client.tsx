'use client';

import { useEffect, useMemo, useState } from 'react';

type OrderStatusResponse = {
  id: string;
  status: string;
  statusLabel: string;
  trackingUrl?: string;
  trackingNumber?: string;
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
  }>;
  total: number;
  currency: string;
  updatedAt: string;
};

export default function OrderStatusClient({ orderId, token }: { orderId: string; token: string }) {
  const hasRequiredParams = Boolean(orderId && token);
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(hasRequiredParams ? null : 'not-found');

  const stable = useMemo(() => data?.status === 'shipped' || data?.status === 'failed' || data?.status === 'canceled', [data?.status]);

  useEffect(() => {
    if (!hasRequiredParams) {
      return;
    }

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/order/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: orderId, token }),
        });

        if (!response.ok) {
          setError('not-found');
          return;
        }

        const payload = (await response.json()) as OrderStatusResponse;
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('not-found');
        }
      }
    };

    void fetchStatus();
    interval = setInterval(() => {
      if (!stable) {
        void fetchStatus();
      }
    }, 5000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [orderId, token, stable, hasRequiredParams]);

  if (error) {
    return (
      <main className="order-status-page">
        <div className="order-status-card">
          <h1 className="text-[#f2ecde] text-2xl mb-4">Order Not Found</h1>
          <p className="text-[#c4b9a7]">We could not find that order status link.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="order-status-page">
      <div className="order-status-card">
        <h1 className="text-[#f2ecde] text-2xl mb-3">Order Status</h1>
        <p className="text-[#d4cdbc] mb-6">Payment confirmation and fulfillment updates can take a moment to appear.</p>

        <div className="order-status-current">
          <p className="text-[#f2ecde]">Current: {data?.statusLabel || 'Loading...'}</p>
          {data?.trackingUrl ? (
            <a href={data.trackingUrl} target="_blank" rel="noreferrer" className="text-[#f2ecde] underline">
              Track Shipment
            </a>
          ) : null}
        </div>

        <div className="order-status-items">
          <h2 className="text-[#f2ecde] text-lg mb-3">Items</h2>
          <ul className="space-y-2">
            {data?.items.map((item) => (
              <li key={`${item.name}-${item.size}-${item.color}`} className="text-[#c4b9a7]">
                {item.quantity}x {item.name} ({item.size} / {item.color})
              </li>
            ))}
          </ul>
          {data ? <p className="order-status-total">Total: {new Intl.NumberFormat('en-US',{style:'currency',currency:data.currency}).format(data.total)}</p> : null}
        </div>
      </div>
    </main>
  );
}
