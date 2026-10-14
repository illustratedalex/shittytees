# Twelve collection designs — publication verification, October 14, 2026

## Prepared artwork and existing products

All twelve approved transparent 3000 × 4000 PNG print masters matched the processed Printful file hashes and dimensions. The twelve native products created on October 13 were reused; no duplicate product creation was performed. Each has Black Bella + Canvas 3001 sizes S, M, L and XL.

All twelve completed Printful mockup tasks covered catalog variants 4016–4019. Their original PNG bytes were downloaded, visually reviewed, saved permanently in the repository and matched against the public production image URLs. Temporary provider mockup URLs are retained only as provenance, not used on the storefront.

| Category | Design | Native product | Print file |
| --- | --- | --- | --- |
| shitty-jobs | Corporate Family — Pay My Fucking Bills | 481316035 | 1085846746 |
| shitty-jobs | Minimum Wage — Maximum Fuck You | 481316039 | 1085846769 |
| shitty-childhoods | Raised Wrong — Still Your Fucking Problem | 481316043 | 1085846786 |
| shitty-childhoods | My Childhood — Paid My Therapist’s Mortgage | 481316217 | 1085847260 |
| shitty-cars | Check Engine — Fuck My Life | 481316222 | 1085847279 |
| shitty-cars | Shitbox — Financial Hostage | 481316410 | 1085847833 |
| shitty-housing | Live, Laugh — Fuck the Landlord | 481316412 | 1085847852 |
| shitty-housing | Rent Is Due — So Is the Revolution | 481316547 | 1085848420 |
| shitty-relationships | My Ex — Was a Fucking Warning Label | 481316551 | 1085848432 |
| shitty-relationships | Love Is Blind — Divorce Is Expensive | 481316726 | 1085848866 |
| shitty-decisions | Fuck Around — Keep the Receipts | 481316731 | 1085848883 |
| shitty-decisions | Bad Influence — Worse Fucking Ideas | 481316975 | 1085849606 |

## Tested products

All 48 variant mappings passed checks for design, garment, size, color, active/in-stock status and the correct processed print file. Printful draft 180884644 (`st-collections-20261014`) contains all 48 variants with their matching artwork and remains unconfirmed. No production order was confirmed or billed by this verification.

Provider cost estimates were checked for every variant: production cost $11.92, item price $13.92 (cost plus $2). The existing destination quote still includes supplier shipping, supplier tax and the 4.4% + $0.30 processing allowance. The Chatsworth CA one-shirt sample is $21.55 total, not a universal delivered price.

Local verification: 134 tests, lint, TypeScript and the Next.js production build passed. A remote attempt to run tests with NODE_ENV=production failed because React act is unavailable in that mode; a subsequent Preview build used NODE_ENV=test and reached READY.

## Release sequence

Production records were first saved as drafts with every variant unavailable. Normal Production deployment dpl_Ccpwn7SGKxNAezP5Pv6EV5Pp5hMy reached READY at commit 6b5ac552ce706359d7a2f9ffda2ae9d4024f16c0. The public category layout was inspected before sale activation. The publication workflow checks all designs first, activates and verifies their Printful variants, then publishes each website record.

The initial Production deployment request was rejected by automatic approval review over concern that Preview availability implied Production availability. Fresh Production logs established all twelve records were drafts/unavailable; the subsequent deployment was accepted.

## Configuration preserved

Main was not changed. Checkout, Stripe merchant, destination pricing, fulfillment code, webhook code and environment settings were not altered. The two existing political products remain part of Shitty Tees. No other unverified variants were enabled. Guarded one-off verification/publication builds deliberately exit 1 and do not replace the normal READY Production deployment.

## Public verification

All twelve listings are genuinely live for sale on https://shittytees.com/shop. They appear in six Shitty Tees categories, two designs each: Jobs, Childhoods, Cars, Housing, Relationships and Decisions. The public collection pages each returned 200 and contained their expected pair. All twelve product pages returned 200 with an enabled Add to Cart button, and their public mockup bytes matched the permanent repository copies. All 48 native variants were independently read as active/unignored with their correct artwork.

Verification deployment dpl_64nnAHVuy8BF9i2cx5CZrS1az6qh checked a real public quote and live Stripe Checkout session for each design in the correct merchant account. All twelve sessions matched the $21.55 sample destination total and were immediately expired unpaid; no card was charged. Browser verification also confirmed the M/Black Minimum Wage shirt at $13.92 in the cart and a $21.55 delivered-price quote. The browser verification cart was emptied.

The two earlier political shirts still return 200 with enabled purchase buttons. The public shop shows fourteen sale listings total. Dead Tired remains coming soon.

The twenty-minute runtime scan found existing pg SSL-mode deprecation warnings on stderr, with no application failure messages in the returned records. No database security configuration was changed.

No new paid-card test or physical print/shipment proof is claimed. The 48-variant provider test order remains an unconfirmed draft. Previous signed Stripe-to-Printful test-payment proof for the existing checkout is preserved in MIGRATION-VERIFIED-STATUS.md.
