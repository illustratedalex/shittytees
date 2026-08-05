import { PoolClient } from 'pg';
import { OrderNotFoundError } from './errors';
import { hashPublicAccessToken } from './publicAccess';
import { CreateOrderInput, OrderRepository } from './repository';
import { assertTransition } from './transitions';
import { OrderListOptions, OrderListResult, OrderStatus, ProcessedWebhookEvent, StoreOrder, StoreOrderItem, StoreShippingAddress } from './types';
import { query, withTransaction } from './database';

type DbOrderRow = {
  id: string;
  public_token_hash: string;
  status: OrderStatus;
  customer_email: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  recipient_address1: string;
  recipient_address2: string | null;
  recipient_city: string;
  recipient_state: string;
  recipient_postal_code: string;
  recipient_country: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  printful_order_id: number | null;
  printful_external_order_id: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  tracking_number: string | null;
  tracking_url: string | null;
  mapping_error: string | null;
  fulfilled: boolean;
  created_at: Date;
  updated_at: Date;
};

type DbItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_slug: string;
  local_variant_id: string;
  printful_variant_id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  image: string;
};

function rowToShipping(row: DbOrderRow): StoreShippingAddress {
  return {
    firstName: row.recipient_first_name,
    lastName: row.recipient_last_name,
    email: row.recipient_email,
    phone: row.recipient_phone || undefined,
    address: row.recipient_address1,
    addressLine2: row.recipient_address2 || undefined,
    city: row.recipient_city,
    state: row.recipient_state,
    postalCode: row.recipient_postal_code,
    country: row.recipient_country,
  };
}

function rowToOrder(row: DbOrderRow, items: StoreOrderItem[]): StoreOrder {
  return {
    id: row.id,
    publicTokenHash: row.public_token_hash,
    status: row.status,
    customerEmail: row.customer_email,
    shippingAddress: rowToShipping(row),
    stripeCheckoutSessionId: row.stripe_checkout_session_id || undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
    printfulOrderId: row.printful_order_id || undefined,
    printfulExternalOrderId: row.printful_external_order_id || undefined,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    total: Number(row.total),
    currency: row.currency,
    trackingNumber: row.tracking_number || undefined,
    trackingUrl: row.tracking_url || undefined,
    mappingError: row.mapping_error || undefined,
    fulfilled: row.fulfilled,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    items,
  };
}

async function getItems(client: PoolClient | null, orderId: string): Promise<StoreOrderItem[]> {
  const sql = 'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC';
  const rows = client ? (await client.query<DbItemRow>(sql, [orderId])).rows : await query<DbItemRow>(sql, [orderId]);
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    localVariantId: row.local_variant_id,
    printfulVariantId: row.printful_variant_id,
    name: row.name,
    size: row.size,
    color: row.color,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    image: row.image,
  }));
}

async function getOrderByWhere(whereSql: string, values: unknown[]): Promise<StoreOrder | null> {
  const orderRows = await query<DbOrderRow>(`SELECT * FROM orders WHERE ${whereSql} LIMIT 1`, values);
  const orderRow = orderRows[0];
  if (!orderRow) return null;
  const items = await getItems(null, orderRow.id);
  return rowToOrder(orderRow, items);
}

async function replaceItems(client: PoolClient, orderId: string, items: StoreOrderItem[]): Promise<void> {
  await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
  for (const item of items) {
    await client.query(
      `INSERT INTO order_items (
        id, order_id, product_id, product_slug, local_variant_id, printful_variant_id,
        name, size, color, quantity, unit_price, image
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        item.id,
        orderId,
        item.productId,
        item.productSlug,
        item.localVariantId,
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
}

function listSql(options: OrderListOptions) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (options.status) {
    values.push(options.status);
    clauses.push(`status = $${values.length}`);
  }

  if (options.search) {
    values.push(`%${options.search}%`);
    values.push(`%${options.search}%`);
    clauses.push(`(id ILIKE $${values.length - 1} OR customer_email ILIKE $${values.length})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
}

export function createPostgresOrderRepository(): OrderRepository {
  return {
    async create(input: CreateOrderInput): Promise<StoreOrder> {
      return withTransaction(async (client) => {
        const now = new Date();
        const createdAt = input.createdAt || now;
        const updatedAt = input.updatedAt || now;

        await client.query(
          `INSERT INTO orders (
            id, public_token_hash, status, customer_email,
            recipient_first_name, recipient_last_name, recipient_email, recipient_phone,
            recipient_address1, recipient_address2, recipient_city, recipient_state,
            recipient_postal_code, recipient_country,
            stripe_checkout_session_id, stripe_payment_intent_id,
            printful_order_id, printful_external_order_id,
            subtotal, shipping, tax, total, currency,
            tracking_number, tracking_url, mapping_error, fulfilled,
            created_at, updated_at
          ) VALUES (
            $1,$2,$3,$4,
            $5,$6,$7,$8,
            $9,$10,$11,$12,
            $13,$14,
            $15,$16,
            $17,$18,
            $19,$20,$21,$22,$23,
            $24,$25,$26,$27,
            $28,$29
          )
          ON CONFLICT (id) DO NOTHING`,
          [
            input.id,
            input.publicTokenHash,
            input.status,
            input.customerEmail,
            input.shippingAddress.firstName,
            input.shippingAddress.lastName,
            input.shippingAddress.email,
            input.shippingAddress.phone || null,
            input.shippingAddress.address,
            input.shippingAddress.addressLine2 || null,
            input.shippingAddress.city,
            input.shippingAddress.state,
            input.shippingAddress.postalCode,
            input.shippingAddress.country,
            input.stripeCheckoutSessionId || null,
            input.stripePaymentIntentId || null,
            input.printfulOrderId || null,
            input.printfulExternalOrderId || null,
            input.subtotal,
            input.shipping,
            input.tax,
            input.total,
            input.currency,
            input.trackingNumber || null,
            input.trackingUrl || null,
            input.mappingError || null,
            input.fulfilled,
            createdAt,
            updatedAt,
          ],
        );

        const existing = await client.query<DbOrderRow>('SELECT * FROM orders WHERE id = $1 LIMIT 1', [input.id]);
        const row = existing.rows[0];
        if (!row) {
          throw new OrderNotFoundError('Unable to create order');
        }

        await replaceItems(client, input.id, input.items);
        const items = await getItems(client, input.id);
        return rowToOrder(row, items);
      });
    },

    async getById(id) {
      return getOrderByWhere('id = $1', [id]);
    },

    async getByPublicToken(token) {
      return getOrderByWhere('public_token_hash = $1', [hashPublicAccessToken(token)]);
    },

    async getByStripeCheckoutSessionId(sessionId) {
      return getOrderByWhere('stripe_checkout_session_id = $1', [sessionId]);
    },

    async getByStripePaymentIntentId(paymentIntentId) {
      return getOrderByWhere('stripe_payment_intent_id = $1', [paymentIntentId]);
    },

    async getByPrintfulOrderId(printfulOrderId) {
      return getOrderByWhere('printful_order_id = $1', [printfulOrderId]);
    },

    async update(id, patch) {
      return withTransaction(async (client) => {
        const existing = await client.query<DbOrderRow>('SELECT * FROM orders WHERE id = $1 LIMIT 1 FOR UPDATE', [id]);
        const row = existing.rows[0];
        if (!row) {
          throw new OrderNotFoundError();
        }

        const updatedAt = patch.updatedAt || new Date();
        const values = {
          status: patch.status || row.status,
          customerEmail: patch.customerEmail || row.customer_email,
          stripeCheckoutSessionId: patch.stripeCheckoutSessionId || row.stripe_checkout_session_id,
          stripePaymentIntentId: patch.stripePaymentIntentId || row.stripe_payment_intent_id,
          printfulOrderId: patch.printfulOrderId ?? row.printful_order_id,
          printfulExternalOrderId: patch.printfulExternalOrderId || row.printful_external_order_id,
          subtotal: patch.subtotal ?? Number(row.subtotal),
          shipping: patch.shipping ?? Number(row.shipping),
          tax: patch.tax ?? Number(row.tax),
          total: patch.total ?? Number(row.total),
          currency: patch.currency || row.currency,
          trackingNumber: patch.trackingNumber || row.tracking_number,
          trackingUrl: patch.trackingUrl || row.tracking_url,
          mappingError: patch.mappingError || row.mapping_error,
          fulfilled: patch.fulfilled ?? row.fulfilled,
          publicTokenHash: patch.publicTokenHash || row.public_token_hash,
          shippingAddress: patch.shippingAddress || rowToShipping(row),
        };

        await client.query(
          `UPDATE orders SET
            public_token_hash = $2,
            status = $3,
            customer_email = $4,
            recipient_first_name = $5,
            recipient_last_name = $6,
            recipient_email = $7,
            recipient_phone = $8,
            recipient_address1 = $9,
            recipient_address2 = $10,
            recipient_city = $11,
            recipient_state = $12,
            recipient_postal_code = $13,
            recipient_country = $14,
            stripe_checkout_session_id = $15,
            stripe_payment_intent_id = $16,
            printful_order_id = $17,
            printful_external_order_id = $18,
            subtotal = $19,
            shipping = $20,
            tax = $21,
            total = $22,
            currency = $23,
            tracking_number = $24,
            tracking_url = $25,
            mapping_error = $26,
            fulfilled = $27,
            updated_at = $28
          WHERE id = $1`,
          [
            id,
            values.publicTokenHash,
            values.status,
            values.customerEmail,
            values.shippingAddress.firstName,
            values.shippingAddress.lastName,
            values.shippingAddress.email,
            values.shippingAddress.phone || null,
            values.shippingAddress.address,
            values.shippingAddress.addressLine2 || null,
            values.shippingAddress.city,
            values.shippingAddress.state,
            values.shippingAddress.postalCode,
            values.shippingAddress.country,
            values.stripeCheckoutSessionId || null,
            values.stripePaymentIntentId || null,
            values.printfulOrderId || null,
            values.printfulExternalOrderId || null,
            values.subtotal,
            values.shipping,
            values.tax,
            values.total,
            values.currency,
            values.trackingNumber || null,
            values.trackingUrl || null,
            values.mappingError || null,
            values.fulfilled,
            updatedAt,
          ],
        );

        if (patch.items) {
          await replaceItems(client, id, patch.items);
        }

        const next = await client.query<DbOrderRow>('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);
        const nextRow = next.rows[0];
        if (!nextRow) {
          throw new OrderNotFoundError();
        }

        const items = await getItems(client, id);
        return rowToOrder(nextRow, items);
      });
    },

    async transitionStatus(id, expectedStatuses, nextStatus, source, note, patch) {
      return withTransaction(async (client) => {
        const existing = await client.query<DbOrderRow>('SELECT * FROM orders WHERE id = $1 LIMIT 1 FOR UPDATE', [id]);
        const row = existing.rows[0];
        if (!row) {
          throw new OrderNotFoundError();
        }

        if (!expectedStatuses.includes(row.status)) {
          throw new Error(`Expected statuses ${expectedStatuses.join(',')} but found ${row.status}`);
        }

        assertTransition(row.status, nextStatus);

        const values = {
          status: nextStatus,
          customerEmail: patch?.customerEmail || row.customer_email,
          stripeCheckoutSessionId: patch?.stripeCheckoutSessionId || row.stripe_checkout_session_id,
          stripePaymentIntentId: patch?.stripePaymentIntentId || row.stripe_payment_intent_id,
          printfulOrderId: patch?.printfulOrderId ?? row.printful_order_id,
          printfulExternalOrderId: patch?.printfulExternalOrderId || row.printful_external_order_id,
          subtotal: patch?.subtotal ?? Number(row.subtotal),
          shipping: patch?.shipping ?? Number(row.shipping),
          tax: patch?.tax ?? Number(row.tax),
          total: patch?.total ?? Number(row.total),
          currency: patch?.currency || row.currency,
          trackingNumber: patch?.trackingNumber || row.tracking_number,
          trackingUrl: patch?.trackingUrl || row.tracking_url,
          mappingError: patch?.mappingError || row.mapping_error,
          fulfilled: patch?.fulfilled ?? row.fulfilled,
          publicTokenHash: patch?.publicTokenHash || row.public_token_hash,
          shippingAddress: patch?.shippingAddress || rowToShipping(row),
          updatedAt: patch?.updatedAt || new Date(),
        };

        await client.query(
          `UPDATE orders SET
            public_token_hash = $2,
            status = $3,
            customer_email = $4,
            recipient_first_name = $5,
            recipient_last_name = $6,
            recipient_email = $7,
            recipient_phone = $8,
            recipient_address1 = $9,
            recipient_address2 = $10,
            recipient_city = $11,
            recipient_state = $12,
            recipient_postal_code = $13,
            recipient_country = $14,
            stripe_checkout_session_id = $15,
            stripe_payment_intent_id = $16,
            printful_order_id = $17,
            printful_external_order_id = $18,
            subtotal = $19,
            shipping = $20,
            tax = $21,
            total = $22,
            currency = $23,
            tracking_number = $24,
            tracking_url = $25,
            mapping_error = $26,
            fulfilled = $27,
            updated_at = $28
          WHERE id = $1`,
          [
            id,
            values.publicTokenHash,
            values.status,
            values.customerEmail,
            values.shippingAddress.firstName,
            values.shippingAddress.lastName,
            values.shippingAddress.email,
            values.shippingAddress.phone || null,
            values.shippingAddress.address,
            values.shippingAddress.addressLine2 || null,
            values.shippingAddress.city,
            values.shippingAddress.state,
            values.shippingAddress.postalCode,
            values.shippingAddress.country,
            values.stripeCheckoutSessionId || null,
            values.stripePaymentIntentId || null,
            values.printfulOrderId || null,
            values.printfulExternalOrderId || null,
            values.subtotal,
            values.shipping,
            values.tax,
            values.total,
            values.currency,
            values.trackingNumber || null,
            values.trackingUrl || null,
            values.mappingError || null,
            values.fulfilled,
            values.updatedAt,
          ],
        );

        if (patch?.items) {
          await replaceItems(client, id, patch.items);
        }

        await client.query(
          `INSERT INTO order_status_events (order_id, previous_status, next_status, source, note, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, row.status, nextStatus, source, note || null],
        );

        const final = await client.query<DbOrderRow>('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);
        const finalRow = final.rows[0];
        if (!finalRow) {
          throw new OrderNotFoundError();
        }

        const items = await getItems(client, id);
        return rowToOrder(finalRow, items);
      });
    },

    async recordWebhookEvent(event: ProcessedWebhookEvent) {
      const rows = await query<{ inserted: boolean }>(
        `WITH ins AS (
          INSERT INTO processed_webhook_events (provider, event_id, event_type, payload_hash, processed_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (provider, event_id) DO NOTHING
          RETURNING 1
        )
        SELECT EXISTS(SELECT 1 FROM ins) AS inserted`,
        [event.provider, event.eventId, event.eventType, event.payloadHash || null, event.processedAt || new Date()],
      );

      return rows[0]?.inserted ?? false;
    },

    async list(options = {}) {
      const page = Math.max(1, options.page || 1);
      const pageSize = Math.max(1, Math.min(100, options.pageSize || 25));
      const offset = (page - 1) * pageSize;
      const { where, values } = listSql(options);

      const countRows = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM orders ${where}`, values);
      const total = Number(countRows[0]?.count || '0');

      const orderRows = await query<DbOrderRow>(
        `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, pageSize, offset],
      );

      const orders: StoreOrder[] = [];
      for (const row of orderRows) {
        const items = await getItems(null, row.id);
        orders.push(rowToOrder(row, items));
      }

      return {
        orders,
        page,
        pageSize,
        total,
      } as OrderListResult;
    },
  };
}
