# New Product Workflow

This workflow adds new Printful products to ShittyTees with local-only sync and explicit publication control.

No route edits, JSX edits, or manual product file edits are required for standard imports.

## 1. Create Product in Printful

1. Create product in Printful.
2. Upload artwork.
3. Select sizes and colors.
4. Generate mockups.
5. Save product in Printful.

## 2. Inspect Current State

Run:

```bash
npm run printful:inspect
```

Verify:

- token configured
- store id configured
- remote connectivity yes

## 3. Run Local Sync Dry-Run

Run:

```bash
npm run printful:sync
```

Review decision states:

- `mapped_existing`
- `new_candidate`
- `unpublished_missing_price`
- `unpublished_missing_variant_mapping`
- `ambiguous`
- `archived`

Dry-run does not write files.

Run review output:

```bash
npm run products:review
```

You should see sections for:

- READY TO PUBLISH
- Products missing price
- Products missing variants
- Products missing mockups
- Slug conflicts
- SKU conflicts
- Archive products

## 4. Apply Local Sync

Run:

```bash
npm run printful:sync -- --apply
```

Apply mode:

- writes local data only
- creates timestamped local backup
- does not modify Printful remotely

## 5. Review Local Product Readiness

Run:

```bash
npm run products:report
```

Check:

- publish status
- mapping readiness
- mockup readiness
- fulfillment readiness

## 6. Publish Explicitly

When a draft/new candidate product is ready:

```bash
npm run product:publish -- <slug>
```

To archive a product:

```bash
npm run product:archive -- <slug>
```

To disable a product:

```bash
npm run product:disable -- <slug>
```

## Artist's Bench Workflow

Artist's Bench concepts start as local-only draft products.

Workflow:

1. choose draft concept
2. create final artwork
3. create product in Printful
4. generate mockups
5. run Printful sync
6. map imported Printful product to the existing draft slug
7. verify variants
8. review
9. publish locally
10. deploy

Matching rules:

- prefer existing draft mapping by stable slug/SKU relationship
- prefer explicit sync/mapping signals when they exist
- do not rely on title-only matching to merge a Printful product into an Artist's Bench draft

Artist's Bench drafts are intentional and should appear in internal review output without being treated as publication errors.

## 7. Verify Locally

1. Run `npm run build`.
2. Verify product route at `/shop/<slug>`.
3. Verify collection placement (Archive or published collection).
4. Verify add-to-cart and checkout readiness.

## 8. Deploy Workflow

1. Commit local changes.
2. Push to remote.
3. Verify deployment.
4. Confirm product appears as expected.

No JSX rewrites are required for new products imported through this workflow.

If a product appears as `ambiguous`, resolve the conflict first (usually slug or SKU) before publish.
