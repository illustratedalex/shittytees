# ShittyTees Design System

This document defines the reusable storefront system for brand, campaign, product merchandising, and drop launches.

## 1) Brand System

Primary brand components are in [components/brand/index.ts](components/brand/index.ts).

- Wordmark: [components/brand/Wordmark.tsx](components/brand/Wordmark.tsx)
- Logo mark: [components/brand/LogoMark.tsx](components/brand/LogoMark.tsx)
- Logo lockup: [components/brand/LogoLockup.tsx](components/brand/LogoLockup.tsx)
- Brand stamp: [components/brand/BrandStamp.tsx](components/brand/BrandStamp.tsx)
- Brand pattern: [components/brand/BrandPattern.tsx](components/brand/BrandPattern.tsx)

Brand content is centralized in [data/brand.ts](data/brand.ts).

## 2) Wordmark Usage

Use Wordmark with:

- variant: light or dark
- size: compact, standard, display
- showMark: enables the small slash mark

Guidelines:

- Header: compact or standard
- Footer: standard
- Hero/editorial: display

## 3) Logo Mark Usage

LogoMark is SVG-based and designed to stay recognizable at small size.

Typical contexts:

- favicon and social avatar
- neck label mockups
- watermark overlays
- micro branding accents

Use decorative mode by default and set non-decorative mode only when the symbol is informational.

## 4) Spacing Tokens

Core spacing variables in [styles/globals.css](styles/globals.css):

- --space-1 through --space-20

Recommended rhythm:

- tight control spacing: --space-2 to --space-4
- card internals: --space-4 to --space-6
- section spacing: --space-10 to --space-16

## 5) Color Tokens

Primary palette:

- --color-ink, --color-ink-soft
- --color-charcoal, --color-smoke
- --color-bone, --color-bone-muted, --color-bone-soft
- --color-oxblood, --color-oxblood-strong
- --color-metal

Theme direction:

- dark groundwork, warm neutral type, restrained oxblood accents

## 6) Type Hierarchy

Typography tokens and semantic helpers:

- --text-xs to --text-xl
- --text-2xl, --text-3xl, --text-hero
- .type-kicker, .type-heading-lg, .type-display-xl

Use one h1 per page and keep visual hierarchy in strict descending order.

## 7) Button Variants

Component: [components/common/Button.tsx](components/common/Button.tsx)

Variants:

- primary
- secondary
- ghost

Sizes:

- sm
- md
- lg

Legacy compatibility classes remain available:

- .btn-primary
- .btn-secondary
- .btn-primary-oxblood

## 8) Garment Mockup API

Component: [components/product/GarmentMockup.tsx](components/product/GarmentMockup.tsx)

Important props:

- color: black, bone, charcoal, white, oxblood
- artworkText or artworkImage
- artworkPlacement: center, left-chest, oversized-center, back, sleeve
- background: black, bone, charcoal, oxblood, transparent
- scale: small, medium, large, hero
- rotation
- view: front or back

## 9) Product Tile Usage

Product tile primitives:

- [components/product/ProductTile.tsx](components/product/ProductTile.tsx)
- [components/product/ProductQuickInfo.tsx](components/product/ProductQuickInfo.tsx)
- [components/product/ProductRail.tsx](components/product/ProductRail.tsx)

Benefits:

- reusable premium product layout
- mobile horizontal merchandising + desktop grid
- consistent labels and pricing treatment

## 10) Campaign Hero Usage

Main campaign components:

- [components/campaign/CampaignHero.tsx](components/campaign/CampaignHero.tsx)
- [components/campaign/DropHero.tsx](components/campaign/DropHero.tsx)
- [components/campaign/DropStory.tsx](components/campaign/DropStory.tsx)
- [components/campaign/DropProductGrid.tsx](components/campaign/DropProductGrid.tsx)
- [components/campaign/CampaignMarquee.tsx](components/campaign/CampaignMarquee.tsx)
- [components/campaign/CollectionBand.tsx](components/campaign/CollectionBand.tsx)

## 11) Drop Data Structure

Data source: [data/drops.ts](data/drops.ts)

Drop shape:

- id, slug, number, label
- title, description, story
- theme
- featuredProductSlugs
- collectionSlug
- status

Only use product slugs that already exist in [lib/data/products.ts](lib/data/products.ts).

## 12) Collection Bands

Collection campaign data: [data/collections.ts](data/collections.ts)

Rendering component:

- [components/campaign/CollectionBand.tsx](components/campaign/CollectionBand.tsx)

Use collection bands for:

- homepage campaign sequence
- drop page cross-navigation
- collection landing context

Theme handling:

- The banner card supports `data-theme` values from collection config (`black`, `bone`, `charcoal`, `oxblood`).
- Theme source of truth remains in [data/collections.ts](data/collections.ts).

## 13) Product Presentation Data Layer

Presentation mappings are stored in [data/productPresentation.ts](data/productPresentation.ts).

Use this layer for display-only concerns:

- front/back image preference
- garment color mapping
- artwork placement
- mockup fallback artwork text

Do not put pricing, inventory, checkout, or API behavior in this file.

## 14) Homepage Assembly

Homepage route: [app/page.tsx](app/page.tsx)

Assembly order:

1. CampaignHero
2. CampaignMarquee
3. DropHero
4. New Arrivals rail
5. EditorialStatement
6. CollectionBand
7. NewsletterSignup
8. SiteFooter

## 15) Adding Drop 002

1. Add a new object in [data/drops.ts](data/drops.ts) with a unique slug.
2. Reuse existing product slugs in featuredProductSlugs.
3. Set status to active, upcoming, or archived.
4. Confirm route renders at /drops/[slug] via [app/drops/[slug]/page.tsx](app/drops/[slug]/page.tsx).
5. Optionally add a homepage feature reference in [data/campaigns.ts](data/campaigns.ts).

## 16) Adding a Real Garment PNG

1. Provide transparent PNG asset path.
2. Pass it via artworkImage to GarmentMockup.
3. Keep color and background values for tone consistency.
4. Tune artworkPlacement, scale, and rotation only as needed.

## 17) Replacing Text Artwork with Image Artwork

- Switch from artworkText to artworkImage.
- Keep fallback text available in data for non-image contexts.

## 18) Accessibility Rules

- one h1 per page
- keyboard-visible focus states
- all actionable links and buttons have clear names
- decorative SVGs use aria-hidden
- reduced-motion respected by marquee and transitions
- no color-only meaning for product state

## 19) Responsive Rules

Review at minimum:

- 375
- 430
- 768
- 1024
- 1280
- 1440

Must pass:

- no horizontal overflow
- hero and drop media remain legible and contained
- nav and menu usable by keyboard and touch
- product rail usable on mobile and desktop

## 20) Prohibited Patterns

Do not add:

- fake scarcity countdowns
- fake reviews or rating summaries
- dead links to non-existent collection or drop routes
- unvalidated claims not present in real data
- duplicate one-off JSX blocks that bypass reusable components

## 21) Centralized Data Files

- Brand: [data/brand.ts](data/brand.ts)
- Navigation: [data/navigation.ts](data/navigation.ts)
- Campaigns: [data/campaigns.ts](data/campaigns.ts)
- Collections: [data/collections.ts](data/collections.ts)
- Drops: [data/drops.ts](data/drops.ts)
- Product presentation: [data/productPresentation.ts](data/productPresentation.ts)

Use these data files as the first configuration layer before page-level edits.

## 22) Validation Workflow

Before release, run the full quality sequence:

1. `rm -rf .next`
2. `rm -f tsconfig.tsbuildinfo`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`

Keep this order so lint/type/test regressions are isolated before build output noise.
