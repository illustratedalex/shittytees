# Drop Launch Guide

This guide explains how to launch or archive drops using the reusable ShittyTees storefront system.

## 1) Add a Drop

Edit [data/drops.ts](data/drops.ts) and append a new drop object.

Required fields:

- `id`
- `slug`
- `number`
- `label`
- `title`
- `description`
- `story`
- `theme`
- `featuredProductSlugs`
- `status`

## 2) Attach Products

Use product slugs that already exist in [lib/data/products.ts](lib/data/products.ts).

Do not create new product IDs/slugs in drop config.

## 3) Make a Drop Active

Set `status: "active"` in [data/drops.ts](data/drops.ts).

If the homepage should highlight the drop, reference it in [data/campaigns.ts](data/campaigns.ts).

## 4) Archive a Drop

Set `status: "archived"` and keep route data intact unless intentionally removed through a planned migration.

## 5) Add Campaign Content

Update:

- [data/campaigns.ts](data/campaigns.ts) for hero and marquee messaging
- [data/collections.ts](data/collections.ts) for collection band language
- [data/brand.ts](data/brand.ts) for brand-level copy refreshes

## 6) Verify Routes

Drop routes are generated from [app/drops/[slug]/page.tsx](app/drops/[slug]/page.tsx) using `generateStaticParams`.

Checklist:

1. route loads at `/drops/<slug>`
2. page metadata renders expected title/description
3. all product links resolve to existing `/shop/[slug]`

## 7) Validate Before Deploy

Run:

1. `rm -rf .next`
2. `rm -f tsconfig.tsbuildinfo`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`

## 8) Deploy Safety

Before deployment, confirm:

- no checkout/cart/API/Stripe/Printful behavior changes
- no dead links
- no Next.js dynamic params warnings
- no TypeScript errors
- responsive pass at key widths

## 9) Common Pitfalls

- using slugs not present in product data
- introducing hardcoded one-off page JSX instead of reusable components
- adding animated behavior without reduced-motion fallback
- using fake scarcity/review copy
