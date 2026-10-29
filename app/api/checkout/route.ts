import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { verifyPublicAccessToken } from '@/lib/orders/publicAccess';
import { validateAndNormalizeCheckoutItems } from '@/lib/orders/services/checkoutSecurity';
import { getOrderRepository } from '@/lib/orders';
import { checkoutIsEnabled } from '@/lib/stripe/readiness';

const requestSchema=z.object({orderId:z.string().uuid(),token:z.string().min(20).max(100)});
export async function POST(request:NextRequest){
 if(!checkoutIsEnabled()) return NextResponse.json({error:'Checkout is being verified. Please check back shortly.'},{status:503});
 try {
  const body=requestSchema.parse(await request.json());
  const repository=getOrderRepository();
  const order=await repository.getById(body.orderId);
  if(!order||!verifyPublicAccessToken(body.token,order.publicTokenHash)) return NextResponse.json({error:'Price quote not found'},{status:404});
  if(order.status!=='pending_payment'||Date.now()-order.createdAt.getTime()>900000) return NextResponse.json({error:'This price quote has expired. Please review a new price.'},{status:409});
  // Recheck eligibility and mappings; money and address come from the saved quote.
  const items=await validateAndNormalizeCheckoutItems(order.items.map(item=>({productId:item.productId,variantId:item.localVariantId,quantity:item.quantity,name:item.name,image:item.image,size:item.size,color:item.color,unitPrice:item.unitPrice,printfulVariantId:item.printfulVariantId})));
  const session=await createCheckoutSession({items,shippingAddress:order.shippingAddress,baseUrl:process.env.NEXT_PUBLIC_SITE_URL||request.nextUrl.origin,orderId:order.id,orderAccessToken:body.token,shipping:order.shipping});
  await repository.update(order.id,{stripeCheckoutSessionId:session.id});
  return NextResponse.json({url:session.url,isDemo:false});
 }catch(error){
  console.error('Checkout session creation failed');
  return NextResponse.json({error:error instanceof z.ZodError?'Invalid price quote':'Checkout could not start. Please review a new price.'},{status:error instanceof z.ZodError?400:422});
 }
}
