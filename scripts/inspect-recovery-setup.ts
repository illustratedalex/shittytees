import {printfulRequest} from '../lib/printful/client';
async function main(){if(process.env.PRINTFUL_STORE_ID!=='18894982')throw new Error('Native store only');for(const path of ['/products/71','/mockup-generator/printfiles/71']){const r=await printfulRequest(path);console.log('RECOVERY_SETUP',path,JSON.stringify(r.result));}}
main().catch(e=>{console.error(e instanceof Error?e.message:'Setup inspection failed');process.exitCode=1});
