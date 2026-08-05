import { copyFile, mkdir, readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { randomUUID } from 'crypto';
import { getPool } from '@/lib/orders/database';
import { generatePublicAccessToken, hashPublicAccessToken } from '@/lib/orders/publicAccess';

type LegacyOrder = {
  id: string;
  status: string;
  customerEmail: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  printfulOrderId?: string | number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  fulfilled: boolean;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: string;
    variantId: string;
    printfulVariantId: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    image: string;
  }>;
};

type LegacyStore = {
  orders: LegacyOrder[];
};

const SOURCE_PATHS = [
  resolve(process.cwd(), '.generated/orders.v2.json'),
  resolve(process.cwd(), '.generated/orders.json'),
];

async function resolveExistingSourcePath(): Promise<string | null> {
  for (const path of SOURCE_PATHS) {
    try {
      await readFile(path, 'utf8');
      return path;
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: string }).code : undefined;
      if (code === 'ENOENT') continue;
      throw error;
    }
  }
  return null;
}

function parseArgs() {
  return {
    apply: process.argv.includes('--apply'),
  };
}

function redact(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain || !name) return '[redacted]';
  return `${name[0]}***@${domain}`;
}

async function readSourceStore(): Promise<LegacyStore> {
  for (const path of SOURCE_PATHS) {
    try {
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as LegacyStore;
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: string }).code : undefined;
      if (code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  return { orders: [] };
}

async function backupSource(): Promise<string> {
  const sourcePath = await resolveExistingSourcePath();
  if (!sourcePath) {
    throw new Error('Source order file does not exist');
  }

  const backupPath = resolve(process.cwd(), `.generated/orders.backup.${Date.now()}.json`);
  await mkdir(dirname(backupPath), { recursive: true });
  await copyFile(sourcePath, backupPath);
  return backupPath;
}

async function migrate(apply: boolean) {
  const source = await readSourceStore();

  if (!source.orders.length) {
    console.log('No source orders found.');
    return;
  }

  if (apply && !process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required for migration.');
    process.exitCode = 1;
    return;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    if (!apply) {
      console.log(`Dry run: ${source.orders.length} orders would be migrated.`);
      for (const order of source.orders.slice(0, 10)) {
        console.log(`- ${order.id} (${order.status}) ${redact(order.customerEmail)} items=${order.items.length}`);
      }
      return;
    }

    const backupPath = await backupSource();
    console.log(`Backup created: ${backupPath}`);

    await client.query('BEGIN');

    for (const order of source.orders) {
      const tokenHash = hashPublicAccessToken(generatePublicAccessToken());
      const existing = await client.query('SELECT id FROM orders WHERE id = $1 LIMIT 1', [order.id]);
      if (existing.rows[0]) {
        console.log(`Skipping existing order ${order.id}`);
        continue;
      }

      await client.query(
        `INSERT INTO orders (
          id, public_token_hash, status, customer_email,
          recipient_first_name, recipient_last_name, recipient_email, recipient_phone,
          recipient_address1, recipient_address2, recipient_city, recipient_state,
          recipient_postal_code, recipient_country,
          stripe_checkout_session_id, stripe_payment_intent_id,
          printful_order_id, printful_external_order_id,
          subtotal, shipping, tax, total, currency, fulfilled, created_at, updated_at
        ) VALUES (
          $1,$2,$3,$4,
          $5,$6,$7,$8,
          $9,$10,$11,$12,
          $13,$14,
          $15,$16,
          $17,$18,
          $19,$20,$21,$22,$23,$24,$25,$26
        )`,
        [
          order.id,
          tokenHash,
          order.status,
          order.customerEmail,
          order.shippingAddress.firstName,
          order.shippingAddress.lastName,
          order.shippingAddress.email,
          order.shippingAddress.phone || null,
          order.shippingAddress.address,
          order.shippingAddress.addressLine2 || null,
          order.shippingAddress.city,
          order.shippingAddress.state,
          order.shippingAddress.postalCode,
          order.shippingAddress.country,
          order.stripeCheckoutSessionId || null,
          order.stripePaymentIntentId || null,
          order.printfulOrderId ? Number(order.printfulOrderId) : null,
          order.id,
          order.subtotal,
          order.shipping,
          order.tax,
          order.total,
          'USD',
          order.fulfilled,
          new Date(order.createdAt),
          new Date(order.updatedAt),
        ],
      );

      for (const item of order.items) {
        await client.query(
          `INSERT INTO order_items (
            id, order_id, product_id, product_slug, local_variant_id, printful_variant_id,
            name, size, color, quantity, unit_price, image
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            randomUUID(),
            order.id,
            item.productId,
            item.productId,
            item.variantId,
            item.printfulVariantId,
            item.name,
            item.size,
            item.color,
            item.quantity,
            item.unitPrice,
            item.image,
          ],
        );
      }

      console.log(`Migrated order ${order.id} (${redact(order.customerEmail)})`);
    }

    await client.query('COMMIT');
    console.log('Migration complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed');
    throw error;
  } finally {
    client.release();
  }
}

const args = parseArgs();
void migrate(args.apply);
