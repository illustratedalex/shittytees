import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GarmentMockup from '@/components/product/GarmentMockup';

describe('GarmentMockup', () => {
  it('renders accessible svg title when non-decorative', () => {
    render(
      <GarmentMockup
        decorative={false}
        ariaLabel="Front shirt visual"
        artworkText="TEST ART"
        artworkPlacement="center"
      />,
    );

    expect(screen.getByRole('img', { name: 'Front shirt visual' })).toBeInTheDocument();
    expect(screen.getByText('TEST ART')).toBeInTheDocument();
  });

  it('renders back-view artwork placement without crashing', () => {
    render(
      <GarmentMockup
        view="back"
        artworkText="BACK PRINT"
        artworkPlacement="center"
      />,
    );

    expect(screen.getByText('BACK PRINT')).toBeInTheDocument();
  });
});
