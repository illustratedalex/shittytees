import {printfulRequest} from '../lib/printful/client';
import designs from '../data/designs/new-collections.json';
import proof from '../data/designs/print-asset-proof.json';
import type {PrintfulStoreProductDetail} from '../lib/printful/types';
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Native audit Preview only');
async function main(){
 const products=(await printfulRequest<Array<{id:number;external_id:string}>>('/store/products?limit=100')).result;
 for(const d of designs){
  const p=products.find(p=>p.external_id==='shittytees-'+d.slug);if(!p)throw new Error('Missing native product '+d.slug);
  const detail=(await printfulRequest<PrintfulStoreProductDetail>('/store/products/'+p.id)).result;
  const expected=proof.find(p=>p.slug===d.slug)!;
  const ids=[...new Set(detail.sync_variants.flatMap(v=>(v.files||[]).filter(f=>f.type==='default').map(f=>f.id)))];
  if(ids.length!==1||!ids[0]||detail.sync_variants.length!==4)throw new Error('Unexpected artwork mapping');
  const file=(await printfulRequest<{id:number;hash:string;width:number;height:number;dpi:number;status:string}>('/files/'+ids[0])).result;
  if(file.hash!==expected.md5||file.width!==3000||file.height!==4000||file.status!=='ok')throw new Error('Print upload mismatch '+d.slug);
  console.log('COLLECTION_FILE_VERIFIED',JSON.stringify({slug:d.slug,productId:p.id,file,variants:detail.sync_variants.map(v=>({id:v.id,catalog:v.variant_id,size:v.size,color:v.color,ignored:v.is_ignored,status:v.availability_status}))}));
 }
}
main().catch(e=>{console.error('Collection inspection failed',e instanceof Error?e.message:'unknown');process.exitCode=1});
