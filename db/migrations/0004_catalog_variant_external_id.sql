-- Up
ALTER TABLE catalog_variants
ADD COLUMN IF NOT EXISTS printful_variant_external_id TEXT;

-- Down
ALTER TABLE catalog_variants
DROP COLUMN IF EXISTS printful_variant_external_id;