import { IMPORTED_PRINTFUL_PRODUCTS } from '@/data/printfulImportedCatalog';
import { getProductPresentation, isRealProductImage, type ProductPresentation } from '@/data/productPresentation';
import type { Product } from '@/lib/types/product';

export type ProductImageRole =
  | 'front-flat'
  | 'back-flat'
  | 'front-model'
  | 'back-model'
  | 'lifestyle'
  | 'detail'
  | 'artwork'
  | 'unknown';

export type ProductImageSource = 'local' | 'printful' | 'artwork';

export interface ProductImage {
  url: string;
  role: ProductImageRole;
  alt: string;
  source: ProductImageSource;
  priority?: number;
}

export interface ResolvedProductImage {
  src: string;
  alt: string;
  source: ProductImageSource | 'placeholder';
  isPreview: boolean;
  role: ProductImageRole | 'unknown';
}

type ProductLike = Pick<Product, 'name' | 'slug' | 'images'>;

type ImportedImageFile = {
  type?: string;
  url?: string;
  visible?: boolean;
};

type ImportedImageRecord = {
  slug: string;
  mockupFrontUrl?: string;
  mockupBackUrl?: string;
  alternateMockupUrls: string[];
  artworkFiles: ImportedImageFile[];
  variants: Array<{
    files: ImportedImageFile[];
  }>;
};

type UrlHint = {
  roles: Set<ProductImageRole>;
  visible: Set<boolean>;
};

const IMPORTED_IMAGE_RECORDS = IMPORTED_PRINTFUL_PRODUCTS as ImportedImageRecord[];
const IMPORTED_IMAGE_BY_SLUG = new Map(IMPORTED_IMAGE_RECORDS.map((item) => [item.slug, item]));

const PRIMARY_ROLE_PRIORITY: Record<ProductImageRole, number> = {
  'front-flat': 20,
  'front-model': 30,
  artwork: 40,
  'back-flat': 50,
  lifestyle: 60,
  detail: 70,
  'back-model': 80,
  unknown: 90,
};

const GALLERY_ROLE_PRIORITY: Record<ProductImageRole, number> = {
  'front-flat': 10,
  'back-flat': 20,
  'front-model': 30,
  'back-model': 40,
  lifestyle: 50,
  detail: 60,
  artwork: 70,
  unknown: 80,
};

function neutralPlaceholder(name: string): string {
  const encoded = encodeURIComponent(name.toUpperCase());
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'><rect width='800' height='1000' fill='%23ece8df'/><text x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23666058' font-family='Arial,sans-serif' font-size='36' letter-spacing='4'>${encoded}</text></svg>`;
}

function productAlt(name: string, role: ProductImageRole): string {
  switch (role) {
    case 'front-flat':
      return `${name} front flat mockup`;
    case 'back-flat':
      return `${name} back flat mockup`;
    case 'front-model':
      return `${name} front model mockup`;
    case 'back-model':
      return `${name} back model mockup`;
    case 'lifestyle':
      return `${name} lifestyle mockup`;
    case 'detail':
      return `${name} detail image`;
    case 'artwork':
      return `${name} artwork preview`;
    default:
      return `${name} product image`;
  }
}

function makeImage(url: string, role: ProductImageRole, source: ProductImageSource, name: string, priority?: number): ProductImage {
  return {
    url,
    role,
    source,
    priority,
    alt: productAlt(name, role),
  };
}

function fileTypeToRole(type?: string): ProductImageRole {
  const normalized = type?.toLowerCase() || '';
  if (normalized.includes('front')) return 'front-flat';
  if (normalized.includes('back')) return 'back-flat';
  if (normalized.includes('preview')) return 'front-model';
  if (normalized.includes('detail')) return 'detail';
  if (normalized.includes('default')) return 'artwork';
  return 'unknown';
}

function buildUrlHints(imported?: ImportedImageRecord): Map<string, UrlHint> {
  const hints = new Map<string, UrlHint>();

  const register = (url?: string, role?: ProductImageRole, visible?: boolean) => {
    if (!isRealProductImage(url)) return;
    const resolvedUrl = url as string;
    const existing = hints.get(resolvedUrl) || { roles: new Set<ProductImageRole>(), visible: new Set<boolean>() };
    if (role) existing.roles.add(role);
    if (typeof visible === 'boolean') existing.visible.add(visible);
    hints.set(resolvedUrl, existing);
  };

  for (const artworkFile of imported?.artworkFiles || []) {
    register(artworkFile.url, 'artwork', artworkFile.visible);
  }

  for (const variant of imported?.variants || []) {
    for (const file of variant.files || []) {
      register(file.url, fileTypeToRole(file.type), file.visible);
    }
  }

  return hints;
}

// Printful archive snapshots expose strong placement hints in file types such as
// `front_large`, `back`, and `preview`. We prefer explicit front/back placements,
// then file-type hints, then visibility/alternate fallback as a deterministic last step.
function classifyImportedUrl(url: string, imported: ImportedImageRecord, hints: Map<string, UrlHint>): ProductImageRole {
  const hint = hints.get(url);

  if (url === imported.mockupFrontUrl) {
    if (hint?.roles.has('front-flat')) return 'front-flat';
    if (hint?.roles.has('front-model')) return 'front-model';
    return 'front-flat';
  }

  if (url === imported.mockupBackUrl) {
    if (hint?.roles.has('back-flat')) return 'back-flat';
    if (hint?.roles.has('back-model')) return 'back-model';
    return 'back-flat';
  }

  if (hint?.roles.has('front-flat')) return 'front-flat';
  if (hint?.roles.has('back-flat')) return 'back-flat';
  if (hint?.roles.has('front-model')) return hint.visible.has(true) ? 'lifestyle' : 'front-model';
  if (hint?.roles.has('back-model')) return 'back-model';
  if (hint?.roles.has('artwork')) return 'artwork';

  return 'unknown';
}

function collectPresentationImages(product: ProductLike, presentation?: ProductPresentation): ProductImage[] {
  const images: ProductImage[] = [];

  const frontImage = presentation?.frontImage;
  const backImage = presentation?.backImage;

  if (presentation?.source !== 'printful' && isRealProductImage(frontImage)) {
    images.push(makeImage(frontImage as string, 'front-flat', 'local', product.name, 1));
  }

  if (presentation?.source !== 'printful' && isRealProductImage(backImage)) {
    images.push(makeImage(backImage as string, 'back-flat', 'local', product.name, 2));
  }

  return images;
}

function collectImportedImages(product: ProductLike, imported?: ImportedImageRecord): ProductImage[] {
  if (!imported) return [];

  const hints = buildUrlHints(imported);
  const images: ProductImage[] = [];
  const seen = new Set<string>();

  const add = (url?: string) => {
    if (!isRealProductImage(url) || seen.has(url as string)) return;
    const resolvedUrl = url as string;
    seen.add(resolvedUrl);
    images.push(makeImage(resolvedUrl, classifyImportedUrl(resolvedUrl, imported, hints), 'printful', product.name));
  };

  add(imported.mockupFrontUrl);
  add(imported.mockupBackUrl);
  for (const url of imported.alternateMockupUrls || []) add(url);

  for (const file of imported.artworkFiles || []) {
    if (isRealProductImage(file.url) && !seen.has(file.url as string)) {
      seen.add(file.url as string);
      images.push(makeImage(file.url as string, 'artwork', 'printful', product.name));
    }
  }

  return images;
}

function collectArtworkImages(product: ProductLike): ProductImage[] {
  const artwork = product.images[0]?.src;
  if (!isRealProductImage(artwork)) {
    return [];
  }

  return [makeImage(artwork as string, 'artwork', 'artwork', product.name)];
}

export function normalizeProductImages(images: ProductImage[]): ProductImage[] {
  const byUrl = new Map<string, ProductImage>();

  for (const image of images) {
    const existing = byUrl.get(image.url);
    if (!existing) {
      byUrl.set(image.url, image);
      continue;
    }

    const existingPriority = PRIMARY_ROLE_PRIORITY[existing.role] + (existing.source === 'local' ? -5 : existing.source === 'artwork' ? 5 : 0);
    const nextPriority = PRIMARY_ROLE_PRIORITY[image.role] + (image.source === 'local' ? -5 : image.source === 'artwork' ? 5 : 0);

    if (nextPriority < existingPriority) {
      byUrl.set(image.url, image);
    }
  }

  return [...byUrl.values()].sort((left, right) => {
    const roleDelta = GALLERY_ROLE_PRIORITY[left.role] - GALLERY_ROLE_PRIORITY[right.role];
    if (roleDelta !== 0) return roleDelta;

    const sourceDelta = (left.source === 'local' ? -1 : left.source === 'printful' ? 0 : 1) - (right.source === 'local' ? -1 : right.source === 'printful' ? 0 : 1);
    if (sourceDelta !== 0) return sourceDelta;

    return (left.priority || 0) - (right.priority || 0);
  });
}

export function selectPrimaryProductImage(images: ProductImage[]): ProductImage | undefined {
  return images.slice().sort((left, right) => {
    const sourceLeft = left.source === 'local' ? -10 : left.source === 'printful' ? 0 : 10;
    const sourceRight = right.source === 'local' ? -10 : right.source === 'printful' ? 0 : 10;
    const leftPriority = PRIMARY_ROLE_PRIORITY[left.role] + sourceLeft + (left.priority || 0);
    const rightPriority = PRIMARY_ROLE_PRIORITY[right.role] + sourceRight + (right.priority || 0);
    return leftPriority - rightPriority;
  })[0];
}

export function resolveProductGallery(product: ProductLike): ProductImage[] {
  const presentation = getProductPresentation(product.slug);
  const imported = IMPORTED_IMAGE_BY_SLUG.get(product.slug);

  return normalizeProductImages([
    ...collectPresentationImages(product, presentation),
    ...collectImportedImages(product, imported),
    ...collectArtworkImages(product),
  ]);
}

export function resolvePrimaryProductImageData(product: ProductLike): ProductImage | undefined {
  return selectPrimaryProductImage(resolveProductGallery(product));
}

export function toResolvedProductImage(image: ProductImage): ResolvedProductImage {
  return {
    src: image.url,
    alt: image.alt,
    source: image.source,
    isPreview: image.role === 'artwork',
    role: image.role,
  };
}

export function resolveProductImage(product: ProductLike): ResolvedProductImage {
  const primary = resolvePrimaryProductImageData(product);

  if (primary) {
    return toResolvedProductImage(primary);
  }

  return {
    src: neutralPlaceholder(product.name),
    alt: `${product.name} preview placeholder`,
    source: 'placeholder',
    isPreview: true,
    role: 'unknown',
  };
}
