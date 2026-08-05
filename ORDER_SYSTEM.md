# Order System

This document describes the production-safe order architecture for ShittyTees direct commerce.

## Core Principles

- Single repository contract for all order persistence and querying.
- Adapter-based storage implementation with production fail-closed behavior.
- Explicit status transition rules to prevent invalid state changes.
- Idempotent webhook processing for Stripe and Printful.
- Public order status access only through order id + one-time token.

## Repository Contract

All active order reads/writes go through the `OrderRepository` interface in `lib/orders/repository.ts`.

Implemented adapters:

- File adapter: `lib/orders/fileRepository.ts`
- Postgres adapter: `lib/orders/postgresRepository.ts`

Adapter selection happens in `lib/orders/index.ts`:

- Default in production: `postgres`
- File adapter in production: rejected with a server error

## Status Model

Primary statuses:

- `pending_payment`
- `paid`
- `printful_draft_created`
- `submitted_to_printful`
- `in_fulfillment`
- `shipped`
- `failed`
- `canceled`
- `refunded`

Transition enforcement lives in `lib/orders/transitions.ts` and is applied in repository transitions.

## Webhook Safety

Stripe and Printful webhooks use shared processors in `lib/orders/services/webhooks.ts`.

Safety controls:

- Provider + event id idempotency via `recordWebhookEvent`
- Payload hashing for auditability
- Transition validation before status updates
- Unknown order handling without information leakage

## Checkout Tamper Hardening

Checkout item normalization and validation are in `lib/orders/services/checkoutSecurity.ts`.

Controls include:

- Product and variant existence checks
- Size and color mapping checks
- Quantity bounds
- Unit price tamper rejection
- Duplicate line aggregation with canonical server values

## Fulfillment Gating

Fulfillment actions are controlled in `lib/orders/services/fulfillment.ts`.

Required environment gate:

- `PRINTFUL_ENABLE_FULFILLMENT=true`

Without the exact gate value, draft creation/submission is blocked.
