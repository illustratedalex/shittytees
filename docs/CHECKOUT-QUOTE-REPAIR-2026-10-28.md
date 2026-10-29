# Checkout quote repair — October 28, 2026

## Confirmed failure and repair
Alex reported REVIEW DELIVERED PRICE repeatedly returning "We could not confirm this price. Refresh your cart and try again." Production logs confirmed "Invalid Printful cost" from lib/printful/costs.ts. A direct estimate-only request returned numeric shipping 5.3500000000000005. The parser incorrectly rejected valid cent amounts containing binary floating-point noise.

The repair accepts finite nonnegative numeric cent amounts within floating-point rounding error, converts them to safe integer cents, and still rejects genuine fractional-cent amounts, malformed decimal strings, missing values, negatives and nonfinite values. Decimal strings remain strictly limited to two places.

## Release and checks
Live Production: dpl_2JGyPEx8mRUf2oxrSrkxhgXZtWaA, commit 00fdf2a9d0f9528121654a99d627cb69fd2f4e0b, branch stripe-printful-migration-audit.
Normal production build is READY and owns shittytees.com. Main unchanged.
Preview validation dpl_Geec6azGJ9ykGAA7szzVBm4qQ7ko passed 152 tests, lint, TypeScript and build.

Current read-only GET /api/printful/products returned connected=true, remoteProducts=14 and remoteAvailableProducts=14.
The protected credential was used only by the existing application/build runtime, never extracted or exposed. Existing Printful native store is 18894982. The old Square-connected store is preserved; do not recreate the native store or rebuild the fourteen products.

All twelve collection designs passed fresh checks of native variants, correct artwork, public images/pages, destination quotes and matching live Stripe Checkout sessions. Every session was immediately expired unpaid. Verification build dpl_F5hQ56kjSeV9E4grSgJWyRKuNZhc deliberately exited 1 after successful proof to avoid replacing Production.
Both political designs passed matching fresh quote/Checkout checks in dpl_4HAZ6PAT1UhRW9w1oejyshhX687V, also deliberately exited 1. Neither test modified their catalog mappings.
Sample Chatsworth CA one-shirt quote is now 21.97 USD (13.92 item + 8.05 delivery/handling). This is a sample destination amount, not universal pricing.
Browser verification of Elected, Not Housebroken M/Black reached PAY WITH STRIPE with the same 21.97 quote.
No fresh quote errors were returned for the new Production deployment during verification.

No card was entered or charged, no paid order was placed, and no supplier production order was confirmed by this repair. This is checkout/quote/session verification, not a new paid fulfillment or physical shipment proof.

## Remaining approved publication
Please Hold — Your Crisis Is Not My Hobby remains approved but NOT LIVE. Artwork: Library libfile_df962d6fd5388191969d7c5dcdedc1c4 (Please-Hold-sRGB-172ppi-10in.png); design review libfile_4ee4a6617cc48191a1413598ce67f92e. Complete supplier-specific artwork/opacity/placement checks, verify current garment options/costs, create a non-sale native draft without duplication, generate official mockups, verify actual Sync Product/Variant/Catalog IDs, and publish through the existing catalog workflow. User explicitly authorized proceeding and publication. Shitty Politics belongs on shittytees.com as a collection, using the same fulfillment store.
