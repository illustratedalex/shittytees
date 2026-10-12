import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  if (process.env.VERCEL_ENV === 'preview' && !/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY)) {
    throw new Error('Preview checkout requires a Stripe test key');
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}
