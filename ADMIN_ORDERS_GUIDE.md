# Admin Orders Guide

This guide covers the current admin order management flow.

## Access Model

Admin routes use a protected session in `lib/admin/auth.ts`.

Current mode:

- Development token login only (`ADMIN_DEV_TOKEN`)
- Signed HTTP-only session cookie (`ADMIN_SESSION_SECRET`)

Production behavior:

- Fails closed unless real admin authentication is implemented.

## Endpoints

- `POST /api/admin/session` - authenticate in development mode
- `GET /api/admin/orders` - list orders (PII-reduced in list output)
- `GET /api/admin/orders/:id` - detailed order view
- `POST /api/admin/orders/:id/create-printful-draft` - create Printful draft
- `POST /api/admin/orders/:id/submit-fulfillment` - submit fulfillment

## Security Controls

- Session verification required on all admin endpoints.
- Origin and host checks on admin mutation routes.
- SameSite strict cookie.
- Order list redacts customer email by default.

## UI Routes

- `/admin/login`
- `/admin/orders`
- `/admin/orders/[id]`

Admin pages are marked dynamic to avoid build-time prerender of protected routes.

## Production Follow-Up

Replace development token authentication with real production auth before enabling admin flows publicly.
