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

## Launch blockers

- Production has no Shitty Tees Stripe secret key or webhook secret. Merchant account `acct_1UPvlRIsn0OPIJry` reports charges/payouts enabled, with a live document-capture requirement still due. Configure credentials securely in Vercel; do not paste secrets in chat.
- Production still references the old Printful store/token. The native-store token is branch-only under `PRINTFUL_API_TOK`; production must use a correctly scoped token under `PRINTFUL_API_TOKEN` and store `18894982` after verification.
- Pricing is prepared, not activated: draft $36 retail has not been reconciled with production + destination shipping + processing fees + $2 profit per shirt. The sample estimate ($20.56 supplier total) yields $23.55 customer total only under assumed 2.9% + $0.30 processing; actual merchant/payment-method fees and final destination taxes must be accounted for.
- Products remain draft/unavailable, and Printful variants ignored. Production fulfillment remains disabled; no test order can be confirmed through the fulfillment service.
- `PRINTFUL_ENABLE_TEST_ORDERS` must be `false` on the audit Preview after testing, with a clean deployment to apply it. Inspect the deployment receipt before claiming cleanup complete.
- No Facebook launch occurred. Preserve the existing conditional automation; post once only after both political products are genuinely purchasable, verify the shareable post URL, then disable it.
- Dead Tired and Bad Decisions are not verified production products yet.

Use `scripts/inspect-politics-test-orders.ts` for a read-only evidence report. Do not create another payment or retry mutation merely to recover this handoff.
