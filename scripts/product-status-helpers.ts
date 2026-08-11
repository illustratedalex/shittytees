import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { ProductPublishStatus } from '@/data/productStatus';

const STATUS_FILE = resolve(process.cwd(), 'data/productStatusOverrides.json');

export async function loadStatusOverrides(): Promise<Record<string, ProductPublishStatus>> {
  const raw = await readFile(STATUS_FILE, 'utf8');
  return JSON.parse(raw) as Record<string, ProductPublishStatus>;
}

export async function saveStatusOverrides(overrides: Record<string, ProductPublishStatus>): Promise<void> {
  const sorted = Object.fromEntries(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(STATUS_FILE, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
}

export function parseSlugArg(): string {
  const slug = process.argv[2];
  if (!slug) {
    throw new Error('Usage: npm run product:<action> -- <slug>');
  }
  return slug;
}
