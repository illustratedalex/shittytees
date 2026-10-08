// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pool, PoolClient } from 'pg';

let pool: Pool | undefined;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost/test');
});

afterEach(async () => {
  await pool?.end();
  pool = undefined;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('database pool disconnects', () => {
  it('handles idle connection errors without throwing or logging client details', async () => {
    const { getPool } = await import('../../lib/orders/database');
    pool = getPool();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Connection terminated unexpectedly: sensitive connection details');
    const client = { password: 'sensitive password' } as unknown as PoolClient;

    expect(() => pool!.emit('error', error, client)).not.toThrow();
    expect(log).toHaveBeenCalledExactlyOnceWith(
      'Postgres pool lost an idle connection; the client was removed.',
    );
    expect(getPool()).toBe(pool);
    expect(pool.listenerCount('error')).toBe(1);
  });

  it('allows a later query after an idle connection error', async () => {
    const { getPool, query } = await import('../../lib/orders/database');
    pool = getPool();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const runQuery = vi.spyOn(pool, 'query').mockResolvedValue({ rows: [{ id: 1 }] } as never);

    pool.emit('error', new Error('Connection terminated unexpectedly'));
    await expect(query('SELECT id FROM orders WHERE id = $1', [1])).resolves.toEqual([{ id: 1 }]);
    expect(runQuery).toHaveBeenCalledWith('SELECT id FROM orders WHERE id = $1', [1]);
  });

  it('still rejects an active query failure without retrying it', async () => {
    const { getPool, query } = await import('../../lib/orders/database');
    pool = getPool();
    const error = new Error('active query connection failure');
    const runQuery = vi.spyOn(pool, 'query').mockRejectedValue(error as never);

    await expect(query('SELECT 1')).rejects.toBe(error);
    expect(runQuery).toHaveBeenCalledTimes(1);
  });
});
