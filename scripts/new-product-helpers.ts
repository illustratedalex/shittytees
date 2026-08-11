import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import type { Product, ProductVariant } from '@/lib/types/product';
import type { NewCandidate } from '@/data/newCandidates';
import type { NewCandidateProductMapping } from '@/data/newCandidatePrintfulMappings';
import { toStoredPublishedProduct } from '@/data/publishedProducts';

const NEW_CANDIDATES_FILE = resolve(process.cwd(), 'data/newCandidates.json');
const PUBLISHED_PRODUCTS_FILE = resolve(process.cwd(), 'data/publishedProducts.json');
const CANDIDATE_MAPPINGS_FILE = resolve(process.cwd(), 'data/newCandidatePrintfulMappings.json');
const PUBLISHED_MAPPINGS_FILE = resolve(process.cwd(), 'data/publishedPrintfulMappings.json');

function stringifyStable(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJsonFile<T>(path: string): Promise<T> {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw) as T;
}

async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await writeFile(path, stringifyStable(value), 'utf8');
}

export async function loadNewCandidates(): Promise<NewCandidate[]> {
  return readJsonFile<NewCandidate[]>(NEW_CANDIDATES_FILE);
}

export async function saveNewCandidates(candidates: NewCandidate[]): Promise<void> {
  const sorted = [...candidates].sort((a, b) => a.proposedSlug.localeCompare(b.proposedSlug));
  await writeJsonFile(NEW_CANDIDATES_FILE, sorted);
}

export async function loadPublishedProducts(): Promise<Product[]> {
  const data = await readJsonFile<Array<Omit<Product, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>>(PUBLISHED_PRODUCTS_FILE);
  return data.map((product) => ({
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));
}

export async function savePublishedProducts(products: Product[]): Promise<void> {
  const stored = products
    .map((product) => toStoredPublishedProduct(product))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  await writeJsonFile(PUBLISHED_PRODUCTS_FILE, stored);
}

export async function loadCandidateMappings(): Promise<NewCandidateProductMapping[]> {
  return readJsonFile<NewCandidateProductMapping[]>(CANDIDATE_MAPPINGS_FILE);
}

export async function saveCandidateMappings(mappings: NewCandidateProductMapping[]): Promise<void> {
  const sorted = [...mappings].sort((a, b) => a.slug.localeCompare(b.slug));
  await writeJsonFile(CANDIDATE_MAPPINGS_FILE, sorted);
}

export async function loadPublishedMappings(): Promise<NewCandidateProductMapping[]> {
  return readJsonFile<NewCandidateProductMapping[]>(PUBLISHED_MAPPINGS_FILE);
}

export async function savePublishedMappings(mappings: NewCandidateProductMapping[]): Promise<void> {
  const sorted = [...mappings].sort((a, b) => a.slug.localeCompare(b.slug));
  await writeJsonFile(PUBLISHED_MAPPINGS_FILE, sorted);
}

function fallbackImageDataUri(title: string): string {
  const text = encodeURIComponent(title.toUpperCase());
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Crect width='1000' height='1000' fill='%23120f0d'/%3E%3Ctext x='500' y='520' text-anchor='middle' fill='%23f2ecde' font-family='Arial,sans-serif' font-size='34'%3E${text}%3C/text%3E%3C/svg%3E`;
}

function normalizeColorHex(color: string): string {
  const value = color.toLowerCase();
  if (value.includes('black')) return '#000000';
  if (value.includes('white') || value.includes('bone')) return '#f5f5dc';
  if (value.includes('navy') || value.includes('royal')) return '#1f2d50';
  if (value.includes('red') || value.includes('oxblood')) return '#8b1c2d';
  if (value.includes('pink') || value.includes('lilac') || value.includes('mauve')) return '#a0678f';
  if (value.includes('forest') || value.includes('olive')) return '#3f5f3f';
  return '#3a3a3a';
}

export function createPublishedProductFromCandidate(candidate: NewCandidate): Product {
  const now = new Date();
  const productId = `imported-${candidate.printfulSyncProductId}`;
  const activeVariants = candidate.variants.filter((variant) => variant.active);
  const priceSeed = activeVariants.find((variant) => typeof variant.retailPrice === 'number' && variant.retailPrice > 0)?.retailPrice || 19.99;

  const variants: ProductVariant[] = candidate.variants.map((variant) => ({
    id: `${productId}-var-${variant.printfulSyncVariantId}`,
    printfulVariantId: String(variant.printfulSyncVariantId),
    name: `${variant.color} ${variant.size}`,
    size: variant.size,
    color: variant.color,
    colorHex: normalizeColorHex(variant.color),
    sku: variant.sku || `${candidate.proposedSlug}-${variant.size}-${variant.color}`,
    retailPrice: variant.retailPrice || priceSeed,
    available: variant.active,
  }));

  const leadImage = candidate.mockups.front || candidate.mockups.back || candidate.mockups.alternate?.[0] || fallbackImageDataUri(candidate.title);

  return {
    id: productId,
    printfulProductId: String(candidate.printfulSyncProductId),
    slug: candidate.proposedSlug,
    name: candidate.title,
    shortDescription: 'Imported from Printful and reviewed for local publication.',
    description: `${candidate.title} by ShittyTees. Premium print-on-demand apparel fulfilled through mapped Printful variants.`,
    category: 'T-Shirts',
    collectionSlug: 'limited-runs',
    active: true,
    publishStatus: 'published',
    featured: false,
    images: [
      {
        id: `${productId}-image-1`,
        src: leadImage,
        alt: `${candidate.title} product image`,
      },
    ],
    basePrice: 19.99,
    retailPrice: priceSeed,
    currency: 'USD',
    variants,
    tags: ['printful-import', 'new-candidate'],
    createdAt: now,
    updatedAt: now,
  };
}
