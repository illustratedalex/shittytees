import { readFile, readdir } from 'fs/promises';
import { resolve } from 'path';
import { getPool } from '@/lib/orders/database';

function parseMigration(content: string): { up: string; down: string } {
  const upMarker = '-- Up';
  const downMarker = '-- Down';
  const upIndex = content.indexOf(upMarker);
  const downIndex = content.indexOf(downMarker);

  if (upIndex === -1 || downIndex === -1 || downIndex <= upIndex) {
    throw new Error('Migration must contain -- Up and -- Down sections in order');
  }

  return {
    up: content.slice(upIndex + upMarker.length, downIndex).trim(),
    down: content.slice(downIndex + downMarker.length).trim(),
  };
}

async function ensureMigrationsTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function run() {
  await ensureMigrationsTable();
  const migrationsDir = resolve(process.cwd(), 'db/migrations');
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();
  const pool = getPool();

  for (const file of files) {
    const id = file;
    const already = await pool.query<{ id: string }>('SELECT id FROM schema_migrations WHERE id = $1 LIMIT 1', [id]);
    if (already.rows[0]) {
      continue;
    }

    const raw = await readFile(resolve(migrationsDir, file), 'utf8');
    const migration = parseMigration(raw);
    if (!migration.up) {
      throw new Error(`Migration ${file} has empty up section`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migration.up);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id]);
      await client.query('COMMIT');
      console.log(`Applied migration: ${id}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  console.log('Database migrations complete.');
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
