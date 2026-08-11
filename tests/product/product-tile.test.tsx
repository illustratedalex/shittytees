import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductTile from '@/components/product/ProductTile';
import type { MerchProduct } from '@/components/product/types';

const baseProduct: MerchProduct = {
  id: 'prod-test-1',
  slug: 'test-shirt',
  name: 'Test Shirt',
  shortDescription: 'Test short copy',
  description: 'Test description',
  category: 'T-Shirts',
  collectionSlug: 'dark-humor',
  retailPrice: 35,
  currency: 'USD',
  featured: true,
  images: [
    {
      id: 'img-1',
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
      alt: 'Test Shirt image',
    },
  ],
  variants: [
    {
      id: 'variant-1',
      color: 'Black',
      colorHex: '#000000',
    },
  ],
};

describe('ProductTile', () => {
  it('renders link to product page and descriptor', () => {
    render(<ProductTile product={baseProduct} descriptor="T-Shirts" />);

    const link = screen.getByRole('link', { name: 'View Test Shirt' });
    expect(link).toHaveAttribute('href', '/shop/test-shirt');
    expect(screen.getAllByText('T-Shirts').length).toBeGreaterThan(0);
  });

  it('renders image fallback when mockup is disabled', () => {
    render(<ProductTile product={baseProduct} useMockup={false} />);

    expect(screen.getByAltText('Test Shirt image')).toBeInTheDocument();
  });
});
