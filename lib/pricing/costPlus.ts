export type ProcessingFees = { basisPoints: number; fixedCents: number };

/** Covers the full fulfillment bill and $2 per shirt, including fees on shipping. */
export function calculateCostPlusTotal(fulfillmentCents: number, quantity: number, fees: ProcessingFees) {
  if (!Number.isSafeInteger(fulfillmentCents) || fulfillmentCents < 0 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100 || !Number.isSafeInteger(fees.basisPoints) || fees.basisPoints < 0 || fees.basisPoints >= 10000 || !Number.isSafeInteger(fees.fixedCents) || fees.fixedCents < 0) {
    throw new Error('Invalid cost-plus pricing inputs');
  }
  const targetProfitCents = quantity * 200;
  const numerator = (fulfillmentCents + targetProfitCents + fees.fixedCents) * 10000;
  if (!Number.isSafeInteger(numerator)) throw new Error('Cost exceeds pricing limits');
  const totalCents = Math.ceil(numerator / (10000 - fees.basisPoints));
  const processingCents = Math.round(totalCents * fees.basisPoints / 10000) + fees.fixedCents;
  return { totalCents, processingCents, profitCents: totalCents - fulfillmentCents - processingCents, targetProfitCents };
}
