import Image from 'next/image';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin/auth';
import { getCatalogRepository } from '@/lib/catalog';
import { query } from '@/lib/orders/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type AdminProductRow = {
  id: string;
  slug: string;
  printful_product_id: number | null;
  printful_external_id: string | null;
  new_from_printful: boolean;
  name: string;
  short_description: string;
  description: string;
  collection_slug: string;
  publish_status: 'published' | 'draft' | 'archive' | 'disabled';
  featured: boolean;
  retail_price: number;
  currency: string;
  images: Array<{ id: string; src: string; alt: string }>;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  printful_last_synced_at: Date | null;
  seo_title: string | null;
  seo_description: string | null;
};

type VariantSummaryRow = {
  product_id: string;
  size: string;
  color: string;
};

function statusClass(status: AdminProductRow['publish_status']): string {
  if (status === 'published') return 'text-[#65d777] border-[#65d77755]';
  if (status === 'archive') return 'text-[#9f9787] border-[#9f978755]';
  if (status === 'disabled') return 'text-[#ff8a8a] border-[#ff8a8a55]';
  return 'text-[#ffd75a] border-[#ffd75a55]';
}

function displayPrintfulId(product: AdminProductRow): string {
  if (product.printful_external_id) return product.printful_external_id;
  if (product.printful_product_id) return String(product.printful_product_id);
  return 'Not linked';
}

function displaySyncProductId(product: AdminProductRow): string {
  if (product.printful_product_id) return String(product.printful_product_id);
  return 'Not linked';
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

async function publishProductAction(formData: FormData) {
  'use server';

  await requireAdminSession();
  const id = String(formData.get('id') || '').trim();
  if (!id) return;

  await query(
    `
      UPDATE catalog_products
      SET
        publish_status = 'published',
        active = TRUE,
        featured = featured,
        new_from_printful = FALSE,
        tags = (
          SELECT COALESCE(jsonb_agg(value), '[]'::jsonb)
          FROM jsonb_array_elements_text(tags) AS value
          WHERE value <> 'new-from-printful'
        ),
        updated_at = NOW()
      WHERE id = $1
    `,
    [id],
  );

  revalidatePath('/admin/printful');
  revalidatePath('/shop');
  revalidatePath('/');
}

async function archiveProductAction(formData: FormData) {
  'use server';

  await requireAdminSession();
  const id = String(formData.get('id') || '').trim();
  if (!id) return;

  await query(
    `
      UPDATE catalog_products
      SET
        publish_status = 'archive',
        active = FALSE,
        new_from_printful = FALSE,
        tags = (
          SELECT COALESCE(jsonb_agg(value), '[]'::jsonb)
          FROM jsonb_array_elements_text(tags) AS value
          WHERE value <> 'new-from-printful'
        ),
        updated_at = NOW()
      WHERE id = $1
    `,
    [id],
  );

  revalidatePath('/admin/printful');
  revalidatePath('/shop');
  revalidatePath('/');
}

async function editProductAction(formData: FormData) {
  'use server';

  await requireAdminSession();

  const id = String(formData.get('id') || '').trim();
  if (!id) return;

  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const shortDescription = String(formData.get('shortDescription') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const collectionSlug = String(formData.get('collectionSlug') || '').trim();
  const seoTitleValue = String(formData.get('seoTitle') || '').trim();
  const seoDescriptionValue = String(formData.get('seoDescription') || '').trim();
  const featured = formData.get('featured') === 'on';

  const retailPriceRaw = String(formData.get('retailPrice') || '').trim();
  const retailPriceParsed = Number(retailPriceRaw);
  const retailPrice = Number.isFinite(retailPriceParsed) ? retailPriceParsed : 0;

  if (!name || !slug || !shortDescription || !description || !collectionSlug || retailPrice <= 0) {
    return;
  }

  await query(
    `
      UPDATE catalog_products
      SET
        name = $2,
        slug = $3,
        short_description = $4,
        description = $5,
        retail_price = $6,
        base_price = $6,
        collection_slug = $7,
        seo_title = $8,
        seo_description = $9,
        featured = $10,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      name,
      slug,
      shortDescription,
      description,
      retailPrice,
      collectionSlug,
      seoTitleValue || null,
      seoDescriptionValue || null,
      featured,
    ],
  );

  revalidatePath('/admin/printful');
  revalidatePath('/shop');
  revalidatePath(`/shop/${slug}`);
}

export default async function AdminPrintfulPage({
  searchParams,
}: {
  searchParams?: Promise<{ sync?: string }>;
} = {}) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }

  const params = (await searchParams) || {};
  const syncStatus = params.sync;

  const repository = getCatalogRepository();
  const [allProducts, lastSync, productRows, variantRows] = await Promise.all([
    repository.listAll(),
    repository.getLastSyncRun(),
    query<AdminProductRow>(
      `
        SELECT
          id,
          slug,
          printful_product_id,
          printful_external_id,
          new_from_printful,
          name,
          short_description,
          description,
          collection_slug,
          publish_status,
          featured,
          retail_price,
          currency,
          images,
          tags,
          created_at,
          updated_at,
          printful_last_synced_at,
          seo_title,
          seo_description
        FROM catalog_products
        ORDER BY updated_at DESC
      `,
    ),
    query<VariantSummaryRow>(
      `
        SELECT product_id, size, color
        FROM catalog_variants
      `,
    ),
  ]);

  const variantsByProduct = new Map<string, VariantSummaryRow[]>();
  for (const row of variantRows) {
    const list = variantsByProduct.get(row.product_id) || [];
    list.push(row);
    variantsByProduct.set(row.product_id, list);
  }

  const printfulProducts = allProducts.filter((product) => Boolean(product.printfulProductId));
  const publishedCount = allProducts.filter((product) => product.publishStatus === 'published').length;
  const archivedCount = allProducts.filter((product) => product.publishStatus === 'archive').length;
  const waitingForReviewCount = productRows.filter(
    (product) => product.publish_status === 'draft' && product.new_from_printful === true && product.printful_product_id !== null,
  ).length;

  const queueProducts = productRows.filter(
    (product) => product.publish_status === 'draft' && product.new_from_printful === true && product.printful_product_id !== null,
  );

  return (
    <main className="min-h-screen bg-[#0e0d0c] pt-[7rem] sm:pt-[7.5rem] px-5 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="panel-soft p-5 sm:p-6 border border-[#f2ecde1f] rounded-sm">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#37d5d6]">Admin</p>
          <h1 className="mt-2 text-[#f2ecde] text-[1.9rem] sm:text-[2.3rem] leading-[1]">PRINTFUL PRODUCTS</h1>
          <p className="mt-3 text-[#c9beaa] max-w-[56ch]">New shirts discovered in Printful and waiting for review.</p>

          {syncStatus === 'success' ? (
            <p className="mt-3 rounded-sm border border-[#65d77755] bg-[#122417] px-3 py-2 text-sm text-[#9af2aa]">
              Printful sync completed.
            </p>
          ) : null}

          {syncStatus === 'error' ? (
            <p className="mt-3 rounded-sm border border-[#ff8a8a55] bg-[#2a1515] px-3 py-2 text-sm text-[#ffc2c2]">
              Printful sync failed. Please retry and check server logs for details.
            </p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="panel-soft p-3 border border-[#f2ecde1f] rounded-sm">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9f9787]">Printful Products</p>
              <p className="mt-2 text-[#f2ecde] text-xl font-semibold">{printfulProducts.length}</p>
            </div>
            <div className="panel-soft p-3 border border-[#f2ecde1f] rounded-sm">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9f9787]">Published</p>
              <p className="mt-2 text-[#f2ecde] text-xl font-semibold">{publishedCount}</p>
            </div>
            <div className="panel-soft p-3 border border-[#f2ecde1f] rounded-sm">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9f9787]">Waiting for Review</p>
              <p className="mt-2 text-[#f2ecde] text-xl font-semibold">{waitingForReviewCount}</p>
            </div>
            <div className="panel-soft p-3 border border-[#f2ecde1f] rounded-sm">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9f9787]">Archived</p>
              <p className="mt-2 text-[#f2ecde] text-xl font-semibold">{archivedCount}</p>
            </div>
            <div className="panel-soft p-3 border border-[#f2ecde1f] rounded-sm">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9f9787]">Last Sync</p>
              <p className="mt-2 text-[#f2ecde] text-sm font-medium">
                {lastSync?.completedAt ? new Date(lastSync.completedAt).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>

          <form action="/api/admin/printful/sync" method="post" className="mt-5">
            <button type="submit" className="btn-primary text-[0.75rem] tracking-[0.16em] uppercase px-5 py-2.5">
              [ SYNC PRINTFUL NOW ]
            </button>
          </form>
        </header>

        <section className="space-y-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#37d5d6]">Inbox</p>
            <h2 className="mt-2 text-[#f2ecde] text-[1.45rem] leading-[1.05]">NEW FROM PRINTFUL</h2>
          </div>

          {queueProducts.length === 0 ? (
            <div className="panel-soft p-6 border border-[#f2ecde1f] rounded-sm text-[#c9beaa]">No new draft products waiting for review.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {queueProducts.map((product) => {
                const variants = variantsByProduct.get(product.id) || [];
                const colors = unique(variants.map((variant) => variant.color).filter(Boolean));
                const sizes = unique(variants.map((variant) => variant.size).filter(Boolean));
                const mockup = product.images[0];

                return (
                  <article key={product.id} className="panel-soft border border-[#f2ecde22] rounded-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                      <div className="border border-[#f2ecde24] rounded-sm bg-[#131210] min-h-[220px] overflow-hidden flex items-center justify-center">
                        {mockup?.src ? (
                          <Image
                            src={mockup.src}
                            alt={mockup.alt || `${product.name} mockup`}
                            width={420}
                            height={540}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="text-[#9f9787] text-[0.8rem] tracking-[0.08em] uppercase text-center px-3">IMAGE COMING SOON</div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[0.62rem] uppercase tracking-[0.2em] border px-2 py-1 rounded-sm ${statusClass(product.publish_status)}`}>
                            {product.publish_status === 'archive' ? 'ARCHIVED' : product.publish_status.toUpperCase()}
                          </span>
                          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-[#9f9787]">ID {product.id}</span>
                        </div>

                        <h3 className="text-[#f2ecde] text-[1.2rem] leading-[1.1]">{product.name}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.88rem] text-[#c9beaa]">
                          <p><span className="text-[#9f9787]">Printful Sync Product ID:</span> {displaySyncProductId(product)}</p>
                          <p><span className="text-[#9f9787]">Current Price:</span> {product.currency} {Number(product.retail_price).toFixed(2)}</p>
                          <p><span className="text-[#9f9787]">Available Colors:</span> {colors.length ? colors.join(', ') : '—'}</p>
                          <p><span className="text-[#9f9787]">Available Sizes:</span> {sizes.length ? sizes.join(', ') : '—'}</p>
                          <p><span className="text-[#9f9787]">Date Discovered:</span> {new Date(product.created_at).toLocaleDateString()}</p>
                          <p><span className="text-[#9f9787]">Last Synced:</span> {product.printful_last_synced_at ? new Date(product.printful_last_synced_at).toLocaleString() : 'Never'}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <details className="group w-full">
                            <summary className="inline-flex cursor-pointer select-none btn-secondary px-3 py-2 text-[0.72rem] uppercase tracking-[0.16em]">[ EDIT ]</summary>
                            <div className="mt-3 border border-[#f2ecde22] rounded-sm p-3 space-y-4">
                              <div>
                                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#37d5d6]">SHITTYTEES DETAILS</p>
                                <p className="text-[0.8rem] text-[#9f9787]">editable</p>
                              </div>

                              <form action={editProductAction} className="space-y-3">
                                <input type="hidden" name="id" value={product.id} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <label className="text-[0.8rem] text-[#c9beaa]">Product Title
                                    <input name="name" defaultValue={product.name} className="mt-1 w-full min-h-[40px] px-3 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                  </label>
                                  <label className="text-[0.8rem] text-[#c9beaa]">Slug
                                    <input name="slug" defaultValue={product.slug} className="mt-1 w-full min-h-[40px] px-3 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                  </label>
                                </div>

                                <label className="block text-[0.8rem] text-[#c9beaa]">Short Description
                                  <textarea name="shortDescription" defaultValue={product.short_description} className="mt-1 w-full min-h-[64px] px-3 py-2 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                </label>

                                <label className="block text-[0.8rem] text-[#c9beaa]">Full Description
                                  <textarea name="description" defaultValue={product.description} className="mt-1 w-full min-h-[110px] px-3 py-2 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <label className="text-[0.8rem] text-[#c9beaa]">Price
                                    <input name="retailPrice" type="number" min="0" step="0.01" defaultValue={Number(product.retail_price)} className="mt-1 w-full min-h-[40px] px-3 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                  </label>
                                  <label className="text-[0.8rem] text-[#c9beaa]">Collection
                                    <input name="collectionSlug" defaultValue={product.collection_slug} className="mt-1 w-full min-h-[40px] px-3 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                  </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <label className="text-[0.8rem] text-[#c9beaa]">SEO Title
                                    <input name="seoTitle" defaultValue={product.seo_title || ''} className="mt-1 w-full min-h-[40px] px-3 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                  </label>
                                  <label className="text-[0.8rem] text-[#c9beaa]">SEO Description
                                    <input name="seoDescription" defaultValue={product.seo_description || ''} className="mt-1 w-full min-h-[40px] px-3 bg-[#12110f] border border-[#f2ecde2e] rounded text-[#f2ecde]" />
                                  </label>
                                </div>

                                <label className="inline-flex items-center gap-2 text-[0.8rem] text-[#c9beaa]">
                                  <input type="checkbox" name="featured" defaultChecked={product.featured} />
                                  Featured Status
                                </label>

                                <button type="submit" className="btn-primary px-3 py-2 text-[0.72rem] uppercase tracking-[0.16em]">Save Edits</button>
                              </form>

                              <div>
                                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#ffd75a]">PRINTFUL DETAILS</p>
                                <p className="text-[0.8rem] text-[#9f9787]">read-only</p>
                                <div className="mt-1 text-[0.84rem] text-[#c9beaa] space-y-1">
                                  <p>Printful Sync Product ID: {displaySyncProductId(product)}</p>
                                  <p>Printful External ID: {displayPrintfulId(product)}</p>
                                  <p>Variant Count: {variants.length}</p>
                                  <p>Operational fields are managed by sync only.</p>
                                </div>
                              </div>
                            </div>
                          </details>

                          <form action={publishProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <button type="submit" className="btn-primary px-3 py-2 text-[0.72rem] uppercase tracking-[0.16em]">[ PUBLISH ]</button>
                          </form>

                          <form action={archiveProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <button type="submit" className="btn-secondary px-3 py-2 text-[0.72rem] uppercase tracking-[0.16em]">[ ARCHIVE ]</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
