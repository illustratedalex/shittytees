import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const redirectMock = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));

const requireAdminSessionMock = vi.hoisted(() => vi.fn());
const getCatalogRepositoryMock = vi.hoisted(() => vi.fn());
const queryMock = vi.hoisted(() => vi.fn());
const syncPrintfulCatalogMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock('@/lib/admin/auth', () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock('@/lib/catalog', () => ({
  getCatalogRepository: getCatalogRepositoryMock,
}));

vi.mock('@/lib/orders/database', () => ({
  query: queryMock,
}));

vi.mock('@/lib/printful/catalogSync', () => ({
  syncPrintfulCatalog: syncPrintfulCatalogMock,
}));

import AdminPrintfulPage from '@/app/admin/printful/page';

describe('admin printful page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated requests to the admin login flow', async () => {
    requireAdminSessionMock.mockRejectedValueOnce(new Error('Not authenticated'));

    await expect(AdminPrintfulPage()).rejects.toThrow('REDIRECT:/admin/login');
    expect(redirectMock).toHaveBeenCalledWith('/admin/login');
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('renders the review queue for authenticated admins', async () => {
    requireAdminSessionMock.mockResolvedValueOnce(undefined);
    getCatalogRepositoryMock.mockReturnValue({
      listAll: vi.fn().mockResolvedValue([
        {
          id: 'prod-1',
          printfulProductId: '123',
          publishStatus: 'draft',
        },
      ]),
      getLastSyncRun: vi.fn().mockResolvedValue({
        id: 1,
        startedAt: new Date('2026-08-01T00:00:00.000Z'),
        completedAt: new Date('2026-08-01T01:00:00.000Z'),
        status: 'completed',
        checked: 1,
        created: 0,
        updated: 0,
        unchanged: 1,
        failed: 0,
        errors: [],
      }),
    });

    queryMock
      .mockResolvedValueOnce([
        {
          id: 'prod-1',
          slug: 'printful-review-tee',
          printful_product_id: 123,
          printful_external_id: null,
          new_from_printful: true,
          name: 'Printful Review Tee',
          short_description: 'Fresh from Printful',
          description: 'Review me',
          collection_slug: 'archive',
          publish_status: 'draft',
          featured: false,
          retail_price: 34,
          currency: 'USD',
          images: [{ id: 'img-1', src: 'https://example.com/review.jpg', alt: 'Review tee' }],
          tags: ['new-from-printful'],
          created_at: new Date('2026-08-01T00:00:00.000Z'),
          updated_at: new Date('2026-08-01T00:00:00.000Z'),
          printful_last_synced_at: null,
          seo_title: null,
          seo_description: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          product_id: 'prod-1',
          size: 'L',
          color: 'Black',
        },
      ]);

    const markup = renderToStaticMarkup(await AdminPrintfulPage());

    expect(markup).toContain('PRINTFUL PRODUCTS');
    expect(markup).toContain('Waiting for Review');
    expect(markup).toContain('Printful Review Tee');
    expect(queryMock).toHaveBeenCalledTimes(2);
  });
});