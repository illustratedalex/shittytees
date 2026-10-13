import {describe,expect,it} from 'vitest';
import {resolveProductImage} from '@/lib/products/imageResolver';
describe('verified native garment mockups',()=>{
 for(const [slug,file] of [['elected-not-housebroken','elected'],['campaign-promises-batteries-not-included','campaign']]){
  it('uses the official shirt mockup for '+slug,()=>{
   const image=resolveProductImage({slug,name:slug,images:[{id:'front',src:`/images/designs/${file}-printful-front.png`,alt:'Official shirt mockup'}]});
   expect(image.isPreview).toBe(false);expect(image.role).toBe('front-flat');expect(image.src).toBe(`/images/designs/${file}-printful-front.png`);
  });
 }
});
