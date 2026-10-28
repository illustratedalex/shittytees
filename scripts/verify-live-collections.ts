import {createHash} from 'node:crypto';
import {getCatalogRepository} from '../lib/catalog';
import {getStripe} from '../lib/stripe/client';
import {getPool} from '../lib/orders/database';
import {printfulRequest} from '../lib/printful/client';
import designs from '../data/designs/new-collections.json';
import proof from '../data/designs/collection-product-proof.json';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
if(process.env.VERCEL_ENV!=='production'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Live native verification only');
async function main(){
 const stripe=getStripe();if((await stripe.accounts.retrieve()).id!=='acct_1UPvlRIsn0OPIJry')throw new Error('Wrong merchant');
 const shop=await fetch('https://shittytees.com/shop');const html=await shop.text();if(!shop.ok)throw new Error('Public shop unavailable');
 const repo=getCatalogRepository();
 for(const d of designs){
  const p=await repo.getPublicBySlug(d.slug);const expected=proof.find(e=>e.slug===d.slug)!;
  if(!p||p.printfulProductId!==String(expected.productId)||p.collectionSlug!==d.collection||p.variants.length!==4||p.variants.some(v=>!v.available)||!html.includes('/shop/'+d.slug))throw new Error('Not live '+d.slug);
  const provider=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+expected.productId)).result;
  if(provider.sync_variants.length!==4||provider.sync_variants.some(v=>v.is_ignored||v.availability_status!=='active'||!v.files?.some(f=>f.id===expected.fileId&&f.type==='default')))throw new Error('Provider not active');
  const page=await fetch('https://shittytees.com/shop/'+d.slug);const pageHtml=await page.text();if(!page.ok||!pageHtml.includes('ADD TO CART'))throw new Error('Product page unavailable '+d.slug);
  const image=await fetch('https://shittytees.com'+d.mockup);if(!image.ok||createHash('sha256').update(Buffer.from(await image.arrayBuffer())).digest('hex')!==expected.mockupSha256)throw new Error('Live mockup mismatch');
  const v=p.variants.find(v=>v.size==='M')!;
  const q=await fetch('https://shittytees.com/api/checkout/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{productId:p.id,variantId:v.id,quantity:1,name:p.name,image:d.mockup,size:v.size,color:v.color,unitPrice:v.retailPrice,printfulVariantId:v.printfulVariantId}],shippingAddress:{firstName:'John',lastName:'Doe',email:'test@example.com',address:'19749 Dearborn St',city:'Chatsworth',state:'CA',postalCode:'91311',country:'US'}})});
  const quote=await q.json();if(!q.ok||(!Number.isFinite(quote.total)||quote.total<quote.subtotal||Math.round((quote.subtotal+quote.shipping+quote.tax)*100)!==Math.round(quote.total*100)))throw new Error('Public quote failed '+d.slug+' '+q.status);
  const c=await fetch('https://shittytees.com/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:quote.orderId,token:quote.token})});const checkout=await c.json();if(!c.ok||!checkout.url||checkout.isDemo)throw new Error('Public checkout failed');
  const rows=await getPool().query('SELECT stripe_checkout_session_id FROM orders WHERE id=$1',[quote.orderId]);const id=rows.rows[0]?.stripe_checkout_session_id;if(!id)throw new Error('Session not saved');
  const s=await stripe.checkout.sessions.retrieve(id);
  if(s.payment_status!=='unpaid'||s.customer_email!=='test@example.com')throw new Error('Unexpected test session');
  try{if(!s.livemode||s.amount_total!==Math.round(quote.total*100)||s.status!=='open')throw new Error('Live checkout mismatch');}finally{if(s.status==='open')await stripe.checkout.sessions.expire(id);}
  const expired=await stripe.checkout.sessions.retrieve(id);if(expired.status!=='expired'||expired.payment_status!=='unpaid')throw new Error('Session cleanup failed');
  console.log('COLLECTION_LIVE_VERIFIED',JSON.stringify({slug:d.slug,productId:expected.productId,variants:4,itemPrice:v.retailPrice,publicPage:200,mockup:true,total:quote.total,session:id,expired:true,charged:false}));
 }
 for(const collection of [...new Set(designs.map(d=>d.collection))]){const r=await fetch('https://shittytees.com/collections/'+collection);const h=await r.text();if(!r.ok||designs.filter(d=>d.collection===collection).some(d=>!h.includes('/shop/'+d.slug)))throw new Error('Collection missing '+collection);console.log('COLLECTION_PAGE_VERIFIED',JSON.stringify({collection,products:2,status:200}));}
 await getPool().end();
}
main().catch(async e=>{console.error('Live collection verification failed',e instanceof Error?e.message:'unknown');await getPool().end();process.exitCode=1});
