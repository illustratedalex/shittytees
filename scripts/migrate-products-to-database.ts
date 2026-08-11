import { getAllProducts } from '@/lib/data/products';
import { getPool } from '@/lib/orders/database';
import type { Product } from '@/lib/types/product';

function parseArgs() {
  return {
    apply: process.argv.includes('--apply'),
  };
}

function parseNullableInt(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRawPrintfulId(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const raw = String(value);
  return /^\d+$/.test(raw) ? null : raw;
}

function toPayload(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    printfulProductId: parseNullableInt(product.printfulProductId),
    printfulExternalId: parseRawPrintfulId(product.printfulProductId),
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    category: product.category,
    collectionSlug: product.collectionSlug,
    active: product.active,
    publishStatus: product.publishStatus,
    featured: product.featured,
    basePrice: product.basePrice,
    retailPrice: product.retailPrice,
    currency: product.currency,
    tags: product.tags,
    images: product.images,
    seoTitle: null,
    seoDescription: null,
    merchandisingPosition: 0,
    newFromPrintful: false,
    printfulStatus: null,
    printfulLastSyncedAt: null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function migrate(apply: boolean) {
  const products = getAllProducts();

  if (!apply) {
    console.log(`Dry run: ${products.length} products would be migrated to catalog_products.`);
    console.log(`First three: ${products.slice(0, 3).map((p) => `${p.id}:${p.slug}`).join(', ')}`);
    return;
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const product of products) {
      const payload = toPayload(product);
      await client.query(
        `
          INSERT INTO catalog_products (
            id, slug, printful_product_id, printful_external_id,
            name, short_description, description, category, collection_slug,
            active, publish_status, featured,
            base_price, retail_price, currency,
            tags, images,
            seo_title, seo_description,
            merchandising_position, new_from_printful,
            printful_status, printful_last_synced_at,
            created_at, updated_at
          ) VALUES (
            $1,$2,$3,$4,
            $5,$6,$7,$8,$9,
            $10,$11,$12,
            $13,$14,$15,
            $16::jsonb,$17::jsonb,
            $18,$19,
            $20,$21,
            $22,$23,
            $24,$25
          )
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            printful_product_id = COALESCE(catalog_products.printful_product_id, EXCLUDED.printful_product_id),
            name = EXCLUDED.name,
            short_description = EXCLUDED.short_description,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            collection_slug = EXCLUDED.collection_slug,
            active = EXCLUDED.active,
            publish_status = EXCLUDED.publish_status,
            featured = EXCLUDED.featured,
            base_price = EXCLUDED.base_price,
            retail_price = EXCLUDED.retail_price,
            currency = EXCLUDED.currency,
            tags = EXCLUDED.tags,
            images = EXCLUDED.images,
            updated_at = EXCLUDED.updated_at
        `,
        [
          payload.id,
          payload.slug,
          payload.printfulProductId,
          payload.printfulExternalId,
          payload.name,
          payload.shortDescription,
          payload.description,
          payload.category,
          payload.collectionSlug,
          payload.active,
          payload.publishStatus,
          payload.featured,
          payload.basePrice,
          payload.retailPrice,
          payload.currency,
          JSON.stringify(payload.tags),
          JSON.stringify(payload.images),
          payload.seoTitle,
          payload.seoDescription,
          payload.merchandisingPosition,
          payload.newFromPrintful,
          payload.printfulStatus,
          payload.printfulLastSyncedAt,
          payload.createdAt,
          payload.updatedAt,
        ],
      );

      await client.query('DELETE FROM catalog_variants WHERE product_id = $1', [product.id]);

      for (const variant of product.variants) {
        const variantPrintfulId = parseNullableInt(variant.printfulVariantId);
        const variantPrintfulExternalId = parseRawPrintfulId(variant.printfulVariantId);
        await client.query(
          `
            INSERT INTO catalog_variants (
              id, product_id, printful_variant_id, printful_sync_variant_id, printful_variant_external_id,
              name, size, color, color_hex, sku,
              retail_price, available, printful_status,
              created_at, updated_at
            ) VALUES (
              $1,$2,$3,$4,$5,
              $6,$7,$8,$9,$10,
              $11,$12,$13,
              $14,$15
            )
            ON CONFLICT (id) DO UPDATE SET
              printful_variant_id = EXCLUDED.printful_variant_id,
              printful_sync_variant_id = EXCLUDED.printful_sync_variant_id,
              printful_variant_external_id = COALESCE(EXCLUDED.printful_variant_external_id, catalog_variants.printful_variant_external_id),
              name = EXCLUDED.name,
              size = EXCLUDED.size,
              color = EXCLUDED.color,
              color_hex = EXCLUDED.color_hex,
              sku = EXCLUDED.sku,
              retail_price = EXCLUDED.retail_price,
              available = EXCLUDED.available,
              printful_status = EXCLUDED.printful_status,
              updated_at = EXCLUDED.updated_at
          `,
          [
            variant.id,
            product.id,
            variantPrintfulId,
            variantPrintfulId,
            variantPrintfulExternalId,
            variant.name,
            variant.size,
            variant.color,
            variant.colorHex,
            variant.sku,
            variant.retailPrice,
            variant.available,
            variant.available ? 'active' : 'inactive',
            product.createdAt,
            product.updatedAt,
          ],
        );
      }
    }

    await client.query('COMMIT');
    console.log(`Migrated ${products.length} products into PostgreSQL catalog.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const args = parseArgs();
void migrate(args.apply).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
