import { getProductBySlug } from '@/lib/data/products';
import { resolvePrimaryProductImageData, resolveProductGallery } from '@/lib/products/imageResolver';

function redactUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  return `${url.hostname}${url.pathname}`;
}

function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error('Usage: npm run product:images -- <product-slug>');
    process.exit(1);
  }

  const product = getProductBySlug(slug);
  if (!product) {
    console.error(`Product not found: ${slug}`);
    process.exit(1);
  }

  const primary = resolvePrimaryProductImageData(product);
  const gallery = resolveProductGallery(product);

  console.log(`Product: ${product.name}`);
  console.log(`Slug: ${product.slug}`);
  console.log('');

  console.log('Primary:');
  if (primary) {
    console.log(`${primary.role} ${redactUrl(primary.url)}`);
  } else {
    console.log('none');
  }

  console.log('');
  console.log('Gallery:');
  if (!gallery.length) {
    console.log('none');
    return;
  }

  gallery.forEach((image, index) => {
    console.log(`${index + 1}. ${image.role} ${redactUrl(image.url)}`);
  });
}

main();
