-- Up
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  public_token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  recipient_first_name TEXT NOT NULL,
  recipient_last_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_address1 TEXT NOT NULL,
  recipient_address2 TEXT,
  recipient_city TEXT NOT NULL,
  recipient_state TEXT NOT NULL,
  recipient_postal_code TEXT NOT NULL,
  recipient_country TEXT NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  printful_order_id BIGINT UNIQUE,
  printful_external_order_id TEXT,
  subtotal NUMERIC(12,2) NOT NULL,
  shipping NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tracking_number TEXT,
  tracking_url TEXT,
  mapping_error TEXT,
  fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  local_variant_id TEXT NOT NULL,
  printful_variant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  image TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_hash TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider, event_id)
);

CREATE TABLE IF NOT EXISTS order_status_events (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  next_status TEXT NOT NULL,
  source TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_events_order_id ON order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Down
DROP TABLE IF EXISTS order_status_events;
DROP TABLE IF EXISTS processed_webhook_events;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
