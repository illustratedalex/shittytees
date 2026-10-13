import Link from 'next/link';
import {getOrderRepository} from '@/lib/orders';
import {verifyPublicAccessToken} from '@/lib/orders/publicAccess';
import {getStripe} from '@/lib/stripe/client';
import ClearPurchasedCart from '@/components/checkout/ClearPurchasedCart';
import type {StoreOrder} from '@/lib/orders/types';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string; token?: string }>;
}) {
  const params = await searchParams;
  let order:StoreOrder|null=null;
  let paid=false;
  if(params.order_id && params.token && params.session_id){
    try {
      const candidate=await getOrderRepository().getById(params.order_id);
      if(candidate && candidate.stripeCheckoutSessionId===params.session_id && verifyPublicAccessToken(params.token,candidate.publicTokenHash)){
        order=candidate;
        paid=(await getStripe().checkout.sessions.retrieve(params.session_id)).payment_status==='paid';
      }
    }catch{console.error('Checkout confirmation could not be verified');}
  }
  const orderHref =
    order && params.token
      ? `/order/${encodeURIComponent(order.id)}?token=${encodeURIComponent(params.token)}`
      : null;

  return (
    <div className="checkout-result">
      {paid && order?<ClearPurchasedCart orderId={order.id} purchased={order.items.map(item=>({productId:item.productId,variantId:item.localVariantId,quantity:item.quantity}))}/>:null}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">{paid?'✓':'…'}</div>
          <h1 className="text-4xl font-bold text-black mb-4">{paid?'Thanks, Your Payment Was Received':'Check Your Order Status'}</h1>
          <p className="text-gray-600 mb-8 text-lg">
            {paid?'Your payment was received. View your order for the latest status.':'If you completed checkout, your order status will show payment confirmation once verified.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {orderHref ? (
              <Link href={orderHref} className="store-button">
                View Order Status
              </Link>
            ) : null}
            <Link href="/shop" className="store-text-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
