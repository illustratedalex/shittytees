import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const runtimeFiles = [
  'lib/printful/client.ts',
  'lib/printful/products.ts',
  'lib/printful/orders.ts',
  'lib/printful/import.ts',
  'lib/printful/catalog-import.ts',
  'lib/printful/presentation-import.ts',
  'scripts/inspect-printful-store.ts',
  'scripts/sync-printful.ts',
];

describe('no square runtime dependency', () => {
  it('does not import square runtime modules in printful workflow files', () => {
    for (const file of runtimeFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(/from\s+['\"]@\/lib\/square/.test(content)).toBe(false);
      expect(/from\s+['\"][^'\"]*\/square\//.test(content)).toBe(false);
    }
  });
});
