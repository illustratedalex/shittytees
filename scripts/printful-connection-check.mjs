// Temporary read-only Preview diagnostics. Remove after collecting results.
if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'stripe-printful-migration-audit') {
  console.log('PRINTFUL_CONNECTION_CHECK ' + JSON.stringify({ skipped: true }));
} else {
  const token = process.env.PRINTFUL_API_TOKEN?.trim();
  const storeId = process.env.PRINTFUL_STORE_ID?.trim();
  const report = { tokenConfigured: Boolean(token), storeConfigured: Boolean(storeId), endpoints: [] };
  if (token && storeId) {
    for (const path of ['/stores', '/store', '/sync/products?limit=100', '/store/products?limit=100', '/products/71']) {
      try {
        const response = await fetch('https://api.printful.com' + path, {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token, 'X-PF-Store-Id': storeId },
          signal: AbortSignal.timeout(20000),
        });
        const payload = await response.json().catch(() => null);
        const entry = { path, httpStatus: response.status };
        if (response.ok && path === '/stores' && Array.isArray(payload?.result)) {
          entry.store = payload.result.filter(s => String(s.id) === storeId).map(s => ({ id: s.id, name: s.name, type: s.type }));
        } else if (response.ok && path === '/store') {
          entry.store = { id: payload?.result?.id, name: payload?.result?.name, type: payload?.result?.type };
        } else if (response.ok && path.includes('products?') && Array.isArray(payload?.result)) {
          entry.products = payload.result.map(p => ({ id: p.id, name: p.name, externalId: p.external_id, variants: p.variants, synced: p.synced }));
        } else if (response.ok && path === '/products/71') {
          entry.product = { id: payload?.result?.product?.id, name: payload?.result?.product?.model, type: payload?.result?.product?.type, files: payload?.result?.product?.files };
          entry.variants = (payload?.result?.variants || []).filter(v => ['Black', 'Asphalt', 'Dark Grey Heather'].includes(v.color) && ['S', 'M', 'L', 'XL', '2XL', '3XL'].includes(v.size)).map(v => ({ id: v.id, size: v.size, color: v.color, availabilityStatus: v.availability_status, inStock: v.in_stock, price: v.price }));
        }
        report.endpoints.push(entry);
      } catch {
        report.endpoints.push({ path, networkOrTimeoutFailure: true });
      }
    }
  }
  console.log('PRINTFUL_CONNECTION_CHECK ' + JSON.stringify(report));
}
