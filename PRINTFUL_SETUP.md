# Printful Setup and Safety Runbook

This runbook covers how ShittyTees should be configured for Printful without accidental live fulfillment.

## Purpose

- Keep storefront browsing stable even when Printful is not configured.
- Prevent silent or accidental live order confirmation.
- Keep webhook and order lifecycle behavior explicit and auditable.

## Environment Variables

Required for real Printful API calls:

- `PRINTFUL_API_TOKEN`
- `PRINTFUL_STORE_ID`

Required for webhook signature validation:

- `PRINTFUL_WEBHOOK_SECRET`

Fulfillment safety switch:

- `PRINTFUL_AUTO_CONFIRM`
  - `false` in local, preview, and staging environments
  - only `true` when fulfillment flow has been validated and explicitly approved

Fulfillment gating switch:

- `PRINTFUL_ENABLE_FULFILLMENT`
  - `false` by default
  - must be `true` before any Stripe-paid order can be sent to Printful

Sync safety secret (for future secured sync operations):

- `PRINTFUL_SYNC_SECRET`

Catalog repository mode:

- `PRODUCT_REPOSITORY=postgres`

## Current Runtime Behavior

- Printful API client in `lib/printful/client.ts` throws when credentials are missing for API calls.
- Stripe webhook flow creates durable local order records first, then optionally submits to Printful.
- Printful submission only runs when `PRINTFUL_ENABLE_FULFILLMENT=true`.
- Auto-confirm only runs when both fulfillment is enabled and `PRINTFUL_AUTO_CONFIRM=true`.
- Public shopping paths do not require Printful env vars and continue to function.

Durable local order store:

- Orders are written to `.generated/orders.json`.
- This is durable across local process restarts, but still not a production database.

Read-only inspection and dry-run tooling:

- `npm run printful:inspect`
- `npm run printful:sync`
- `npm run db:migrate`
- `npm run catalog:migrate`
- `npm run products:report`
- `npm run products:review`

Runtime sync controls:

- Manual: `POST /api/printful/sync` (admin cookie or bearer `PRINTFUL_SYNC_SECRET`)
- Status: `GET /api/printful/sync/status` (admin cookie)
- Hourly cron: `GET /api/cron/printful-sync` with bearer `PRINTFUL_SYNC_SECRET`

Local publication controls:

- `npm run product:publish -- <slug>`
- `npm run product:archive -- <slug>`
- `npm run product:disable -- <slug>`

## Setup Steps

1. Create a Printful API token with least privilege needed for order and product sync operations.
2. Copy the token and store id into the deployment environment.
3. Set `PRINTFUL_ENABLE_FULFILLMENT=false` and `PRINTFUL_AUTO_CONFIRM=false` for first deployment.
4. Configure webhook endpoint:
   - URL: `/api/printful/webhook`
   - Secret: `PRINTFUL_WEBHOOK_SECRET`
5. Validate webhook signature handling from Printful test events.

## Staging Checklist

1. `PRINTFUL_ENABLE_FULFILLMENT=false` and `PRINTFUL_AUTO_CONFIRM=false`.
2. Confirm checkout, cart, and Stripe flow still work without Printful submission.
3. Trigger Stripe webhook events and verify orders persist to `.generated/orders.json`.
4. Run `npm run printful:inspect` and verify output shape.
5. Run `npm run printful:sync` and review dry-run decision states before any apply.
6. Confirm there are clear warning logs if Printful env vars are missing in production mode.

## Local Import Model

- Printful products are imported into local data with decision states.
- Ready, unmapped products are classified as `new_candidate` for local review.
- Legacy products are placed in `archive` status by default.
- New imported products default to `draft` unless explicitly published.
- Sync apply writes local files only and never creates/modifies remote Printful products.

## Production Go-Live Checklist

1. Keep `PRINTFUL_ENABLE_FULFILLMENT=false` and `PRINTFUL_AUTO_CONFIRM=false` for the initial production cut.
2. Run one internal order through Stripe and verify order creation + webhook processing.
3. Validate Printful credentials and webhook signature logs.
4. Enable `PRINTFUL_ENABLE_FULFILLMENT=true` after manual sign-off.
5. Enable `PRINTFUL_AUTO_CONFIRM=true` only after draft-order validation is complete.
5. Monitor webhook logs for failures (`order_failed`, `order_canceled`, `package_returned`).

## Incident Response

If unexpected Printful behavior is detected:

1. Immediately set `PRINTFUL_ENABLE_FULFILLMENT=false` and `PRINTFUL_AUTO_CONFIRM=false`.
2. Rotate `PRINTFUL_API_TOKEN` and `PRINTFUL_WEBHOOK_SECRET` if compromise is suspected.
3. Audit recent Stripe and Printful webhook deliveries.
4. Re-run integration tests before re-enabling confirmation.
