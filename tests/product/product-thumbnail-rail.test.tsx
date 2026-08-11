import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductThumbnailRail from '@/components/product/ProductThumbnailRail';
import type { ProductImage } from '@/lib/products/imageResolver';

function image(url: string, role: ProductImage['role']): ProductImage {
  return {
    url,
    role,
    source: 'printful',
    alt: `${role} image`,
  };
}

describe('ProductThumbnailRail', () => {
  it('one image produces no redundant thumbnail rail', () => {
    const { container } = render(
      <ProductThumbnailRail images={[image('https://cdn.example.com/front.png', 'front-flat')]} selectedIndex={0} onSelect={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('two images produce two thumbnails', () => {
    render(
      <ProductThumbnailRail
        images={[
          image('https://cdn.example.com/front.png', 'front-flat'),
          image('https://cdn.example.com/back.png', 'back-flat'),
        ]}
        selectedIndex={0}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
