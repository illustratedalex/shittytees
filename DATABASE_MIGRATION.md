# Database Migration

This project supports migration from file-backed orders to PostgreSQL while keeping the same repository interface.

## Migration Assets

- SQL schema migration: `db/migrations/0001_orders.sql`
- Data migration script: `scripts/migrate-file-orders-to-database.ts`

## Runtime Configuration

Required for Postgres adapter:

- `ORDER_REPOSITORY=postgres`
- `DATABASE_URL=<postgres connection string>`

Production defaults to the Postgres adapter.

## Script Usage

Dry-run (default):

- `npm run orders:migrate`

Apply migration:

- `npm run orders:migrate -- --apply`

Behavior:

- Dry-run logs summary without writing to database.
- Apply mode creates a source backup file before migration.
- Existing destination order ids are skipped safely.

## Source Files

The migration script checks source files in this order:

- `.generated/orders.v2.json`
- `.generated/orders.json`

If no source file exists, script exits cleanly with `No source orders found.`
