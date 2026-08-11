-- Up
CREATE TABLE IF NOT EXISTS catalog_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  printful_product_id BIGINT UNIQUE,
  printful_external_id TEXT,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  collection_slug TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  publish_status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  base_price NUMERIC(12,2) NOT NULL,
  retail_price NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  merchandising_position INTEGER NOT NULL DEFAULT 0,
  new_from_printful BOOLEAN NOT NULL DEFAULT FALSE,
  printful_status TEXT,
  printful_last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_publish_status ON catalog_products(publish_status);
CREATE INDEX IF NOT EXISTS idx_catalog_products_collection_slug ON catalog_products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_catalog_products_featured ON catalog_products(featured);
CREATE INDEX IF NOT EXISTS idx_catalog_products_active ON catalog_products(active);
CREATE INDEX IF NOT EXISTS idx_catalog_products_updated_at ON catalog_products(updated_at DESC);

CREATE TABLE IF NOT EXISTS catalog_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  printful_variant_id BIGINT,
  printful_sync_variant_id BIGINT,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  sku TEXT NOT NULL,
  retail_price NUMERIC(12,2) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  printful_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_catalog_variants_product_id ON catalog_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_variants_printful_sync_variant_id ON catalog_variants(printful_sync_variant_id);

CREATE TABLE IF NOT EXISTS catalog_sync_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  checked_count INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_catalog_sync_runs_started_at ON catalog_sync_runs(started_at DESC);

-- Down
DROP TABLE IF EXISTS catalog_sync_runs;
DROP TABLE IF EXISTS catalog_variants;
DROP TABLE IF EXISTS catalog_products;
