import {createHmac,timingSafeEqual} from 'node:crypto';
import {requirePrintfulCredentials} from './env';

// Printful v1 supports URL authentication, not a signature header. Derive a
// separate callback credential; never put the API token in the callback URL.
export function printfulWebhookToken():string {
 const {apiToken,storeId}=requirePrintfulCredentials('webhook authentication');
 if(storeId!=='18894982') throw new Error('Native webhook store required');
 return createHmac('sha256',apiToken).update(`shittytees:printful:v1:webhook:${storeId}`).digest('hex');
}
export function validatePrintfulWebhookToken(token:string):boolean {
 if(!/^[a-f0-9]{64}$/.test(token)) return false;
 try {return timingSafeEqual(Buffer.from(token,'hex'),Buffer.from(printfulWebhookToken(),'hex'));}catch{return false;}
}
