import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/auth';
import { getCatalogRepository } from '@/lib/catalog';
import { query } from '@/lib/orders/database';

export async function GET(_request: NextRequest) {
  try {
    await requireAdminSession();

    const repository = getCatalogRepository();
    const allProducts = await repository.listAll();
    const lastSync = await repository.getLastSyncRun();

    const draftCount = allProducts.filter((product) => product.publishStatus === 'draft').length;
    const newDraftCountResult = await query<{ count: number }>(
      `
        SELECT count(*)::int AS count
        FROM catalog_products
        WHERE publish_status = 'draft'
          AND printful_product_id IS NOT NULL
          AND new_from_printful = TRUE
      `,
    );
    const newDraftCount = newDraftCountResult[0]?.count || 0;

    return NextResponse.json({
      lastSync,
      productCount: allProducts.length,
      draftCount,
      newDraftCount,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
