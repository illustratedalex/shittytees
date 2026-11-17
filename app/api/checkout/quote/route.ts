import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {CheckoutRequestSchema} from '@/lib/validation/schemas';
import {validateAndNormalizeCheckoutItems,toStoreOrderItems} from '@/lib/orders/services/checkoutSecurity';
import {generatePublicAccessToken,hashPublicAccessToken} from '@/lib/orders/publicAccess';
import {getOrderRepository} from '@/lib/orders';
import {quoteCostPlusOrder} from '@/lib/pricing/quote';
import {checkoutIsEnabled} from '@/lib/stripe/readiness';
import {ZodError} from 'zod';
import {PrintfulError} from '@/lib/printful/errors';
export async function POST(request:NextRequest){
 if(!checkoutIsEnabled()) return NextResponse.json({error:'Checkout is being verified. Please check back shortly.'},{status:503});
 try {
  const body=CheckoutRequestSchema.parse(await request.json());
  const normalized=await validateAndNormalizeCheckoutItems(body.items);
  const items=toStoreOrderItems(normalized);
  const totals=await quoteCostPlusOrder(items,body.shippingAddress);
  const orderId=randomUUID(),token=generatePublicAccessToken();
  await getOrderRepository().create({id:orderId,publicTokenHash:hashPublicAccessToken(token),status:'pending_payment',customerEmail:body.shippingAddress.email,shippingAddress:body.shippingAddress,items,...totals,currency:'USD',fulfilled:false});
  return NextResponse.json({orderId,token,...totals,expiresInSeconds:900});
 } catch(error){
  const invalid=error instanceof ZodError||error instanceof SyntaxError;
  console.error('Destination quote failed', {kind:error instanceof Error ? error.name : 'unknown', detail:error instanceof PrintfulError ? 'Printful status '+error.status : error instanceof Error ? error.message : 'unknown'});
  return NextResponse.json({error:invalid?'Please check the delivery details.':'We could not confirm this price. Refresh your cart and try again.'},{status:invalid?400:422});
 }
}
