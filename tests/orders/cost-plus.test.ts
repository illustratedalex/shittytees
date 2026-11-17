import { describe, expect, it } from 'vitest';
import { calculateCostPlusTotal } from '@/lib/pricing/costPlus';

describe('cost-plus pricing', () => {
  it('covers processing fees on the complete fulfillment bill, including shipping', () => {
    const result = calculateCostPlusTotal(1687, 1, {basisPoints: 290, fixedCents: 30});
    expect(result.totalCents).toBe(1975);
    expect(result.processingCents).toBe(87);
    expect(result.profitCents).toBe(201);
  });
  it('adds $2 for every shirt while charging the fixed processing fee once per order', () => {
    const result = calculateCostPlusTotal(5000, 3, {basisPoints: 290, fixedCents: 30});
    expect(result.profitCents).toBeGreaterThanOrEqual(600);
    expect(result.profitCents).toBeLessThanOrEqual(601);
  });
  it('handles zero-fee methods and rejects invalid quantities, fees, or fractional cents', () => {
    expect(calculateCostPlusTotal(1000, 2, {basisPoints:0, fixedCents:0}).totalCents).toBe(1400);
    for (const args of [[-1,1,290,30],[1.5,1,290,30],[100,0,290,30],[100,1,10000,30]]) {
      expect(() => calculateCostPlusTotal(args[0],args[1],{basisPoints:args[2],fixedCents:args[3]})).toThrow();
    }
  });
});
