import { NextResponse } from 'next/server';
import { getPrintfulEnv } from '@/lib/printful/env';
export const dynamic = 'force-dynamic';
function sanitize(value: string): string { return value.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]').replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]').slice(0, 500); }
async function call(path: string) {
 const env=getPrintfulEnv();
 const response=await fetch('https://api.printful.com'+path,{headers:{Authorization:'Bearer '+env.apiToken,'X-PF-Store-Id':env.storeId,'X-Store-Id':env.storeId},cache:'no-store'});
 const payload=await response.json().catch(()=>null);
 if(!response.ok){const result=payload?.result; return {status:response.status,code:payload?.code,message:sanitize(typeof result?.error==='string'?result.error:'Unknown Printful error')};}
 return {status:response.status,code:payload?.code,result:payload?.result};
}
export async function GET(){
 const env=getPrintfulEnv();
 const stores=await call('/stores');
 const selected=stores.status===200&&Array.isArray(stores.result)&&stores.result.some((s:{id?:number})=>String(s.id)===env.storeId);
 const products=await call('/store/products?status=all');
 return NextResponse.json({storeAccess:{status:stores.status,code:stores.code,intendedStoreMatched:selected},products:{status:products.status,code:products.code,message:'message' in products?products.message:undefined,resultCount:Array.isArray(products.result)?products.result.length:undefined}});
}