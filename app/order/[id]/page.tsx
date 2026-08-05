import { Metadata } from 'next';
import OrderStatusClient from './status-client';

export const metadata: Metadata = {
  title: 'Order Status | ShittyTees',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  return <OrderStatusClient orderId={id} token={token || ''} />;
}
