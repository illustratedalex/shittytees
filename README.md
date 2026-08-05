# ShittyTees

A production-ready print-on-demand apparel storefront built with Next.js, Stripe, and Printful.

**Domain:** shittytees.com  
**Staging:** shittytees.staging.deadsignal.co  
**Local:** http://localhost:3000/shittytees

## Overview

ShittyTees is a screenprintshop aesthetic e-commerce platform with:

- **Product catalog** with variants (size/color)
- **Shopping cart** with localStorage persistence
- **Stripe Checkout** for secure payments
- **Printful integration** for print-on-demand fulfillment
- **Webhook handlers** for payment and fulfillment tracking
- **Underground visual design** (black, bone white, faded red)
- **Responsive & accessible** UI

## Installation

### Prerequisites

- Node.js 18+ and npm
- Git
- Stripe account (test mode)
- Printful account (optional, for production)

### Setup Steps

1. **Clone and navigate:**

```bash
cd shittytees
```

2. **Install dependencies:**

```bash
npm install
```

3. **Copy environment template:**

```bash
cp .env.example .env.local
```

4. **Configure environment variables** (see below).

5. **Run development server:**

```bash
npm run dev
```

6. **Open browser:**

```
http://localhost:3000/shittytees
```

## Environment Variables

All variables in `.env.example` must be set. For development/testing:

### Stripe (Test Mode)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure you're in **Test Mode** (toggle in top-left)
3. Copy `Secret Key` from Developers → API Keys
4. Paste into `STRIPE_SECRET_KEY`

**Example test key format:** `sk_test_...`

#### Getting Webhook Secret

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `http://localhost:3000/shittytees/api/stripe/webhook`
4. Events: Select `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`
5. Copy the **Signing Secret** to `STRIPE_WEBHOOK_SECRET`

#### Stripe Shipping Rate

1. Go to Stripe Dashboard → Products → Shipping rates
2. Create a new rate:
   - Name: "Standard Shipping (US)"
   - Type: "Fixed amount"
   - Amount: "$10.00"
   - Delivery: "5-7 business days"
3. Copy the rate ID (looks like `shr_...`) to `STRIPE_STANDARD_SHIPPING_RATE_ID`

### Printful (Optional for Testing)

1. Sign up at [Printful](https://www.printful.com)
2. Go to Settings → API
3. Copy your API token to `PRINTFUL_API_TOKEN`
4. Find your Store ID in Settings → General
5. For now, leave `PRINTFUL_AUTO_CONFIRM=false` in development

### Other Variables

- `NEXT_PUBLIC_SITE_URL`: Used for Stripe redirect URLs. Default: `http://localhost:3000`
- `CONTACT_EMAIL`: Where contact form submissions go (placeholder for now)
- `DATABASE_URL`: Leave empty; database integration is a TODO

## Local Development

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
npm start
```

## Stripe CLI (Webhooks)

To test webhook handling locally:

1. **Install Stripe CLI:** [Download](https://stripe.com/docs/stripe-cli)

2. **Authenticate:**

```bash
stripe login
```

3. **Forward webhooks to local server:**

```bash
stripe listen --forward-to localhost:3000/shittytees/api/stripe/webhook
```

4. **Trigger test events:**

```bash
# Simulate a successful payment
stripe trigger payment_intent.succeeded

# Simulate checkout completion
stripe trigger checkout.session.completed
```

The CLI output will show event details. Check your server logs to verify webhooks are received.

## Project Structure

```
shittytees/
├── app/
│   ├── shittytees/          # Main pages (routes start here)
│   │   ├── shop/            # Product listing
│   │   ├── shop/[slug]/     # Product detail
│   │   ├── collections/     # Collection pages
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Success/cancel pages
│   │   ├── about/           # Info pages
│   │   ├── api/             # API routes
│   │   └── workspace/       # Admin dashboard
│   └── layout.tsx           # Root layout
├── lib/
│   ├── data/                # Demo products & collections
│   ├── types/               # TypeScript interfaces
│   ├── validation/          # Zod schemas
│   ├── stripe/              # Stripe helpers
│   ├── printful/            # Printful API client
│   ├── db/                  # In-memory persistence (TODO: replace)
│   └── hooks/               # React hooks (cart context)
├── components/              # React components (scaffold)
├── styles/                  # Global CSS & Tailwind
├── .env.example             # Environment template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind CSS config
└── README.md                # This file
```

## How It Works

### Cart Flow

1. User adds products to cart
2. Cart stored in browser localStorage via React Context
3. Cart persists across sessions

### Checkout Flow

1. User enters shipping address
2. Frontend validates with Zod schema
3. POST to `/api/checkout`:
   - Server validates products & variants
   - Server recalculates prices (client can't be trusted)
   - Server rejects unavailable items
   - Stripe Checkout Session created
4. User redirected to Stripe Checkout
5. Stripe handles payment securely
6. User redirected to `/checkout/success` or `/checkout/cancel`

### Webhook Flow (Stripe)

1. Stripe sends POST to `/api/stripe/webhook`
2. Webhook signature verified with secret
3. Event processed:
   - `checkout.session.completed` → Order created
   - `checkout.session.async_payment_succeeded` → Same as above
   - `checkout.session.async_payment_failed` → Order marked failed
4. Fulfillment tracker prevents duplicate processing
5. (TODO) Order submitted to Printful after payment confirmed

### Order Persistence

Currently using in-memory store. **NOT SUITABLE FOR PRODUCTION.**

- `lib/db/repository.ts` – Order storage interface
- `lib/db/repository.ts` – Fulfillment tracking

To use a real database:
1. Update `orderRepository` functions to query DB
2. Update `fulfillmentTracker` to store in DB
3. No changes needed in checkout/webhook logic

## Demo Products

Six sample products included:
- Bad Decisions Department
- Professionally Unsupervised
- Clocked Out Mentally
- Permanent Record
- Poorly Behaved Since Birth
- This Meeting Could Have Been A Shirt

All use placeholder SVG images. To replace:
1. Edit `/lib/data/products.ts`
2. Update image URLs
3. Update product details
4. No other files need changes

## Security

✅ **Implemented:**
- Server-side price validation (client prices never trusted)
- Zod input validation on all endpoints
- Stripe webhook signature verification
- Rate limiting on contact form (5 requests/hour per IP)
- No raw payment card data storage
- No secret keys exposed to client
- Secure headers (X-Frame-Options, etc.)

⚠️ **TODO (Production):**
- Authentication system (workspace access control)
- Database encryption at rest
- HTTPS enforcement
- CSP headers
- API rate limiting (comprehensive)
- Audit logging
- Intrusion detection

## API Routes

### POST `/api/checkout`

Creates a Stripe Checkout Session.

**Request:**
```json
{
  "items": [
    {
      "productId": "prod-1",
      "variantId": "var-1-1",
      "quantity": 2,
      "unitPrice": 34.99,
      "name": "Bad Decisions Department",
      "image": "...",
      "size": "L",
      "color": "Black",
      "printfulVariantId": "5059_1"
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

### POST `/api/stripe/webhook`

Stripe webhook endpoint. Requires valid signature.

### POST `/api/printful/webhook`

Printful webhook endpoint (currently a placeholder).

### POST `/api/contact`

Contact form submission with rate limiting.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Issue with order",
  "message": "My shirt arrived damaged..."
}
```

## Workspace

http://localhost:3000/shittytees/workspace

Admin dashboard showing:
- Order counts & revenue
- Stripe & Printful connection status
- Development notices

**⚠️ Not protected – add authentication before production.**

## Deployment

### Vercel (Recommended)

1. Push to GitHub (note: app is in monorepo root for now)
2. Create Vercel project pointing to repository
3. Set environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build: `npm run build`
2. Test: `npm start`
3. Deploy `/. next` directory to your hosting

### Staging Domain

1. Configure DNS for `shittytees.staging.deadsignal.co`
2. Deploy to staging environment
3. Test with real Stripe test mode
4. Test webhook forwarding

### Production Domain

**Do NOT change shittytees.com DNS until:**
- [ ] Database integrated and tested
- [ ] Authentication system complete
- [ ] Workspace protected
- [ ] All TODO items addressed
- [ ] Load testing complete
- [ ] Backup/restore procedures documented
- [ ] Monitoring configured

## Remaining Work (TODO)

### High Priority
- [ ] Database layer (PostgreSQL or similar)
- [ ] Authentication (OAuth or custom)
- [ ] Admin authentication for `/workspace`
- [ ] Order management dashboard
- [ ] Fulfillment tracking from Printful
- [ ] Email notifications (order confirmation, shipment)

### Medium Priority
- [ ] Inventory management
- [ ] Discount/coupon system
- [ ] Email marketing integration
- [ ] Analytics (Google Analytics 4)
- [ ] Customer account pages

### Nice to Have
- [ ] Product reviews
- [ ] Wishlist functionality
- [ ] Gift cards
- [ ] Subscription/pre-orders
- [ ] Social proof widgets
- [ ] Live chat support

## Testing Checklist

Before going live on production domain:

- [ ] Add to cart works
- [ ] Cart persists across refresh
- [ ] Stripe checkout redirects correctly
- [ ] Stripe test payment goes through
- [ ] Success page displays
- [ ] Webhook signature verification works
- [ ] Order recorded in database
- [ ] All pages accessible
- [ ] Forms validate correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

## Support

For issues or questions:
- Email: contact@shittytees.com (via contact form)
- Stripe support: https://support.stripe.com
- Printful API docs: https://api.printful.com

## License

Proprietary. Part of DeadSignal platform.

---

**Built with ❤️ by DeadSignal**
