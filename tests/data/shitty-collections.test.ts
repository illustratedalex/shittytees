import {describe,it,expect} from 'vitest';
import {SHITTY_COLLECTIONS} from '@/data/shittyCollections';
import designs from '@/data/designs/new-collections.json';
import {getCollectionBySlug} from '@/lib/catalog/service';
import {getProductPresentation} from '@/data/productPresentation';
describe('Shitty Tees collection family',()=>{
 it('keeps Politics and each new collection under the same parent catalog',()=>{
  expect(SHITTY_COLLECTIONS).toHaveLength(7);
  for(const c of SHITTY_COLLECTIONS)expect(getCollectionBySlug(c.slug)?.name).toBe(c.name);
 });
 it('assigns exactly two distinct new designs to each of the six new collections',()=>{
  expect(designs).toHaveLength(12);
  expect(new Set(designs.map(d=>d.slug)).size).toBe(12);
  for(const c of SHITTY_COLLECTIONS.filter(c=>c.slug!=='shitty-politics'))expect(designs.filter(d=>d.collection===c.slug)).toHaveLength(2);
 });
 it('uses the expected official shirt mockup for every new product',()=>{
  for(const d of designs)expect(getProductPresentation(d.slug)?.frontImage).toBe(d.mockup);
 });
});
