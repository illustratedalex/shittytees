import { mkdtemp, readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { applyLocalSyncUpdate, planLocalSyncUpdate } from '@/lib/printful/syncFileOps';

describe('sync file ops', () => {
  it('dry-run plan does not require file writes', () => {
    const plan = planLocalSyncUpdate('data/printfulImportedCatalog.ts', 'a', 'b');
    expect(plan.changed).toBe(true);
    expect(plan.wouldChangeOnApply).toBe(true);
  });

  it('apply writes file and creates backup', async () => {
    const dir = await mkdtemp(resolve(tmpdir(), 'pf-sync-'));
    const target = resolve(dir, 'catalog.ts');
    const backupRoot = resolve(dir, 'backups');
    await writeFile(target, 'old', 'utf8');

    const backup = await applyLocalSyncUpdate(target, 'new', backupRoot);
    const updated = await readFile(target, 'utf8');

    expect(updated).toBe('new');
    expect(backup.startsWith(backupRoot)).toBe(true);
  });

  it('second plan is unchanged after identical content write', async () => {
    const dir = await mkdtemp(resolve(tmpdir(), 'pf-sync-idem-'));
    const target = resolve(dir, 'catalog.ts');
    await writeFile(target, 'stable', 'utf8');

    const plan = planLocalSyncUpdate('catalog.ts', 'stable', 'stable');
    expect(plan.changed).toBe(false);
    expect(plan.wouldChangeOnApply).toBe(false);
  });
});
