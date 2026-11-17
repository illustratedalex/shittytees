# Stripe and Printful cutover

Implemented on stripe-printful-migration-audit; not a production cutover.

- Checkout saves the server-validated order, prices, delivery address and access-token hash before creating a Stripe session.
- Shipping is quoted from Printful for the submitted US destination using actual catalog variant IDs resolved from sync variants. No arbitrary $10 shipping fallback.
- Shipping is a Stripe shipping rate, so the webhook can reconcile it separately from products. The customer confirms the saved delivery address in checkout; changing it requires returning to the cart and obtaining a fresh quote.
- Stripe metadata contains the order ID and version rather than the entire cart, avoiding the per-value metadata size limit.
- Paid webhooks use the saved purchase snapshot and verify session, currency and totals. A later catalog price change cannot invalidate the already-paid order.
- Failed Stripe webhook work remains retryable. Test payments can create explicitly gated Printful drafts, and cannot automatically confirm production fulfillment.
- Preview requires a Stripe test key. Cash App Pay can be enabled with STRIPE_ENABLE_CASH_APP=true after verifying eligibility on the Shitty Tees merchant account.
- The cart no longer presents an invented 8% tax or fixed shipping total. Current checkout collects zero tax; tax configuration is a launch requirement, not a verified policy.

## Verified locally

Lint, TypeScript checks and tests pass. Production build passes. Tests exercise price tampering, immutable paid orders, total mismatches, webhook retry, duplicate events, destination shipping and draft-only test fulfillment. These are mocked integration tests; they do not establish a real payment or Printful production order.

## Remaining launch requirements

1. Create and authorize a separate Shitty Tees Stripe merchant account under Alex's existing login. The currently connected live account is Needlebook; do not rebrand or change it.
2. Provision that account's test key and webhook signing secret securely into Preview; then its live credentials into production after testing. Connecting the ChatGPT Stripe plugin does not install these deployment credentials.
3. Confirm tax handling and actual Printful production costs, size-specific prices, processing fees and the requested $2 margin. These are not verified by the current fixed retail prices.
4. Finish exact Printful product/variant/artwork mappings. Keep unverified variants unavailable. The two approved politics artworks still need production file validation and matching real product mockups.
5. Run a real Stripe test Checkout -> signed webhook -> saved paid order -> Printful draft, verify the correct image/size/color/address/amount, and test failure recovery. Never confirm that test order.
6. Reconcile concurrent webhook deliveries and ambiguous Printful request failures against the same external order ID before enabling automatic production confirmation.
7. Disable demo checkout, configure production persistence, verify public product pages and purchase links, then promote the tested release. No live cutover has happened in this change.

No Square payment dependency is introduced. The existing Printful store reports type square; migrating its store context is a separate operational step and must not delete the existing designs or orders.
