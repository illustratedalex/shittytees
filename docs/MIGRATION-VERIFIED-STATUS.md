# Shitty Tees migration — verified 2026-10-13

Branch: `stripe-printful-migration-audit`. Production/main has not been switched.

## Verified Preview

- Redesign with actual design assets and official Printful garment mockups.
- Native Printful store `18894982` (old Square store preserved).
- ShittyTees sandbox `acct_1UPvlWRIGojPaEKC`; ModernRelic credentials are not used.
- Two actual hosted sandbox card payments completed at $40.95 each (draft $36 retail plus $4.95 shipping). No real money moved.
- Their original Stripe events were signed and delivered to the Preview webhook. Initial draft creation failed because external order IDs exceeded Printful's 32-character limit. Compatible IDs are now preserved; longer IDs are deterministically hashed.
- Stripe's official CLI redelivered the original events after the fix. Both event receipts are processed, and both order histories record `pending_payment → paid → printful_draft_created` from `stripe_webhook`.

| Design | Stripe event | Printful draft | Sync variant | Catalog variant | Print file |
|---|---|---:|---:|---:|---:|
| Elected, Not Housebroken | evt_1UQAAERIGojPaEKCP221kDZD | 180746567 | 5569301209 | 4016 | 1085648812 |
| Campaign Promises — Batteries Not Included | evt_1UQACMRIGojPaEKCaPUmDkaA | 180746568 | 5569301218 | 4016 | 1085648838 |

Both drafts were independently retrieved from Printful and remain `draft`, unconfirmed. The tests used Printful's published sample destination and dummy contact details. No customer contact data or access tokens are in this report.

Print files are transparent 3000×4000 PNGs at 250 DPI on a 12×16-inch canvas. These were enlarged from lower-resolution originals; pixel dimensions do not restore native artwork detail. Provider file status and mockup placement are verified, but physical print quality remains unverified. All eight S/M/L/XL Black Bella + Canvas 3001 mappings were checked; the payment tests used S/Black.

112 tests, lint and type checks passed after the external-ID fix. Earlier desktop/mobile checks passed; confirmation and order-status layouts were subsequently corrected during the hosted test.

## Current production verification

- The saved Production restricted Stripe key was exercised inside Vercel. It belongs to Shitty Tees account `acct_1UPvlRIsn0OPIJry`, with charges and payouts enabled. It read the enabled live endpoint `we_1UQCEXIsn0OPIJry4vhIvy20` at `https://shittytees.com/api/stripe/webhook`, with all four required events. A live internal Checkout session was created and immediately expired, unpaid; its URL was never published. This proves Checkout permissions, not a live payment or signed production delivery.
- The native token `PRINTFUL_API_TOK` is now scoped to Production and Preview under Alex’s explicit approval. Both native products and all eight file/garment mappings were read successfully using that token in Production. The global store selector was then updated to native store `18894982`. Old Square store/designs remain preserved in Printful.
- Production database connectivity and `catalog_products`, `catalog_variants`, `orders`, `order_status_events`, and `processed_webhook_events` were verified. Demo checkout, fulfillment and automatic confirmation were off during the audit.
- These production audit builds deliberately exited before building/publishing the website. The live website has not yet been switched.

## Prepared checkout changes awaiting Preview verification

- Saved destination quotes expire after 15 minutes, require a private access token and are rechecked against available product mappings before Stripe opens. Client totals cannot replace saved prices.
- Item prices by size are set from verified production cost plus $2. Delivery/handling includes destination shipping, supplier tax and a processing-fee allowance. The draft $36 flat retail price is retired when the new catalog registration runs.
- The processing profile is the published US card rate with the international-card allowance: 4.4% plus $0.30 on the total. Checkout is restricted to cards and card wallets so BNPL fees cannot invalidate the quote. Profit targets at least $2 per shirt under that profile; domestic cards leave a small additional margin. This is not a guarantee about a custom merchant fee contract.
- Supplier tax can depend on retail prices in some destinations. Quotes iterate with the exact item and delivery amounts sent to Printful until the bill and customer total converge; failures block checkout.
- An explicit Production checkout switch requires native credentials, a live Stripe key, signing secret and enabled fulfillment before payment sessions can open.
- Printful v1 callback authentication uses a separate derived URL credential because the provider does not send the previously assumed `X-Printful-Signature` header. Callback configuration/delivery still require verification. Retry receipts are saved after successful processing.

## Remaining launch checks

- Run the new catalog registration in Preview; verify the reviewed delivered price and hosted payment flow after the pricing changes. Test orders must remain unconfirmed.
- Register the two native products as Production drafts. Verify a signed live webhook without charging a customer, then deploy the normal build and verify desktop/mobile purchase pages and cart.
- Configure and verify the native Printful callback, enable the final published mappings and checkout/fulfillment switches only after these checks. Disable Preview test draft creation afterward.
- No Facebook launch occurred. Preserve the existing conditional automation; post once only after both political products are genuinely purchasable, verify the shareable post URL, then disable it.
- Dead Tired and Bad Decisions remain unverified production products.

The native dimensions, file status and official mockup placement are verified; physical print quality is not. Use `scripts/inspect-politics-test-orders.ts` to recover earlier sandbox receipts without making another payment.
