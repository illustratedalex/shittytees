import { DEMO_PRODUCTS } from '@/lib/data/products';
import { getPool } from '@/lib/orders/database';

async function main() {
  const products = DEMO_PRODUCTS.filter((product) => product.id.startsWith('prod-'));
  if (products.length !== 20) throw new Error(`Expected 20 core products, found ${products.length}`);

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM catalog_products WHERE id <> ALL($1::text[])', [
      products.map((product) => product.id),
    ]);

    for (const product of products) {
      await client.query(
        `
          INSERT INTO catalog_products (
            id, slug, printful_product_id, printful_external_id,
            name, short_description, description, category, collection_slug,
            active, publish_status, featured, base_price, retail_price, currency,
            tags, images, merchandising_position, new_from_printful,
            printful_status, printful_last_synced_at, created_at, updated_at
          ) VALUES (
            $1,$2,NULL,NULL,$3,$4,$5,$6,$7,
            $8,'published',$9,$10,$11,$12,
            $13::jsonb,$14::jsonb,$15,FALSE,'unverified',NULL,$16,$17
          )
          ON CONFLICT (id) DO UPDATE SET
            slug=EXCLUDED.slug, printful_product_id=NULL, printful_external_id=NULL,
            name=EXCLUDED.name, short_description=EXCLUDED.short_description,
            description=EXCLUDED.description, category=EXCLUDED.category,
            collection_slug=EXCLUDED.collection_slug, active=EXCLUDED.active,
            publish_status='published', featured=EXCLUDED.featured,
            base_price=EXCLUDED.base_price, retail_price=EXCLUDED.retail_price,
            currency=EXCLUDED.currency, tags=EXCLUDED.tags, images=EXCLUDED.images,
            merchandising_position=EXCLUDED.merchandising_position,
            new_from_printful=FALSE, printful_status='unverified',
            printful_last_synced_at=NULL, updated_at=EXCLUDED.updated_at
        `,
        [
          product.id, product.slug, product.name, product.shortDescription, product.description,
          product.category, product.collectionSlug, product.active, product.featured,
          product.basePrice, product.retailPrice, product.currency,
          JSON.stringify(product.tags), JSON.stringify(product.images), 0,
          product.createdAt, product.updatedAt,
        ],
      );

      await client.query('DELETE FROM catalog_variants WHERE product_id=$1', [product.id]);

      for (const variant of product.variants) {
        await client.query(
          `
            INSERT INTO catalog_variants (
              id, product_id, printful_variant_id, printful_sync_variant_id,
              printful_variant_external_id, name, size, color, color_hex, sku,
              retail_price, available, printful_status, created_at, updated_at
            ) VALUES (
              $1,$2,NULL,NULL,NULL,$3,$4,$5,$6,$7,$8,FALSE,'unverified',$9,$10
            )
          `,
          [
            variant.id, product.id, variant.name, variant.size, variant.color,
            variant.colorHex, variant.sku, variant.retailPrice,
            product.createdAt, product.updatedAt,
          ],
        );
      }
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      seededProducts: products.length,
      seededVariants: products.reduce((n, product) => n + product.variants.length, 0),
      printfulProductIds: null,
      printfulVariantIds: null,
      printfulSyncVariantIds: null,
      allVariantsAvailable: false,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
