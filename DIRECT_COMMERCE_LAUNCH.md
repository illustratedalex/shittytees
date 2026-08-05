# Direct Commerce Launch Checklist

Use this checklist before enabling live direct-commerce traffic.

## Environment

- Set `ORDER_REPOSITORY=postgres`
- Set a valid `DATABASE_URL`
- Configure Stripe secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Configure Printful API token and webhook secret
- Set `NEXT_PUBLIC_SITE_URL` to production domain
- Keep `PRINTFUL_ENABLE_FULFILLMENT=false` until ready

## Authentication and Access

- Implement production-grade admin auth (replace development token mode)
- Verify protected admin API access and cookie settings
- Verify public order status requires id + token

## Data and Persistence

- Apply SQL migration in target environment
- Run migration dry-run and then apply when approved
- Verify repository health check in production

## Safety Validation

Run before release:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run orders:migrate` (dry-run)

## Webhook Safety

- Verify Stripe webhook signature enforcement
- Verify Printful webhook secret validation
- Verify event idempotency behavior with duplicate deliveries

## Fulfillment Controls

- Confirm fulfillment is explicitly gated by environment
- Enable `PRINTFUL_ENABLE_FULFILLMENT=true` only when ready
- Optionally set `PRINTFUL_AUTO_CONFIRM=true` only after operational sign-off
