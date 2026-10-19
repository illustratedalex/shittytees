// Read-only inspection of the uploaded print masters and Printful-generated proofs.
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='stripe-printful-migration-audit'||process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Audit Preview only');
async function read(path){
 const r=await fetch('https://api.printful.com'+path,{headers:{Authorization:'Bearer '+process.env.PRINTFUL_API_TOK,'X-PF-Store-Id':'18894982'},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw new Error('Printful read failed '+r.status);
 return (await r.json()).result;
}
for(const [product,task] of [[480976406,'gt-983463841'],[480976408,'gt-983463861']]){
 const proof=await read('/mockup-generator/task?task_key='+task);
 console.log('POLITICS_PROOF',JSON.stringify({product,task,status:proof.status,error:proof.error,mockups:proof.mockups}));
 const detail=await read('/store/products/'+product);
 const fileIds=[...new Set(detail.sync_variants.flatMap(v=>v.files.filter(f=>f.type==='default').map(f=>f.id)))];
 for(const fileId of fileIds){
  try{const f=await read('/files/'+fileId);console.log('POLITICS_FILE',JSON.stringify({product,id:f.id,hash:f.hash,filename:f.filename,width:f.width,height:f.height,dpi:f.dpi,status:f.status}));}
  catch{console.log('POLITICS_FILE',JSON.stringify({product,id:fileId,readable:false}));}
 }
 console.log('POLITICS_VARIANT_GATE',JSON.stringify({product,allIgnored:detail.sync_variants.every(v=>v.is_ignored),variants:detail.sync_variants.length}));
}
