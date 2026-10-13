# Shitty Tees verified migration status — October 13, 2026

## Live store

Production deployment dpl_BCBxydURps5av7eW48UqpMBre3dU (commit 019b4fcae4b99bf80aa9fea0530b019b979d255e) is READY and serves shittytees.com. Normal npm run build; no one-off build script in the live deployment. Main remains unchanged; Production was explicitly deployed from the migration branch under Alex's permission to finish and enable verified sales.

The redesigned homepage, navigation, footer, shop and two political product pages are live. Final browser verification confirmed only Dead Tired remains in the shop coming-soon section. Audit Preview dpl_Ak2tLsH5sr2mj29t6akSMCAh1Xir is also READY with test-order creation disabled. Unfinished listings remain unavailable while old URLs are preserved. Native Black Bella + Canvas 3001 variants S/M/L/XL are published in Production and active/unignored in Printful. Production checkout, fulfillment and automatic confirmation flags are enabled. Preview test-order creation is disabled.

Square is removed from the deployed payment/fulfillment path. The legacy Square-store API token was blanked; every Vercel deployment uses only the native token for store 18894982. The old Square store 7561356 and designs were preserved as an archive, not deleted.

## Verified mappings

| Design | Native product | S | M | L | XL | Default print file |
| --- | --- | --- | --- | --- | --- | --- |
| Elected, Not Housebroken | 480976406 | 5569301209 / 4016 | 5569301208 / 4017 | 5569301207 / 4018 | 5569301210 / 4019 | 1085648812 |
| Campaign Promises — Batteries Not Included | 480976408 | 5569301218 / 4016 | 5569301217 / 4017 | 5569301216 / 4018 | 5569301219 / 4019 | 1085648838 |

Variant cells are Sync Variant / Catalog Variant IDs. All eight Black variants were independently checked active/in-stock, matching garment, size and default artwork. Provider retail prices and website item prices are 13.92 USD each for these four sizes. Numeric product IDs are now mapped independently of external references; the two Production records were repaired after detecting historical ID conflation.

Files are transparent 3000×4000 PNG, 250 DPI, a 12×16-inch canvas with 11.5-inch-wide art and 0.5-inch top placement. Source art was upscaled with Alex's explicit permission; this does not restore native detail or constitute a physical print proof. Official Printful mockups, processed files, file bytes and placement were verified. Dead Tired and Bad Decisions are not production-verified sale listings.

## Pricing

The earlier proposed 36 USD flat retail price is retired. Per-size item price is verified production cost 11.92 + 2.00. Destination delivery/handling covers Printful shipping, supplier tax, and an integer processing-fee gross-up (4.4% + 0.30 allowance). Card/Apple Pay checkout only; Link disabled on the separate test and live merchant configurations to avoid unpriced BNPL paths. This targets at least 2 USD per shirt under the standard US card fee profile plus international-card allowance; custom merchant rates or future supplier fees require review.

Chatsworth CA sample: one shirt total 21.55 = item13.92 + handling7.63; actual Printful draft bill18.30 (11.92 production +4.95 shipping +1.43 tax). Two-shirt browser quote39.91 =27.84 items +12.07 delivery/handling. Totals are stored before Stripe; paid amounts and variant mappings are validated against the saved order. Quotes expire in15minutes. Unique order-item UUIDs fix repeated purchases of the same variant colliding with earlier order item primary keys.

## End-to-end proof

Two real Stripe sandbox card payments at the destination price passed with genuine signed checkout.session.completed receipts and matching native Printful drafts. Neither draft was confirmed:

| Design / size | Saved order | Stripe event | Printful draft | Paid total |
| --- | --- | --- | --- | --- |
| Elected / S | 3118823b-c740-4945-ae9e-3c401ea71f8d | evt_1UQD1lRIGojPaEKCc15Hh7nV | 180769197 | 21.55 |
| Campaign / XL | 78242ed5-3e0d-4ef9-9e0f-bd382e436133 | evt_1UQDOKRIGojPaEKCX6BkFEBw | 180772314 | 21.55 |

Live merchant acct_1UPvlRIsn0OPIJry has charges and payouts enabled. No Modern Relic credential was used. Production signing secret was verified using actual unpaid expired Checkout event evt_1UQDSMIsn0OPIJryyJcsn4a9, recorded as processed in Production. Live webhook we_1UQCEXIsn0OPIJry4vhIvy20 was restored to the four required events after that test.

Printful v1 callback is configured for native store18894982 with an HMAC-derived URL token, not the raw API key and not an invented provider signature header. Authenticated synthetic endpoint probe200 and missing-token401 passed; actual provider shipment delivery is not yet observed. Retryable processing receipts are recorded only after success. Failed provider confirmation does not falsely mark an order fulfilled.

Both live public product pages and official mockups were verified in the browser. Individual live Checkout sessions for both products were created from real public quote/checkout endpoints and immediately expired unpaid, independently checked in the correct merchant account. Repeated live sessions after the UUID fix passed (orders b830a832-6cfa-4896-b0fc-7821018207ca and06e400bd-f60d-467c-b1a7-7aec7921e7d9). A browser cart with both M/Black shirts quoted39.91 and opened matching live Stripe Checkout. No real card entered and no charge made. The combined browser session was subsequently independently expired unpaid (3991 cents) via guarded audit build dpl_BFXRPJmUweD5RnGwba9ABDhnT2Fb. A bare /checkout/success URL correctly showed Check Your Order Status without claiming payment.

131 tests, lint, TypeScript and production build passed. Local actual-component mobile390/desktop1440 render checks had no JS errors or horizontal overflow; mobile fixtures do not independently prove live APIs. Live browser flow and deployed assets were checked separately. Payment success now requires matching saved order/private token and actual Stripe paid status; purchased quantities are removed once from the cart.

No physical production/shipment or first real paid order has been tested. Production automatically submits genuine paid orders; provider billing failures are surfaced and remain retryable.

## Facebook launch

Existing conditional automation6acd1e9699b881919996577f4b50b4a5 published while final manual checks were running. Its recorded post ID103562802200116_1177601838130608 predates the manual duplicate103562802200116_1177603474797111 (photo1177603458130446). The manual post was verified publicly at https://www.facebook.com/100076424088056/posts/1177603474797111/ with correct caption, both product links, matching Campaign mockup and public audience. The launch automation is now disabled. Do not post again.

Windsor cached reads initially returned no posts and hourly refresh is unavailable on the connected trial; the concurrent automation's completion became visible only when disabling it. The connected actions expose create_post/create_photo_post/upload_photo, but not delete/trash. The extra manual post still requires removal in Facebook. The original post was independently verified publicly at https://www.facebook.com/1177602014797257/posts/1177601838130608. Do not claim exactly one launch post until duplicate cleanup is verified.

## Operational note

Several one-off configuration/proof builds deliberately exit1 after performing their guarded work so they never replace Production. Their expected failed build status is not an unresolved app build failure. Use the latest normal READY Production deployment above for live status. Tokens, callback credentials, private order access URLs and hosted live payment URLs are not included in this report.
