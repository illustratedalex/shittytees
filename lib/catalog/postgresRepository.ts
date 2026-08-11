import { query } from '@/lib/orders/database';
import type { Product, ProductVariant } from '@/lib/types/product';
import type { CatalogRepository } from './types';

type ProductRow = {
  id: string;
  slug: string;
  printful_product_id: number | null;
  printful_external_id: string | null;
  name: string;
  short_description: string;
  description: string;
  category: string;
  collection_slug: string;
  active: boolean;
  publish_status: Product['publishStatus'];
  featured: boolean;
  base_price: number;
  retail_price: number;
  currency: string;
  tags: unknown;
  images: unknown;
  created_at: Date;
  updated_at: Date;
};

type VariantRow = {
  id: string;
  product_id: string;
  printful_variant_id: number | null;
  printful_sync_variant_id: number | null;
  printful_variant_external_id: string | null;
  name: string;
  size: string;
  color: string;
  color_hex: string;
  sku: string;
  retail_price: number;
  available: boolean;
};

type SyncRunRow = {
  id: number;
  started_at: Date;
  completed_at: Date | null;
  status: 'started' | 'completed' | 'failed';
  checked_count: number;
  created_count: number;
  updated_count: number;
  unchanged_count: number;
  failed_count: number;
  errors: unknown;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function toImageArray(value: unknown): Product['images'] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as { id?: unknown; src?: unknown; alt?: unknown };
      if (typeof candidate.id !== 'string' || typeof candidate.src !== 'string' || typeof candidate.alt !== 'string') {
        return null;
      }
      return {
        id: candidate.id,
        src: candidate.src,
        alt: candidate.alt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function rowToVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    printfulVariantId: String(row.printful_sync_variant_id || row.printful_variant_id || row.printful_variant_external_id || ''),
    printfulSyncVariantId: row.printful_sync_variant_id ? String(row.printful_sync_variant_id) : undefined,
    printfulCatalogVariantId: row.printful_variant_id ? String(row.printful_variant_id) : undefined,
    printfulVariantExternalId: row.printful_variant_external_id || undefined,
    name: row.name,
    size: row.size,
    color: row.color,
    colorHex: row.color_hex,
    sku: row.sku,
    retailPrice: Number(row.retail_price),
    available: row.available,
  };
}

function rowToProduct(row: ProductRow, variants: ProductVariant[]): Product {
  return {
    id: row.id,
    printfulProductId: row.printful_external_id || (row.printful_product_id ? String(row.printful_product_id) : undefined),
    printfulExternalId: row.printful_external_id || undefined,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category,
    collectionSlug: row.collection_slug,
    active: row.active,
    publishStatus: row.publish_status,
    featured: row.featured,
    images: toImageArray(row.images),
    basePrice: Number(row.base_price),
    retailPrice: Number(row.retail_price),
    currency: row.currency,
    variants,
    tags: toStringArray(row.tags),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function listVariantsByProductIds(productIds: string[]): Promise<Map<string, ProductVariant[]>> {
  if (!productIds.length) return new Map();
  const rows = await query<VariantRow>(
    `SELECT * FROM catalog_variants WHERE product_id = ANY($1::text[]) ORDER BY product_id, size, color`,
    [productIds],
  );

  const map = new Map<string, ProductVariant[]>();
  for (const row of rows) {
    const current = map.get(row.product_id) || [];
    current.push(rowToVariant(row));
    map.set(row.product_id, current);
  }

  return map;
}

async function listProducts(where = '', values: unknown[] = []): Promise<Product[]> {
  const rows = await query<ProductRow>(`SELECT * FROM catalog_products ${where} ORDER BY merchandising_position ASC, created_at DESC`, values);
  const productIds = rows.map((row) => row.id);
  const variantsByProduct = await listVariantsByProductIds(productIds);
  return rows.map((row) => rowToProduct(row, variantsByProduct.get(row.id) || []));
}

export function createPostgresCatalogRepository(): CatalogRepository {
  const parseNullableInt = (value: string | null | undefined) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseRawPrintfulId = (value: string | null | undefined) => {
    if (!value) return null;
    return /^\d+$/.test(value) ? null : value;
  };

  return {
    async listAll() {
      return listProducts();
    },
    async listPublic() {
      return listProducts(`WHERE active = TRUE AND publish_status = 'published'`);
    },
    async getBySlug(slug: string) {
      const rows = await listProducts('WHERE slug = $1', [slug]);
      return rows[0] || null;
    },
    async getPublicBySlug(slug: string) {
      const rows = await listProducts(`WHERE slug = $1 AND active = TRUE AND publish_status = 'published'`, [slug]);
      return rows[0] || null;
    },
    async upsertProduct(product, options) {
      await query(
        `
          INSERT INTO catalog_products (
            id, slug, printful_product_id, printful_external_id,
            name, short_description, description, category, collection_slug,
            active, publish_status, featured,
            base_price, retail_price, currency,
            tags, images,
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
            $22,$23
          )
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            printful_product_id = EXCLUDED.printful_product_id,
            printful_external_id = COALESCE(EXCLUDED.printful_external_id, catalog_products.printful_external_id),
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
            merchandising_position = EXCLUDED.merchandising_position,
            new_from_printful = EXCLUDED.new_from_printful,
            printful_status = EXCLUDED.printful_status,
            printful_last_synced_at = EXCLUDED.printful_last_synced_at,
            updated_at = EXCLUDED.updated_at
        `,
        [
          product.id,
          product.slug,
          parseNullableInt(product.printfulProductId),
          product.printfulExternalId || parseRawPrintfulId(product.printfulProductId),
          product.name,
          product.shortDescription,
          product.description,
          product.category,
          product.collectionSlug,
          product.active,
          product.publishStatus,
          product.featured,
          product.basePrice,
          product.retailPrice,
          product.currency,
          JSON.stringify(product.tags),
          JSON.stringify(product.images),
          0,
          options?.newFromPrintful || false,
          options?.printfulStatus || null,
          options?.printfulLastSyncedAt || null,
          product.createdAt,
          product.updatedAt,
        ],
      );

      await query('DELETE FROM catalog_variants WHERE product_id = $1', [product.id]);
      for (const variant of product.variants) {
        const syncVariantId = parseNullableInt(variant.printfulSyncVariantId || variant.printfulVariantId);
        const catalogVariantId = parseNullableInt(variant.printfulCatalogVariantId);
        const variantPrintfulExternalId = variant.printfulVariantExternalId || parseRawPrintfulId(variant.printfulVariantId);
        await query(
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
          `,
          [
            variant.id,
            product.id,
            catalogVariantId,
            syncVariantId,
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
    },
    async findByPrintfulProductId(printfulProductId: number) {
      const rows = await listProducts('WHERE printful_product_id = $1', [printfulProductId]);
      return rows[0] || null;
    },
    async findByExternalId(externalId: string) {
      const rows = await listProducts('WHERE printful_external_id = $1', [externalId]);
      return rows[0] || null;
    },
    async setPrintfulMissingForUnseenProducts(seenPrintfulProductIds: number[]) {
      if (!seenPrintfulProductIds.length) {
        const result = await query<{ count: number }>(
          `
            WITH changed AS (
              UPDATE catalog_products
              SET printful_status = 'missing',
                  active = FALSE,
                  updated_at = NOW()
              WHERE printful_product_id IS NOT NULL
              RETURNING 1
            )
            SELECT COUNT(*)::int AS count FROM changed
          `,
        );
        return result[0]?.count || 0;
      }

      const result = await query<{ count: number }>(
        `
          WITH changed AS (
            UPDATE catalog_products
            SET printful_status = 'missing',
                active = FALSE,
                updated_at = NOW()
            WHERE printful_product_id IS NOT NULL
              AND NOT (printful_product_id = ANY($1::bigint[]))
            RETURNING 1
          )
          SELECT COUNT(*)::int AS count FROM changed
        `,
        [seenPrintfulProductIds],
      );
      return result[0]?.count || 0;
    },
    async startSyncRun() {
      const rows = await query<{ id: number }>(
        `INSERT INTO catalog_sync_runs (status) VALUES ('started') RETURNING id`,
      );
      return rows[0].id;
    },
    async completeSyncRun(id, result) {
      await query(
        `
          UPDATE catalog_sync_runs
          SET
            completed_at = $2,
            status = $3,
            checked_count = $4,
            created_count = $5,
            updated_count = $6,
            unchanged_count = $7,
            failed_count = $8,
            errors = $9::jsonb
          WHERE id = $1
        `,
        [
          id,
          result.completedAt || new Date(),
          result.status,
          result.checked,
          result.created,
          result.updated,
          result.unchanged,
          result.failed,
          JSON.stringify(result.errors),
        ],
      );
    },
    async getLastSyncRun() {
      const rows = await query<SyncRunRow>('SELECT * FROM catalog_sync_runs ORDER BY started_at DESC LIMIT 1');
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        startedAt: new Date(row.started_at),
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        status: row.status,
        checked: row.checked_count,
        created: row.created_count,
        updated: row.updated_count,
        unchanged: row.unchanged_count,
        failed: row.failed_count,
        errors: Array.isArray(row.errors) ? row.errors.filter((item): item is string => typeof item === 'string') : [],
      };
    },
  };
}
