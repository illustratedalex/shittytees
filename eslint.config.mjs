import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: [
      'app/cart/page.tsx',
      'app/shop/**/*.tsx',
      'components/product/GarmentArtwork.tsx',
      'components/product/ProductTile.tsx',
    ],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
]);
