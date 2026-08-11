-- Up
ALTER TABLE catalog_products DROP CONSTRAINT IF EXISTS catalog_products_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_products_slug_published_unique
ON catalog_products(slug)
WHERE publish_status = 'published';

-- Down
DROP INDEX IF EXISTS idx_catalog_products_slug_published_unique;

ALTER TABLE catalog_products
ADD CONSTRAINT catalog_products_slug_key UNIQUE (slug);