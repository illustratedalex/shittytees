import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LogoMark, Wordmark } from '@/components/brand';

describe('brand components', () => {
  it('renders Wordmark text and optional slash mark', () => {
    const { rerender } = render(<Wordmark showMark as="p" />);

    expect(screen.getByLabelText('ShittyTees')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();

    rerender(<Wordmark showMark={false} as="p" />);
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('renders non-decorative LogoMark with accessible title', () => {
    render(<LogoMark decorative={false} title="Brand glyph" />);

    expect(screen.getByRole('img', { name: 'Brand glyph' })).toBeInTheDocument();
  });
});
