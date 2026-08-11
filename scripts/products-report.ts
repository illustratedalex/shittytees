import { getAllProducts } from '@/lib/data/products';
import { evaluateProductReadiness } from '@/lib/catalog/productReadiness';

async function main() {
  const report = getAllProducts()
    .map((product) => evaluateProductReadiness(product))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(JSON.stringify({
    total: report.length,
    products: report,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
