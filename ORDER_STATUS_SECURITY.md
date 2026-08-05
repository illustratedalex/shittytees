# Order Status Security

This document explains secure customer order status lookup.

## Public Status Access

Status lookup endpoint:

- `POST /api/order/status`

Required payload:

- `id`: order id
- `token`: customer access token

The endpoint never trusts id-only access.

## Token Model

- Tokens are generated as random opaque values.
- Only token hashes are stored (`publicTokenHash`).
- Comparison uses timing-safe checks.

Implementation:

- `lib/orders/publicAccess.ts`

## Response Privacy

- Not-found and invalid access are returned as generic failures.
- Endpoint uses no-store/private cache behavior.
- Route-level referrer policy is set to `no-referrer` for order status pages.

## Rate Limiting

- In-process rate limit applied for status lookup requests.
- Intended to reduce brute-force token attempts.
- Production deployment should prefer a shared/distributed limiter for multi-instance setups.

## Customer Page

- `/order/[id]`

The page polls status updates and stops polling for terminal states.
