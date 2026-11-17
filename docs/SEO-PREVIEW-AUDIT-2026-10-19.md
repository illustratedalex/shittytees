# Storefront crawl URL repair — October 19, 2026

Status: implemented and tested locally; prepared for Preview review only. This record does not authorize production deployment or merging into main.

## Verified problem

Public checks of https://shittytees.com on October 19 found:

- `/shop` and `/collections/shitty-politics` returned HTTP 200, but `/shittytees/shop` and `/shittytees/collections/shitty-politics` returned 404.
- The live sitemap placed every URL under the nonexistent `/shittytees` prefix, including the homepage and published products.
- The shop and collection detail pages inherited the homepage canonical `/`. Existing relative product and collections-index canonicals lacked an explicit metadata base.
- Robots exclusions for cart, checkout and workspace used the obsolete prefix rather than the actual routes.

The current migration branch's existing Git deployment is a Preview. The live production release is separate: `dpl_Ccpwn7SGKxNAezP5Pv6EV5Pp5hMy`, commit `6b5ac552ce706359d7a2f9ffda2ae9d4024f16c0`.

## Change scope

- Generate sitemap URLs at the actual root-mounted routes. Preserve the existing public-product readiness query and active-product filter.
- Normalize a trailing slash on the configured sitemap origin.
- Permit public crawling and exclude the actual cart, checkout, workspace, admin, order and API routes. Robots rules are crawler guidance and do not replace authentication.
- Set the verified production metadata base to `https://shittytees.com` and remove the root canonical and Open Graph URL inherited by unrelated pages.
- Give the homepage, shop and collection-detail pages their own canonical and Open Graph URLs. Existing product, drop and collection-index canonicals now resolve against the production metadata base.

No catalog data, product readiness, price, billing, checkout, fulfillment, authentication, privacy copy, environment settings or domain routing was changed. Only `stripe-printful-migration-audit` may be updated, and only Preview may be deployed. Main and the live release must remain unchanged.

## Validation

- ESLint passed with zero warnings.
- All 136 tests across 39 files passed, including two new crawl-route regression cases. Test catalog access is mocked; no external fulfillment or payment request is made.
- Next.js 16.2.9 production build and its TypeScript validation passed.
- Sitemap and robots conventions and metadata-base behavior were checked against the installed Next.js documentation.
- Hosted Preview results and exact commit/deployment identifiers belong in the durable SEO tracker after deployment verification; local checks alone do not establish a live fix.

## Follow-up

This repair is not a production release. Remaining work includes distinct static-page titles/descriptions/canonicals, soft-404 handling for unknown collections, and checking whether legacy empty collections should remain in the sitemap. Those changes require separate review. No promotion submission or social post was published.
