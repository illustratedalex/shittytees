import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {hashPublicAccessToken} from '@/lib/orders/publicAccess';
const mocks=vi.hoisted(()=>({getById:vi.fn(),update:vi.fn(),normalize:vi.fn(),session:vi.fn()}));
vi.mock('@/lib/orders',()=>({getOrderRepository:()=>({getById:mocks.getById,update:mocks.update})}));
vi.mock('@/lib/orders/services/checkoutSecurity',()=>({validateAndNormalizeCheckoutItems:mocks.normalize}));
vi.mock('@/lib/stripe/checkout',()=>({createCheckoutSession:mocks.session}));
vi.mock('@/lib/stripe/readiness',()=>({checkoutIsEnabled:()=>true}));
import {POST} from '@/app/api/checkout/route';
const orderId='f891fced-6fe8-412f-9e08-fd0052d62c2a',token='test-token-of-sufficient-length';
function request(body:unknown){return new NextRequest('https://example.com/api/checkout',{method:'POST',body:JSON.stringify(body)});}
beforeEach(()=>{
 vi.resetAllMocks();
 mocks.getById.mockResolvedValue({id:orderId,publicTokenHash:hashPublicAccessToken(token),status:'pending_payment',createdAt:new Date(),items:[{productId:'p',localVariantId:'v',quantity:1,name:'Shirt',image:'/images/shirt.png',size:'S',color:'Black',unitPrice:13.92,printfulVariantId:'123'}],shippingAddress:{email:'test@example.com'},shipping:7.73});
 mocks.normalize.mockResolvedValue([{unitPrice:13.92,quantity:1}]);mocks.session.mockResolvedValue({id:'cs_test_quote',url:'https://checkout.stripe.com/test'});
});
describe('saved quote checkout',()=>{
 it('uses saved totals and address rather than injected client prices',async()=>{
  const response=await POST(request({orderId,token,shipping:0,items:[{unitPrice:0}]}));
  expect(response.status).toBe(200);
  expect(mocks.session).toHaveBeenCalledWith(expect.objectContaining({shipping:7.73,shippingAddress:{email:'test@example.com'},orderId}));
  expect(mocks.update).toHaveBeenCalledWith(orderId,{stripeCheckoutSessionId:'cs_test_quote'});
 });
 it('rejects someone else’s quote',async()=>{
  expect((await POST(request({orderId,token:'different-token-of-sufficient-length'}))).status).toBe(404);
  expect(mocks.session).not.toHaveBeenCalled();
 });
 it('rejects expired and already-paid quotes before creating a session',async()=>{
  const original=await mocks.getById();
  for(const patch of [{createdAt:new Date(Date.now()-900001)},{status:'paid'}]){
   mocks.getById.mockResolvedValue({...original,...patch});
   expect((await POST(request({orderId,token}))).status).toBe(409);
  }
  expect(mocks.session).not.toHaveBeenCalled();
 });
 it('rejects a product disabled after the quote was saved',async()=>{
  mocks.normalize.mockRejectedValue(new Error('Unavailable variant'));
  expect((await POST(request({orderId,token}))).status).toBe(422);
  expect(mocks.session).not.toHaveBeenCalled();
 });
});
